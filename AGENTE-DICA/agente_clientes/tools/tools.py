import logging 
import requests
import os
from agente_clientes.auth import solicitud_con_token
from agente_clientes.utils.error_parser import parse_http_error

api_url = os.getenv("API_DICA_URL", "http://localhost:3000")

logger = logging.getLogger(__name__)

def get_customer_information(tel: str) -> str:
    """
    Obtiene informacion sobre un cliente desde una base de datos
    Args:
        tel(str): Numero de telefono del cliente
    Returns:
        str: Un string de json con la informacion obtenida de la base de datos.

    """

    get_customer_url = f"{api_url}/api/clientes/{tel}"

    resultado = solicitud_con_token(get_customer_url, "GET")
    return resultado

def update_customer_name_and_diet(tel: str, nombre: str, dieta: str) -> str:
    """
    Actualiza el nombre y el tipo de dieta sobre un cliente usando su numero de telefono en la base de datos
    Las dietas disponibles son: vegetariano, vegano, neutra y sin asignar

    Args:
        tel(str): El numero de telefono para la busqueda.
        nombre(str): el nuevo nombre a actualizar
        dieta(str): la dieta del cliente.

    Returns:
        str: Un mensaje de respuesta de la base de datos sobre la solicitud.

    """

    update_customer_url = f"{api_url}/api/clientes/{tel}"

    body = {
        "nombre":nombre,
        "dieta":dieta
    }

    resultado = solicitud_con_token(update_customer_url, "PUT",body)
    return resultado

def add_preference(tel: str, preference: str)->str:
    """
    Registra una nueva preferencias de los clientes para una mejor atencion

    Args:
        tel(str): numero de telefono del cliente
        preferencia(str): descripcion de la preferencia
    Returns:
        str: Un string con la devolucion de la solicitud
    """

    add_preference_url = f"{api_url}/api/clientes/preferencias/{tel}"
    body = {
        "preferencia": preference
    }

    resultado = solicitud_con_token(add_preference_url,"POST", body)
    return resultado
    
def update_preference(tel: str, old_preference: str, new_preference: str)->str:
    """
    Modifica o cambia una preferencia existente por una nueva

    Args:
        tel(str): numero de telefono del cliente
        old_preference(str): descripcion de la anterior preferencia
        new_preference(str): descripcion de la nueva preferencia
    Returns:
        str: Un string con la devolucion de la solicitud
    """

    add_preference_url = f"{api_url}/api/clientes/preferencias/{tel}"
    body = {
        "preferenciaAntigua": old_preference,
        "nuevaPreferencia": new_preference
    }

    resultado = solicitud_con_token(add_preference_url,"PUT", body)
    return resultado

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
    resultado = solicitud_con_token(create_suggestion_url, "POST", body)
    return resultado

def get_menu():
    """
    Obtiene una lista completa del menu disponible
    Args: none
    Returns:
        Mensaje de respuesta de la base de datos
    """

    get_menu_url = f"{api_url}/api/menu"

    resultado = solicitud_con_token(get_menu_url, "GET")
    return resultado

def send_menu_image(tel: str) -> str:
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

    resultado = solicitud_con_token(get_menu_url, "GET", body)
    return resultado

#Crear un nuevo pedido en estado "En construccion"
#API: business rule, no puede haber mas de dos pedidos en estado "En construccion"
def create_new_cart(tel: str)->str:
    """
    Crea un nuevo carrito para agregar productos de menu

    Args:
        tel(str): Numero de telefono del cliente
    Returns:
        Un string con la informacion sobre la solicitud de creacion del nuevo carrito 
    """
    create_cart_url = f"{api_url}/api/pedido"

    body = {"fk_cliente": tel}

    resultado = solicitud_con_token(create_cart_url, "POST", body)
    return resultado

#API: business rule, no puede haber mas de dos pedidos en estado "En construccion"
def get_active_cart(tel: str):
    """
    Obtiene informacion sobre el carrito activo del cliente
    Args:
        tel(str): Numero de telefono del cliente
    Returns: 
        informacion sobre el estado o existencia del carrito activo del cliente
    """

    get_cart_url = f"{api_url}/api/pedido/en_construccion/{tel}"

    resultado = solicitud_con_token(get_cart_url, "GET")
    return resultado

def add_menu_to_cart(tel: str, cartID: int, menuID: int, cantidad: int) -> str:
    """
    Suma un item de menu al carrito existente

    Args:
        tel(str): Numero de telefono del cliente
        cartID(int): ID del carrito que se desea modificar
        menuID(int): ID del menu que se desea agregar
        cantidad(int): cantidad de items de menu
    Returns: 
        Estado de la peticion y del carrito actualizado
    """

    add_menu_url = f"{api_url}/api/pedido/un_item/{cartID}"

    body = {
        "tel": tel,
        "id_menu": menuID,
        "cantidad": cantidad
    }

    resultado = solicitud_con_token(add_menu_url, "POST", body)
    return resultado

def remove_menu_from_cart(tel: str, cartID: int, menuID: int, cantidad: int) ->str:
    """
    Quita items de menu del carrito existente

    Args:
        tel(str): Numero de telefono del cliente
        cartID(int): ID del carrito que se desea modificar
        menuID(int): ID del menu que se desea quitar
        cantidad(int): cantidad de items de menu
    Returns: 
        Estado del carrito actualizado
    """

    body = {
        "tel": tel,
        "id_menu": menuID,
        "cantidad": cantidad
    }

    remove_menu_url= f"{api_url}/api/pedido/un_item/{cartID}"

    resultado = solicitud_con_token(remove_menu_url, "DELETE", body)
    return resultado

# Esta funcion en realidad actualiza el pedido ya creado pero el agente no lo sabe jiji
def create_order(tel: str, ubicacion: str, observacion: str):
    """
    Crea un nuevo pedido para ser procesado

    Args:
        tel(str): Numero de telefono del cliente
        ubicacion(str): Lugar donde entregar el pedido
        observacions(str): detalles extra sobre el pedido especificadas (preferencias, referencias del lugar de entrega, etc)
    Returns:
        Informacion sobre el pedido creado
    """
    body = {
        "ubicacion": ubicacion,
        "observacion": observacion
    }
    # API: Buscar el unico pedido que corresponde al cliente y que tenga el estado "En construccion"
    create_order_url= f"{api_url}/api/pedido/agente_estado/{tel}"

    resultado = solicitud_con_token(create_order_url, "PUT", body)
    return resultado

def cancel_order(tel: str, orderID: int):
    """
    Cancela una order activa del cliente
    """

    body = {
        "telefono": tel
    }

    cancel_order_url= f"{api_url}/api/pedido/cancelar/{orderID}"

    resultado = solicitud_con_token(cancel_order_url, "PUT", body)
    return resultado

# vacia los items del pedido "En construccion"
def empty_cart(tel: str):
    """
    Vacia el carrito para futuras modificaciones
    Args:
        tel(str): numero de telefono del cliente
    Returns:
        string: resultado de la operacion
    """

    #API: vaciar el pedido donde num = tel y estado = "En construccion"
    cancel_cart_url= f"{api_url}/api/pedido/vaciar_item/{tel}"

    resultado = solicitud_con_token(cancel_cart_url, "DELETE")
    return resultado

#permite ver todas las ordenes no canceladas/finalizadas asociadas al cliente
def check_active_orders(tel: str):
    """
    Informa sobre el estado de las ordenes activas del cliente
    """

    check_orders_url= f"{api_url}/api/pedido/telefono_cliente/{tel}"

    resultado = solicitud_con_token(check_orders_url, "GET")
    return resultado
