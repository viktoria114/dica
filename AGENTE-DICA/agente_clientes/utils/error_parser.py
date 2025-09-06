import requests
import json

def parse_http_error(e: requests.HTTPError) -> dict:
    resp = getattr(e, 'response', None)
    status = resp.status_code if resp is not None else None

    body = None
    text = None
    mensaje = None

    if resp is not None:
        text = resp.text.strip()
        try:
            body = resp.json()  # puede ser dict, list, etc.
        except ValueError:
            body = None

        if isinstance(body, dict) and body:
            # Preferimos campos esperados
            mensaje = body.get("message") or body.get("error") or json.dumps(body, ensure_ascii=False)
        else:
            # Si no hay JSON útil, usamos el texto crudo
            mensaje = text if text else f"HTTP {status}"

    else:
        mensaje = str(e)

    return {
        "status_code": status,
        "error": mensaje,
        "body": body if body is not None else text
    }