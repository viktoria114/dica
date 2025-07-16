# tools/auth.py
import os
import requests

def obtener_token() -> str | None:
    """
    Realiza login y devuelve un token válido si las credenciales son correctas.

    Returns:
        str | None: Token JWT si el login fue exitoso, None si falló.
    """
    api_url = os.getenv("API_DICA_URL", "http://localhost:3000")
    login_url = f"{api_url}/api/auth/login"
    username = os.getenv("AGENTE_USERNAME", "agente_ia")
    password = os.getenv("AGENTE_PASSWORD", "agente123")

    print("🔐 Realizando login desde auth.py...")
    try:
        response = requests.post(login_url, json={"username": username, "password": password})
        print(f"🔑 Login status: {response.status_code}")
        print(f"🧾 Login body: {response.text}")
        response.raise_for_status()

        token = response.json().get("token")
        return token

    except requests.RequestException as e:
        print(f"❌ Error en login: {e}")
        return None
