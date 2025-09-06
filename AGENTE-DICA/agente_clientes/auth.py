#auth.py
import os
import requests


def obtener_token():
    """
    Realiza login y devuelve un token válido si las credenciales son correctas.

    Returns:
        str | None: Token JWT si el login fue exitoso, None si falló.
    """
    api_url = os.getenv("API_DICA_URL", "http://localhost:3000")
    login_url = f"{api_url}/api/auth/login"
    username = os.getenv("AGENTE_CLIENTES_USERNAME", "agente_clientes")
    password = os.getenv("AGENTE_CLIENTES_PASSWORD", "agente123")

    print("Realizando login desde auth.py...")
    try:
        response = requests.post(login_url, json={"username": username, "password": password})
        print(f"Login status: {response.status_code}")
        print(f"Login body: {response.text}")
        response.raise_for_status()

        token = response.json().get("token")
        os.environ["jwt"] = token

    except requests.RequestException as e:
        print(f"Error en login: {e}")

def solicitud_con_token(url, method: str, body = None, max_reintentos=2):
    token = os.environ.get("jwt")
    if not token:
        raise ValueError("Token JWT no encontrado en las variables de entorno.")

    intentos = 0
    while intentos <= max_reintentos:
        headers = {"Authorization": f"Bearer {token}"}
        method_upper = method.upper()
        response = None

        if method_upper == "GET":
            response = requests.get(url, headers=headers, json=body)
        elif method_upper == "PUT":
            response = requests.put(url, headers=headers, json=body)
        elif method_upper == "POST":
            response = requests.post(url, headers=headers, json=body)
        elif method_upper == "DELETE":
            response = requests.delete(url, headers=headers, json=body)
        else:
            raise ValueError(f"Método HTTP no soportado: {method}")

        print(f"Status: {response.status_code}")
        print(f"Respuesta: {response.text}")

        if 200 <= response.status_code < 300:
            # Intentamos devolver JSON si existe, sino texto
            try:
                return {"status_code": response.status_code, "body": response.json()}
            except ValueError:
                return {"status_code": response.status_code, "body": response.text}

        if response.status_code == 401 and intentos < max_reintentos:
            print("Token expirado o inválido. Renovando...")
            token = obtener_token()
            intentos += 1
            continue

        # Para otros códigos (4xx/5xx) devolvemos el cuerpo parseado en lugar de lanzar directamente
        try:
            parsed = response.json()
        except ValueError:
            parsed = response.text

        return {"status_code": response.status_code, "body": parsed}

    # si salimos del loop
    return {"status_code": None, "body": None}
