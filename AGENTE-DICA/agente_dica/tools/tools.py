import logging 

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
    Obtiene informacion sobre los empleados que trabajan en el negocio

    Args: 
        None
    Returns:
        str: Un string de json con la informacion obtenida de la base de datos

    Example:
        >>> get_employee_list()
        [{"dni":"39323523", "nombre_completo":"FooBar", "rol":"cajero", "visibilidad":"true"}]
    """
    return  '[{"dni":"39323523", "nombre_completo":"FooBar", "rol":"cajero", "visibilidad":"true"}]'