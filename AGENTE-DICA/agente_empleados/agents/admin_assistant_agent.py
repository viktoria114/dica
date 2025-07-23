from google.adk.agents import Agent
from agente_empleados.tools import get_employee_list, get_employee_information, get_customer_information
from agente_empleados.prompts import ADMIN_ASSISTANT_INSTRUCTION

admin_assistant_agent = Agent(
    name="admin_assistant_agent",
    model="gemini-2.0-flash",
    description=("Assist only administrators with the business"),
    instruction=(ADMIN_ASSISTANT_INSTRUCTION),
    tools=[get_employee_list, get_customer_information, get_employee_information],
)