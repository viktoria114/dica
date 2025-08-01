import logging 
import requests
import os
from agente_clientes.auth import solicitud_con_token

api_url = os.getenv("API_DICA_URL", "http://localhost:3000")

logger = logging.getLogger(__name__)

def get_customer_information(tel: int) -> str:
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
        msg = e.response.text
        return msg

    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al obtener cliente por telefono"

def update_customer_information(tel: int, nombre: str, preferencias: str) -> str:
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

def create_suggestion(tel: str, descripcion: str)->str:
    """
    Mediante esta herramienta, los clientes pueden dejar sus sugerencias despues de realizar su pedido

    Args:
        tel(str): numero de telefono del cliente
        descripcion(str): descripcion de la sugerencia
    Returns:
        str: Un string con la devolucion de la solicitud
    """

    create_suggestion_url = f"{api_url}/api/sugerencias/{tel}"
    body = {
        "descripcion":descripcion
    }
    try:
        resultado = solicitud_con_token(create_suggestion_url, "POST", body)
    except requests.RequestException as e:
        print(f"Error al intentar crear la sugerencia: {e}")
        return "error al intentar crear la sugerencia"
    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al intentar crear la sugerencia"
