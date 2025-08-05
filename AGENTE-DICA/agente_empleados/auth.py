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
    username = os.getenv("AGENTE_EMPLEADOS_USERNAME", "agente_empleados")
    password = os.getenv("AGENTE_EMPLEADOS_PASSWORD", "agente123")

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


def solicitud_con_token(url, method: str, body = {}, max_reintentos=2):
    token = os.environ.get("jwt")
    if not token:
        raise ValueError("Token JWT no encontrado en las variables de entorno.")

    intentos = 0

    while intentos <= max_reintentos:
        headers = {"Authorization": f"Bearer {token}"}
        if method == "GET":
            response = requests.get(url, headers=headers, json=body)
        if method == "PUT":
            response = requests.put(url, headers=headers, json=body)
        if method == "POST":
            response = requests.post(url, headers=headers,json=body)
        if method == "DELETE":
            response = requests.delete(url, headers=headers,json=body)

        print(f"Status: {response.status_code}")
        print(f"Respuesta: {response.text}")

        if response.status_code == 200:
            return response.text

        elif response.status_code == 401 and intentos < max_reintentos:
            print("Token expirado o inválido. Renovando...")
            token = obtener_token()
            intentos += 1
            continue

        else:
            response.raise_for_status()
            break

    return "[]"
