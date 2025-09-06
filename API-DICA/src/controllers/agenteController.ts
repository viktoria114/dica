import { Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from '../config/db';
// Ajusta o habilita las importaciones reales según tu proyecto (pool, fetch, etc.).
// import pool from './db';

// ---- Configurables ----
const BUFFER_WINDOW_MS = parseInt(process.env.BUFFER_WINDOW_MS || '1000', 10);
const MAX_WORDS = 50;
const MAX_CHARS = Math.ceil(4.4 * MAX_WORDS);

// Mapa para la cola de mensajes de cada usuario.
const messageQueues: Map<string, string[]> = new Map();

// Mapa para guardar la referencia del temporizador de cada usuario.
const userTimers: Map<string, NodeJS.Timeout> = new Map();

/**
 * Agrega un mensaje a la cola y reinicia el temporizador de procesamiento.
 * Si el temporizador se completa, todos los mensajes agrupados para ese usuario son procesados.
 * @param numero El número de teléfono del cliente.
 * @param texto El mensaje recibido.
 */
function reiniciarTemporizadorYEncolar(numero: string, texto: string): void {
    // 1. Agregar el mensaje a la cola del usuario.
    const cola = messageQueues.get(numero) || [];
    cola.push(texto);
    messageQueues.set(numero, cola);
    console.log(`Mensaje encolado para ${numero}. Cola actual: ${cola.length} mensajes.`);

    // 2. Si ya existe un temporizador para este usuario, lo cancelamos.
    // Esta es la clave para "reiniciar" el contador.
    if (userTimers.has(numero)) {
        clearTimeout(userTimers.get(numero)!);
        console.log(`Temporizador reiniciado para ${numero}.`);
    }

    // 3. Creamos un nuevo temporizador.
    const nuevoTemporizador = setTimeout(async () => {
        // --- El siguiente código se ejecuta SOLO cuando el temporizador finalmente se cumple ---

        // Drenar la cola: obtenemos los mensajes y la vaciamos inmediatamente.
        const mensajesParaProcesar = messageQueues.get(numero) || [];
        messageQueues.delete(numero); 
        userTimers.delete(numero); 

        if (mensajesParaProcesar.length === 0) {
            return; // No hacer nada si no hay mensajes (caso borde poco probable).
        }

        const textoCombinado = mensajesParaProcesar.join(' ');

        try {
            console.log(`Temporizador cumplido para ${numero}. Procesando lote: "${textoCombinado}"`);
            await procesarMensaje(numero, textoCombinado);
        } catch (err) {
            console.error(`Error al procesar el lote de mensajes para ${numero}:`, err);
        }

    }, BUFFER_WINDOW_MS);

    // 4. Guardamos la referencia al nuevo temporizador para poder cancelarlo si llega otro mensaje.
    userTimers.set(numero, nuevoTemporizador);
}


async function procesarMensaje(numeroEntrada: string, mensajeTexto: string): Promise<void> {
    try {
        let mensajeADK: string | undefined;
        let agenteAutor: string | undefined;

        numeroEntrada = quitarPrefijo(numeroEntrada)
        
        // Verificar si es un empleado
        const consultaEmpleados = await pool.query(`SELECT * FROM empleados WHERE telefono = $1 AND visibilidad = TRUE`, [numeroEntrada]);

        if (consultaEmpleados.rows.length > 0) {
            const empleado = consultaEmpleados.rows[0];

            const respADK = await enviarMensajeAdk(mensajeTexto, empleado.telefono, empleado.agent_session_id, false);

            mensajeADK = respADK?.texto;
            agenteAutor = respADK?.autor;
        } else {
            // Verificar si ya es cliente
            const existeC = await pool.query('SELECT * FROM Clientes WHERE telefono = $1;', [numeroEntrada]);
            let cliente = existeC.rows[0];

            if (!cliente) {
                // Crear nuevo cliente
                const sesionCliente = await crearSessionAdk(numeroEntrada, true);

                const crearCliente = await pool.query(
                    `INSERT INTO clientes (telefono, nombre, dieta, ultima_compra, visibilidad, agent_session_id, preferencias)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *;`,
                    [numeroEntrada,"sin asignar", "sin asignar", new Date(), true, sesionCliente, null]
                );

                if (crearCliente.rows.length === 0) {
                    throw new Error('Error al crear el cliente');
                }

                cliente = crearCliente.rows[0];
            }

            // Enviar mensaje como cliente (nuevo o existente)
            const respADK = await enviarMensajeAdk(mensajeTexto, numeroEntrada, cliente.agent_session_id, true);

            mensajeADK = respADK?.texto;
            agenteAutor = respADK?.autor;
        }

        // Enviar respuesta por WhatsApp
        if (mensajeADK) {
            console.log(`Mensaje procesado para ${numeroEntrada}. Respuesta ADK: ${mensajeADK}`);

            //formato internacional
            numeroEntrada = transformarNumero(numeroEntrada)
            console.log("numero internacionalizado: ", numeroEntrada)
            await enviarMensajeWhatsApp(numeroEntrada, mensajeADK);
        } else {
            console.warn(`No se generó respuesta ADK para el número ${numeroEntrada}`);
        }
    } catch (err) {
        console.error('Error en procesarMensaje:', err);
    }
}
// ----------------------- Endpoint principal -----------------------

export const gestionarMensajes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;
    if (body?.object !== 'whatsapp_business_account') {
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
              if (!isNaN(ts) && (ahora - ts) > 60) {
                console.warn(`Mensaje descartado por retraso (${ahora - ts}s) de ${message.from}`);
                continue;
              }
            }

            const numeroEntrada = message.from as string;
            if (!numeroEntrada) {
              console.warn('Número de origen no definido. Se omite.');
              continue;
            }

            // 1) Intentar extraer URL de Google Maps
            const mapsUrl = extractGoogleMapsUrl(message);
            if (mapsUrl) {
              console.log("URL de Google Maps recibida:", mapsUrl);
              reiniciarTemporizadorYEncolar(numeroEntrada, mapsUrl);
              continue;
            }

            // 2) Si no es Google Maps, procesar como texto normal
            const mensajeTexto = message.text?.body as string | undefined;
            if (mensajeTexto) {
              const palabras = countWords(mensajeTexto);
              const caracteres = mensajeTexto.length;

              if (palabras > MAX_WORDS || caracteres > MAX_CHARS) {
                console.warn(
                  `Mensaje descartado por exceder límites (${palabras} palabras, ${caracteres} caracteres) de ${numeroEntrada}`
                );
                try {
                  await enviarMensajeWhatsApp(
                    numeroEntrada,
                    'Su mensaje excede el límite de 50 palabras (≈220 caracteres) y no fue procesado. Por favor envíe un texto más corto.'
                  );
                } catch (notifyErr) {
                  console.error('Error al notificar al usuario sobre límite de longitud:', notifyErr);
                }
                continue;
              }

              reiniciarTemporizadorYEncolar(numeroEntrada, mensajeTexto);
              continue;
            }

            // 3) Si no hay texto ni URL de Maps
            console.warn('Mensaje sin texto ni link de Google Maps. Se omite.');

          } catch (innerErr) {
            console.error('Error interno procesando un mensaje:', innerErr);
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('Error en gestionar el mensaje al agente:', error);
    return res.status(500).send('Error interno del servidor');
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

export const enviarMensajeWhatsApp = async (to: string, mensaje: string): Promise<void> => {
    const url = `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
            body: mensaje,
        },
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error al enviar el mensaje (HTTP ${response.status}):`, errorText);
        }
    } catch (err) {
        console.error('Error de red al intentar enviar el mensaje:', err);
    }
};

