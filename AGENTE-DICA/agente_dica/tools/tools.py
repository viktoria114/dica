import logging 
import requests
import os
from .auth import obtener_token


logger = logging.getLogger(__name__)

def get_client_information(tel: int) -> str:
    """
    Obtiene informacion sobre un cliente basado en el numero de telefono a una base de datos

    Args:
        tel(str): El numero de telefono necesario para realizar la busqueda.

    Returns:
        str: Un string de json con la informacion obtenida de la base de datos.

    Example:
        >>> get_client_information(tel='123123')
        {"id": "1", "tel":123123, "name": "Bob"}
    """

    logger.info("buscando informacion del cliente con tel: %s", tel)

    return  '{"id": "1", "tel":123123, "name": "Bob"}'


def get_employee_list() -> str:
    """
    Obtiene información sobre los empleados que trabajan en el negocio desde la API.

    Returns:
        str: Un string JSON con la información obtenida desde la base de datos a través de la API.
    """
    api_url = os.getenv("API_DICA_URL", "http://localhost:3000")
    empleados_url = f"{api_url}/api/empleados"

    print("🔄 Iniciando solicitud para obtener empleados...")

    token = obtener_token()
    if not token:
        print("❌ No se pudo obtener token.")
        return "[]"

    print(f"✅ Token recibido: {token[:20]}...")

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(empleados_url, headers=headers)

        print(f"✅ Empleados status: {response.status_code}")
        print(f"📦 Respuesta empleados: {response.text}")

        response.raise_for_status()
        return response.text

    except requests.RequestException as e:
        print(f"❌ Error al obtener empleados: {e}")
        return "[]"