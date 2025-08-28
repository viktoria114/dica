#TODO: Create an order agent so to handle orders.
#this must be done this way in order to avoid any kinda allucination and be as deterministic as possible. 
#Order requests tool MUST be supported by an order entity called "order" so that it applies business logic controlled by code

from google.adk.agents import Agent
from agente_clientes.prompts import GLOBAL_INSTRUCTION, ORDER_SERVICE_INSTRUCTION 

order_service_agent = Agent(
    name="order_agent",
    model="gemini-2.0-flash",
    description = "Provides services for order requests",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction =ORDER_SERVICE_INSTRUCTION
)