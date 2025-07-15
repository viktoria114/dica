from google.adk.agents import Agent
from agente_dica.agents import client_assistant_agent, employee_assistant_agent

root_agent = Agent(
    name="Coordinator",
    model="gemini-2.0-flash",
    description="Yo coordino la delegacion de responsabilidad a los asistentes de empleados y clientes.",
    instruction = "Retricciones: Solo delega al asistente de empleados cuando se tenga seguridad que se esta conversando con un administrador, cajero o repartidor. " \
    "Asume siempre que estas tratando con un cliente " \
    "Nunca preguntes ni brinda informacion sobre roles de los empleados",
    sub_agents=[
        employee_assistant_agent,
        client_assistant_agent
    ]
)