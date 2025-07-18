from google.adk.agents import Agent
from agente_dica.prompts import CLIENT_INSTRUCTION
from agente_dica.tools import get_employee_role, get_client_info, update_client_info, create_suggestion

client_assistant_agent = Agent(
    name="client_assistant_agent",
    model="gemini-2.0-flash",
    description=("Tu responsabilidad es atender a los clientes a realizar un pedido y a hacer consultas sobre el restaurante"
    ),
    instruction=(CLIENT_INSTRUCTION),
    tools=[get_employee_role, get_client_info, update_client_info, create_suggestion],
)