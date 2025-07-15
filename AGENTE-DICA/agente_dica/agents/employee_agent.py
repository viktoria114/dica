from google.adk.agents import Agent
from agente_dica.tools import tools
from agente_dica.prompts import EMPLOYEE_INSTRUCTIONS

employee_assistant_agent = Agent(
    name="employee_assistant_agent",
    model="gemini-2.0-flash",
    description=("Tu responsabilidad es brindar informacion a los empleados sobre el restaurante"
    ),
    instruction=(EMPLOYEE_INSTRUCTIONS),
    tools=[tools.get_employee_list, tools.get_client_information],
)