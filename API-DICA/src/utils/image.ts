import { pool } from '../config/db';

//procesa el mensaje de la imagen y obtiene la URL asociada como string

export async function obtenerUrlMedia(mediaId: string, accessToken: string): Promise<string | null> {
  const endpoint = `https://graph.facebook.com/v20.0/${mediaId}`;

  try {
    const resp = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!resp.ok) {
      console.error(`Error al obtener media (${resp.status}):`, await resp.text());
      return null;
    }

    const data = await resp.json();
    return data.url || null;
  } catch (err) {
    console.error("Error al hacer fetch de media:", err);
    return null;
  }
}

// Función para descargar la imagen desde la URL
export async function descargarImagen(mediaUrl: string, accessToken: string): Promise<Buffer | null> {
  try {
    const resp = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) {
      console.error('Error al descargar la imagen:', resp.status);
      return null;
    }
    const arrayBuffer = await resp.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('Error al fetch de imagen:', err);
    return null;
  }
}

// Función para subir imagen a Dropbox
export async function subirADropbox(
  nombreArchivo: string,
  bufferImagen: Buffer,
  dropboxToken: string
): Promise<string | null> {
  const dropboxEndpoint = "https://content.dropboxapi.com/2/files/upload";

  try {
    const resp = await fetch(dropboxEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${dropboxToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path: `/${nombreArchivo}`, // ruta y nombre en Dropbox
          mode: "add",
          autorename: true,
          mute: false,
        }),
      },
      body: bufferImagen,
    });

    if (!resp.ok) {
      console.error("Error al subir a Dropbox:", await resp.text());
      return null;
    }

    const data = await resp.json();
    // Retorna la ruta compartida de la imagen
    return data.path_display || null;
  } catch (err) {
    console.error("Error al subir a Dropbox:", err);
    return null;
  }
}
