import { Request, Response } from 'express';
import * as adk from '../utils/adk';
import { enviarMensajeWhatsApp } from '../utils/whatsapp';
import { extractGoogleMapsUrl } from '../utils/gmaps';
import { obtenerUrlMedia } from '../utils/image';
import config from '../config/config';

// ----------------------- Endpoint principal -----------------------

export const gestionarMensajes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;
    if (body?.object !== "whatsapp_business_account") {
      return res.sendStatus(404);
    }

    const entries = body.entry;
    if (!Array.isArray(entries)) {
      return res.sendStatus(400);
    }

    for (const entry of entries) {
      if (!Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        const messages = change?.value?.messages;
        if (!Array.isArray(messages)) continue;

        for (const message of messages) {
          try {

            const ahora = Math.floor(Date.now() / 1000);
            const timestampStr = message.timestamp;
            if (timestampStr) {
              const ts = parseInt(timestampStr, 10);
              if (!isNaN(ts) && ahora - ts > 60) {
                console.warn(
                  `Mensaje descartado por retraso (${ahora - ts}s) de ${message.from}`
                );
                continue;
              }
            }

            const numeroEntrada = message.from as string;

            //el servicio de agente esta apagado
            if(!config.agent_service){
              await enviarMensajeWhatsApp(numeroEntrada, "Mi servicio no se encuentra disponible en este momento. Disculpe las molestias")
              continue;
            }

            //el numero de entrada esta vacio
            if (!numeroEntrada) {
              console.warn("Número de origen no definido. Se omite.");
              continue;
            }

            // 1) Intentar extraer URL de Google Maps
            const mapsUrl = extractGoogleMapsUrl(message);
            if (mapsUrl) {
              adk.reiniciarTemporizadorYEncolar(numeroEntrada, "Google Maps link: "+ mapsUrl);
              continue;
            }

            // 2) Procesar imagen (extraer URL temporal de descarga)
            if (message.type === "image" && message.image?.id) {
              const mediaId = message.image.id;
              const accessToken = process.env.ACCESS_TOKEN as string;

              const mediaUrl = await obtenerUrlMedia(mediaId, accessToken);
              if (mediaUrl) {
                adk.reiniciarTemporizadorYEncolar(numeroEntrada, "image link: "+mediaUrl);
              } else {
                console.warn("No se pudo obtener la URL de la imagen.");
              }
              continue;
            }

            // 3) procesar como texto normal
            const mensajeTexto = message.text?.body as string | undefined;
            if (mensajeTexto) {
              const palabras = adk.countWords(mensajeTexto);
              const caracteres = mensajeTexto.length;

              if (palabras > adk.MAX_WORDS || caracteres > adk.MAX_CHARS) {
                console.warn(
                  `Mensaje descartado por exceder límites (${palabras} palabras, ${caracteres} caracteres) de ${numeroEntrada}`
                );
                try {
                  await enviarMensajeWhatsApp(
                    numeroEntrada,
                    "Su mensaje excede el límite de 50 palabras (≈220 caracteres) y no fue procesado. Por favor envíe un texto más corto."
                  );
                } catch (notifyErr) {
                  console.error(
                    "Error al notificar al usuario sobre límite de longitud:",
                    notifyErr
                  );
                }
                continue;
              }

              adk.reiniciarTemporizadorYEncolar(numeroEntrada, mensajeTexto);
              continue;
            }

            // 4) Si no hay nada procesable
            console.warn("Mensaje sin texto, imagen ni link de Google Maps. Se omite.");
            await enviarMensajeWhatsApp(numeroEntrada, "Lo siento, no puedo escuchar audios ni entender imágenes. Por favor, utiliza solo texto.")
          } catch (innerErr) {
            console.error("Error interno procesando un mensaje:", innerErr);
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error en gestionar el mensaje al agente:", error);
    return res.status(500).send("Error interno del servidor");
  }
};

export const gestionarVerificacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const query = req.query as {
            'hub.mode': string;
            'hub.verify_token': string;
            'hub.challenge': string;
        };

        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            return res.status(200).send(challenge);
        } else {
            return res.status(403).send('Token inválido');
        }
    } catch (error) {
        console.error('Error en verificación del webhook:', error);
        return res.status(500).send('Error interno del servidor');
    }
};

export const toggleActivity = async (req: Request, res: Response) => {
    config.agent_service = !config.agent_service

    if(config.agent_service){
      res.status(200).json("Servicio de agente encendido correctamente")
    }else{
      res.status(200).json("Servicio de agente apagado correctamente")
    }
}