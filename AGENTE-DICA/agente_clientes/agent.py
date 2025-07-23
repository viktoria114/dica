from google.adk.agents import Agent
from .prompts import GLOBAL_INSTRUCTION, CUSTOMER_SERVICE_INSTRUCTION
from .tools import get_customer_information, update_customer_information, create_suggestion
from dotenv import load_dotenv
from .auth import obtener_token


load_dotenv()
obtener_token()

root_agent = Agent(
    name="customer_service_agent",
    model="gemini-2.0-flash",
    description = "Provides customer service",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction = CUSTOMER_SERVICE_INSTRUCTION,
    tools=[get_customer_information, update_customer_information, create_suggestion],
)