#TODO: Create an order agent so to handle orders.
#this must be done this way in order to avoid any kinda allucination and be as deterministic as possible. 
#Order requests tool MUST be supported by an order entity called "order" so that it applies business logic controlled by code

from google.adk.agents import Agent
from agente_clientes.prompts import GLOBAL_INSTRUCTION, ORDER_SERVICE_INSTRUCTION
from agente_clientes.tools import get_menu, get_active_cart, add_menu_to_cart, remove_menu_from_cart, cancel_order
from agente_clientes.tools import empty_cart, check_active_orders, create_new_cart, create_order_cash, create_order_transfer

order_service_agent = Agent(
    name="order_agent",
    model="gemini-2.0-flash",
    description = "Provides services for order requests",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction =ORDER_SERVICE_INSTRUCTION,
    tools=[
        get_menu,
        create_new_cart,
        get_active_cart,
        add_menu_to_cart,
        remove_menu_from_cart,
        create_order_cash,
        create_order_transfer,
        cancel_order,
        empty_cart,
        check_active_orders
    ]
)