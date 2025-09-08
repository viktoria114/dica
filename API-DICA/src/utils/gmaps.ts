export function extractGoogleMapsUrl(message: any): string | null {
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