export const crearSessionAdk = async (telefono: string, esCliente: boolean): Promise<string | undefined> => {
    const sessionID: string = crypto.randomUUID();
    const statePayload = { phone_number: `${telefono}` };
    let url: string;

    if (esCliente) {
        url = `http://localhost:8000/apps/agente_clientes/users/${telefono}/sessions/${sessionID}`;
    } else {
        url = `http://localhost:8000/apps/agente_empleados/users/${telefono}/sessions/${sessionID}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(statePayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error al crear la sesión en ADK (HTTP ${response.status}):`, errorText);
            return undefined;
        } else {
            let agregarSession;

            if (esCliente) {
                agregarSession = await pool.query('UPDATE clientes SET agent_session_id = $1 WHERE telefono = $2;', [sessionID, telefono]);
            } else {
                agregarSession = await pool.query('UPDATE empleados SET agent_session_id = $1 WHERE telefono = $2;', [sessionID, telefono]);
            }

            if (agregarSession && agregarSession.rowCount && agregarSession.rowCount > 0) {
                console.log('agent_session_id updated successfully');
                return sessionID;
            } else {
                console.log('sessionID:', sessionID);
                console.log('para el telefono: ', telefono);
                throw new Error('error al actualizar la agent_session_id en la base de datos');
            }
        }
    } catch (err) {
        console.error('Error de red al intentar crear la sesión:', err);
        return undefined;
    }
};

