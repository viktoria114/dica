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

          var mensajeADK, agenteAutor

          //conflicto con el numero shiojano
          if (numeroEntrada.startsWith("549380")) {
            numeroEntrada = numeroEntrada.replace("549380", "5438015");
          }

          //TODO:
          //1. Consulta a DB empleado por TEL.
          const consultaEmpleados = await pool.query(`SELECT * FROM empleados WHERE telefono = $1`, [numeroEntrada]);

          //2. Si no existe, buscar cliente por tel
          if (consultaEmpleados.rows.length === 0){
            const consultaClientes = await pool.query(`SELECT * FROM clientes WHERE telefono = $1`, [numeroEntrada]);

          //si tampoco existe. Crear un nuevo cliente y mandar el sessionState para que el agente sepa que es nuevo
            if (consultaClientes.rows.length === 0){

                const respADK = await enviarPrimerMensajeAdk(numeroEntrada, mensajeTexto)
                  mensajeADK = respADK.texto
                  agenteAutor = respADK.autor
                //si existe, envia un POST a adk especificando los datos en el sessionState
                }else{
                  //resultado cliente de la consulta
                  const res = consultaClientes.rows[0]

                  const cliente = new Cliente(
                    res.id,
                    res.nombre,
                    res.telefono,
                    res.preferencia,
                    res.agent_session_id
                  ) 

                  const respADK = await enviarMensajeAdk(mensajeTexto, cliente)
                  mensajeADK = respADK.texto
                  agenteAutor = respADK.autor
                }
            }
          if (numeroEntrada && mensajeTexto) {
            //para testeo se hace un echo
            console.log(`Mensaje recibido de ${numeroEntrada}: ${mensajeTexto}`);
            await enviarMensajeWhatsApp(numeroEntrada, mensajeADK);
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
    cliente: Cliente,
    clienteNuevo: boolean
  ): Promise<void> => {

    const sessionID: string = crypto.randomUUID();
    cliente.agentSessionID = sessionID

    var statePayload

    if (clienteNuevo){
      statePayload = {
          "state":{
            "client_information":{
              "nombre":cliente.nombre,
              "telefono": cliente.telefono,
              "preferencia":cliente.preferencia,
              "tipo":"cliente nuevo",
            }
          }
        }
      }else{
      statePayload = {
          "state":{
            "client_information":{
              "nombre":cliente.nombre,
              "telefono": cliente.telefono,
              "preferencia":cliente.preferencia,
              "tipo":"cliente regular",
            }
          }
        }
      }
  const url = `http://localhost:8000/apps/agente_dica/users/${cliente.telefono}/sessions/${sessionID}`;

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
      
      const query = `
        UPDATE clientes 
        SET agent_session_id = $1
        WHERE id = $2;
      `

      const valores = [sessionID, cliente.id]
      const r = await pool.query(query, valores);

      if (r && r.rowCount && r.rowCount > 0) {
        console.log("agent_session_id updated successfully");
      } else {
        console.log("sessionID:", sessionID)
        console.log("clientID:", cliente.id)
        throw error("error al actualizar la agent_session_id en la base de datos")
      }

    } catch (err) {
      console.error('Error de red al intentar crear la sesión:', err);
      return undefined;
    }
};

export const enviarMensajeAdk = async (
  mensaje: string,
  cliente: Cliente,
  intento: number = 1
): Promise<any> => {
  const messagePayload = {
    appName: "agente_dica",
    userId: `${cliente.telefono}`,
    sessionId: `${cliente.agentSessionID}`,
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
          await crearSessionAdk(cliente, false);
          return await enviarMensajeAdk(mensaje, cliente, intento + 1);
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

    console.log(texto)
    console.log(autor)

    return {texto, autor};

  } catch (err) {
    console.error('Error de red al intentar enviar el mensaje:', err);
    return undefined;
  }
};

export const enviarPrimerMensajeAdk = async (tel: string, mensaje: string): Promise<any> => {
  try {
    const nuevoCliente = new Cliente(null, "none", tel, "none", null);

    const query = `
      INSERT INTO clientes (nombre, telefono, preferencia, ultima_compra, visibilidad, agent_session_id)
      VALUES ($1, $2, $3, $4, $5, $6);
    `

    const values = [
      nuevoCliente.nombre,
      nuevoCliente.telefono,
      nuevoCliente.preferencia,
      nuevoCliente.ultimaCompra,
      nuevoCliente.visibilidad,
      nuevoCliente.agentSessionID
    ];

    const resultado = await pool.query(query, values);

    if (resultado && resultado.rowCount && resultado.rowCount > 0) {
      console.log("Nuevo cliente creado exitosamente en la DB");
    } else {
      console.log("fallo al crear al nuevo cliente en la base de datos");
      return
    }
    await crearSessionAdk(nuevoCliente, true);
    
    const r = await enviarMensajeAdk(mensaje, nuevoCliente);

    return r

  } catch (error: any) {
    console.error("Error en enviarPrimerMensajeAdk:", error.message || error);
  }
};