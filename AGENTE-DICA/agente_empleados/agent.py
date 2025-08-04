from google.adk.agents import Agent
from .prompts import EMPLOYEE_ASSISTANT_INSTRUCTION, GLOBAL_INSTRUCTION
from .agents import admin_assistant_agent
from .tools import get_employee_information, get_customer_information, get_menu
from dotenv import load_dotenv
from .auth import obtener_token

load_dotenv()
obtener_token()

root_agent = Agent(
    name="employee_assistant",
    model="gemini-2.0-flash",
    description = "Provides general employee services",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction = EMPLOYEE_ASSISTANT_INSTRUCTION, 
    tools=[get_employee_information, get_customer_information, get_menu],
    sub_agents=[admin_assistant_agent]
)