export const enviarMensajeAdk = async (
    mensaje: string,
    telefono: string,
    agentSessionID: string,
    esCliente: boolean,
    intento: number = 1
): Promise<any> => {
    let appName: string;

    if (esCliente) {
        appName = 'agente_clientes';
    } else {
        appName = 'agente_empleados';
    }

    const messagePayload = {
        appName: appName,
        userId: `${telefono}`,
        sessionId: `${agentSessionID}`,
        newMessage: {
            role: 'user',
            parts: [
                {
                    text: `${mensaje}`,
                },
            ],
        },
    };

    const url = 'http://localhost:8000/run';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messagePayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);

                if (errorJson.detail === 'Session not found' && intento < 2) {
                    const nuevaSesion = await crearSessionAdk(telefono, esCliente);
                    if (!nuevaSesion) {
                        throw new Error('faltan campos obligatorios');
                    }
                    return await enviarMensajeAdk(mensaje, telefono, nuevaSesion, esCliente, intento + 1);
                }

                console.error(`Error al mandar un mensaje a ADK (HTTP ${response.status}):`, errorText);
            } catch (parseError) {
                console.error('Error al parsear la respuesta de error:', parseError, 'Respuesta:', errorText);
            }
            return undefined;
        }

        type ResponseElement = {
            content: {
                parts: { text: string }[];
                role: string;
            };
            author: string;
        };

        const result: ResponseElement[] = await response.json();

        const ultimoElemento = result[result.length - 1];
        const texto = ultimoElemento.content.parts[0]?.text ?? '';
        const autor = ultimoElemento.author;

        return { texto, autor };
    } catch (err) {
        console.error('Error de red al intentar enviar el mensaje:', err);
        return undefined;
    }
};

//HELPERS

function countWords(text: string): number {
    return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

function transformarNumero(numero: string): string {
  const codigoArea = numero.slice(0, 3);     // primeros 3 dígitos
  const resto = numero.slice(3);             // el resto
  return `54${codigoArea}15${resto}`;
}

function quitarPrefijo(numero: string): string {
  return numero.slice(3);
}

function extractGoogleMapsUrl(message: any): string | null {
  // Caso 1: link en el body de texto
  if (message.text?.body) {
    const body = message.text.body;
    const match = body.match(/https?:\/\/[^\s)]+/i);
    if (match && /google\.com\/maps|maps\.app\.goo\.gl|g\.page/i.test(match[0])) {
      return match[0];
    }
  }

  // Caso 2: ubicación nativa -> generar url de Google Maps
  if (message.location) {
    const lat = message.location.latitude;
    const lng = message.location.longitude;
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lng)}`;
    }
  }

  return null;
}