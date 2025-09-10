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

// Refrescar access_token usando refresh_token
async function refrescarToken(refreshToken: string, clientId: string, clientSecret: string) {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    body: params,
  });

  if (!res.ok) throw new Error(`Error al refrescar token: ${res.statusText}`);
  return await res.json(); // contiene { access_token, expires_in, ... }
}

// Función para subir imagen a Dropbox con manejo de token expirado
export async function subirADropbox(
  nombreArchivo: string,
  bufferImagen: Buffer,
  accessToken: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  const dropboxEndpoint = "https://content.dropboxapi.com/2/files/upload";

  async function intentoSubida(token: string) {
    return await fetch(dropboxEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path: `/${nombreArchivo}`,
          mode: "add",
          autorename: true,
          mute: false,
        }),
      },
      body: bufferImagen,
    });
  }

  try {
    let resp = await intentoSubida(accessToken);

    // si el token está vencido o inválido
    if (resp.status === 401) {
      const error = await resp.json().catch(() => ({}));
      if (
        error.error_summary?.includes("invalid_access_token") ||
        error.error_summary?.includes("expired_access_token")
      ) {
        console.warn("Token expirado, intentando refrescar...");
        const nuevo = await refrescarToken(refreshToken, clientId, clientSecret);
        accessToken = nuevo.access_token;

        // reintentar subida con token nuevo
        resp = await intentoSubida(accessToken);
      }
    }

    if (!resp.ok) {
      console.error("Error al subir a Dropbox:", await resp.text());
      return null;
    }

    const data = await resp.json();
    return data.path_display || null;
  } catch (err) {
    console.error("Error al subir a Dropbox:", err);
    return null;
  }
}
