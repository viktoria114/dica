import logging 
import requests
import os
from agente_dica.auth import solicitud_con_token

api_url = os.getenv("API_DICA_URL", "http://localhost:3000")

logger = logging.getLogger(__name__)

def get_client_info(tel: int) -> str:
    """
    Obtiene informacion sobre un cliente basado en el numero de telefono a una base de datos

    Args:
        tel(str): El numero de telefono necesario para realizar la busqueda.

    Returns:
        str: Un string de json con la informacion obtenida de la base de datos.

    """

    get_customer_url = f"{api_url}/api/clientes/{tel}"

    try:
        resultado = solicitud_con_token(get_customer_url, "GET")
        return resultado

    except requests.RequestException as e:
        print(f"Error al obtener el cliente por tel: {e}")
        return "error al obtener cliente por telefono"

    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al obtener cliente por telefono"

def update_client_info(tel: int, nombre: str, preferencias: str) -> str:
    """
    Actualiza el nombre y las preferencias sobre un cliente usando su numero de telefono en la base de datos

    Args:
        tel(str): El numero de telefono para la busqueda.
        nombre(str): el nuevo nombre a actualizar
        preferencias(str): la nueva prefencia del cliente a actualizar

    Returns:
        str: Un mensaje de respuesta de la base de datos sobre la solicitud.

    """

    update_customer_url = f"{api_url}/api/clientes/{tel}"

    body = {
        "nombre":nombre,
        "preferencia":preferencias
    }

    try:
        resultado = solicitud_con_token(update_customer_url, "PUT",body)
        return resultado

    except requests.RequestException as e:
        print(f"Error al obtener el cliente por tel: {e}")
        return "error al obtener cliente por telefono"

    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al obtener cliente por telefono"


def get_employee_list() -> str:
    """
    Obtiene información sobre los empleados que trabajan en el negocio desde la API.

    Returns:
        str: Un string JSON con la información obtenida desde la base de datos a través de la API.
    """
    get_empleados_url = f"{api_url}/api/empleados"
    print("Iniciando solicitud para obtener empleados...")

    try:
        resultado = solicitud_con_token(get_empleados_url, "GET")
        return resultado

    except requests.RequestException as e:
        print(f"Error al obtener la lista de empleados: {e}")
        return "[]"

    except Exception as e:
        print(f"Error inesperado: {e}")
        return "[]"

def get_employee_role(tel: str) -> str:
    """
    Obtiene información sobre los empleados que trabajan en el negocio desde la API.

    Args:
        str: numero de telefono
    Returns:
        str: Un string JSON con la información obtenida desde la base de datos a través de la API.
    """
        
    get_empleado_url = f"{api_url}/api/empleados/tel/{tel}"
    print("Iniciando solicitud para obtener empleado por tel...")

    try:
        resultado = solicitud_con_token(get_empleado_url, "GET")
        return resultado

    except requests.RequestException as e:
        print(f"Error al obtener el empleado por tel: {e}")
        return "error al obtener empleado por telefono"

    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al obtener empleado por telefono"