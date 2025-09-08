from google.adk.agents import Agent
import os
from .prompts import GLOBAL_INSTRUCTION, CUSTOMER_SERVICE_INSTRUCTION
from .tools import get_customer_information, update_customer_name_and_diet, create_suggestion, get_menu, send_menu_image, add_preference, update_preference
from dotenv import load_dotenv
from .auth import obtener_token
from .agents import order_service_agent


load_dotenv()
obtener_token()

root_agent = Agent(
    name="customer_service_agent",
    model=os.getenv("MODEL"),
    description = "Provides customer service",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction = CUSTOMER_SERVICE_INSTRUCTION,
    tools=[get_customer_information, update_customer_name_and_diet, create_suggestion, get_menu, send_menu_image, add_preference, update_preference],
    sub_agents=[order_service_agent]
)