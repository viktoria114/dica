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

