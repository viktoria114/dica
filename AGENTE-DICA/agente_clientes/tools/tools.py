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

def update_customer_information(tel: int, nombre: str, dieta: str) -> str:
    """
    Actualiza el nombre y las preferencias sobre un cliente usando su numero de telefono en la base de datos

    Args:
        tel(str): El numero de telefono para la busqueda.
        nombre(str): el nuevo nombre a actualizar
        dieta(str): la dieta del cliente. Permitido (vegetariano, vegano)

    Returns:
        str: Un mensaje de respuesta de la base de datos sobre la solicitud.

    """

    update_customer_url = f"{api_url}/api/clientes/{tel}"

    body = {
        "nombre":nombre,
        "dieta":dieta
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

def add_preference(tel: str, preference: str)->str:
    """
    Mediante esta herramienta, se registra las preferencias de los clientes para una mejor atencion

    Args:
        tel(str): numero de telefono del cliente
        preferencia(str): descripcion de la preferencia
    Returns:
        str: Un string con la devolucion de la solicitud
    """

    add_preference_url = f"{api_url}/api/preferencias/{tel}"
    body = {
        "preferencia": preference
    }
    try:
        resultado = solicitud_con_token(add_preference_url,"POST", body)
    except requests.RequestException as e:
        print(f"Error al intentar agregar la preferencia: {e}")
        return "error al intentar agregar la preferencia"
    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al intentar agregar la preferencia"


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

def get_menu():
    """
    Obtiene una lista completa del menu disponible
    Args: none
    Returns:
        Mensaje de respuesta de la base de datos
    """

    get_menu_url = f"{api_url}/api/menu"

    try:
        resultado = solicitud_con_token(get_menu_url, "GET")
        return resultado
    except requests.RequestException as e:
        print(f"Error al obtener la lista del menu: {e}")
        return e
    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al intentar crear la sugerencia"

def send_menu_image(tel: str):
    """
    Envia una imagen con el menu y sus precios
    Args: 
        tel(str): Numero de telefono del cliente
    Returns:
        Mensaje de respuesta del estado del envio
    """

    get_menu_url = f"{api_url}/api/menu/imagen"

    body = {
        "to": tel
    }

    try:
        resultado = solicitud_con_token(get_menu_url, "GET", body)
        return resultado
    except requests.RequestException as e:
        print(f"Error al enviar la lista del menu: {e}")
        return e
    except Exception as e:
        print(f"Error inesperado: {e}")
        return "error inesperado al intentar enviar la lista del menu"

 