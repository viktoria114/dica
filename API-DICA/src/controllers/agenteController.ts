import { Request, Response } from 'express';
import { pool } from '../config/db';
import { Cliente } from '../models/cliente';
import { error } from 'console';

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

export const gestionarMensajes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;

    if (body?.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    const entries = body.entry;
    if (!Array.isArray(entries)) {
      console.warn('Formato inesperado en entry');
      return res.sendStatus(400);
    }

    for (const entry of entries) {
      if (!Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        const messages = change?.value?.messages;
        const contacts = change?.value?.Contacts;

        if (Array.isArray(contacts)) {
          for (const contact of contacts) {
              const profileName = contact.Profile?.Name;
              console.log(profileName);
          }
        }

        if (!Array.isArray(messages)) continue;

        for (const message of messages) {
          var numeroEntrada = message.from;
          const mensajeTexto = message.text?.body;

          let mensajeADK: string | undefined;
          let agenteAutor: string | undefined;

          // Ajuste por número shiojano
          if (numeroEntrada.startsWith("549380")) {
            numeroEntrada = numeroEntrada.replace("549380", "5438015");
          }

          if (!numeroEntrada || !mensajeTexto) {
            console.warn("Número o mensaje de texto no definido.");
            throw error("numero de entrada o mensaje indefinido")
          }

          // Verificar si es un empleado
          const consultaEmpleados = await pool.query(`SELECT * FROM empleados WHERE telefono = $1 AND visibilidad = TRUE`, [numeroEntrada]);

          if (consultaEmpleados.rows.length > 0) {
            const empleado = consultaEmpleados.rows[0];

            const respADK = await enviarMensajeAdk(mensajeTexto, empleado.telefono, empleado.agent_session_id, false);

            mensajeADK = respADK.texto;
            agenteAutor = respADK.autor;
          } else {
            // Verificar si ya es cliente
            const existeC = await pool.query('SELECT * FROM Clientes WHERE telefono = $1;', [numeroEntrada]);
            let cliente = existeC.rows[0];

            if (!cliente) {
              // Crear nuevo cliente
              const sesionCliente = await crearSessionAdk(numeroEntrada, true);

              const crearCliente = await pool.query(
                `INSERT INTO clientes (nombre, telefono, preferencia, ultima_compra, visibilidad, agent_session_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;`,
                ["sin asignar", numeroEntrada, "sin asignar", new Date(), true, sesionCliente]
              );

              if (crearCliente.rows.length === 0) {
                throw new Error("Error al crear el cliente");
              }

              cliente = crearCliente.rows[0];
            }

            // Enviar mensaje como cliente (nuevo o existente)
            const respADK = await enviarMensajeAdk(mensajeTexto, numeroEntrada, cliente.agent_session_id, true);

            mensajeADK = respADK.texto;
            agenteAutor = respADK.autor;
          }

          // Enviar respuesta por WhatsApp
          if (mensajeADK) {
            console.log(`Mensaje recibido de ${numeroEntrada}: ${mensajeTexto}`);
            await enviarMensajeWhatsApp(numeroEntrada, mensajeADK);
          } else {
            console.warn(`No se generó respuesta para el número ${numeroEntrada}`);
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

export const enviarMensajeWhatsApp = async (to: string, mensaje: string): Promise<void> => {
  const url = `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`;
  const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: mensaje
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al enviar el mensaje (HTTP ${response.status}):`, errorText);
      } else {
        console.log(`Mensaje: ${mensaje}. Enviado a ${to}`);
      }
    } catch (err) {
      console.error('Error de red al intentar enviar el mensaje:', err);
    }
  }

export const crearSessionAdk = async (
    telefono: string,
    esCliente: boolean
  ): Promise<string | undefined> => {

    const sessionID: string = crypto.randomUUID();

    const statePayload = {"phone_number":`${telefono}`}
    var url

    if (esCliente){
      url = `http://localhost:8000/apps/agente_clientes/users/${telefono}/sessions/${sessionID}`;
    }else{
      url = `http://localhost:8000/apps/agente_empleados/users/${telefono}/sessions/${sessionID}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al crear la sesión en ADK (HTTP ${response.status}):`, errorText);
        return undefined;
      }

      else{
        var agregarSession

        if (esCliente){
          agregarSession = await pool.query(
          'UPDATE clientes SET agent_session_id = $1 WHERE telefono = $2;', [sessionID, telefono]
          )
        }
        else{
          agregarSession = await pool.query(
          'UPDATE empleados SET agent_session_id = $1 WHERE telefono = $2;', [sessionID, telefono]
          )
        }

        if (agregarSession && agregarSession.rowCount && agregarSession.rowCount > 0) {
          console.log("agent_session_id updated successfully");
          return sessionID
        } else {
          console.log("sessionID:", sessionID)
          console.log("para el telefono: ", telefono)
          throw error("error al actualizar la agent_session_id en la base de datos")
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

  var appName

  if (esCliente){
    appName = "agente_clientes"
  }
  else{
    appName = "agente_empleados"
  }

  const messagePayload = {
    appName: appName,
    userId: `${telefono}`,
    sessionId: `${agentSessionID}`,
    newMessage: {
      role: "user",
      parts: [{
        text: `${mensaje}`
      }]
    }
  };

  const url = "http://localhost:8000/run";

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);

        if (errorJson.detail === "Session not found" && intento < 2) {
          const nuevaSesion = await crearSessionAdk(telefono, esCliente);
          if (!nuevaSesion){
            throw error("faltas campos obligatorios")
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

    return {texto, autor};

  } catch (err) {
    console.error('Error de red al intentar enviar el mensaje:', err);
    return undefined;
  }
};
