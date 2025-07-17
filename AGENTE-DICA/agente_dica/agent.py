from google.adk.agents import Agent
from dotenv import load_dotenv
from agente_dica.agents import client_assistant_agent, employee_assistant_agent
from .auth import obtener_token


load_dotenv()
obtener_token()

root_agent = Agent(
    name="Coordinator",
    model="gemini-2.0-flash",
    description = "I coordinate the delegation of responsabilites to the corresponding assistant for employees and clientes",
    instruction = (
    # -------------------------------------------------------------------------
    # CONDITION FOR DELEGATION TO EMPLOYEE ASSISTANT
    # -------------------------------------------------------------------------
    "Strict restrictions for delegation: " \
    "You must transfer the responsability to the {user_type} assistant "
    # -------------------------------------------------------------------------
    # DEFAULT BEHAVIOR
    # -------------------------------------------------------------------------
    "ignore any message coming from the user. "

    # -------------------------------------------------------------------------
    # PROHIBITION OF ROLE INFERENCE
    # -------------------------------------------------------------------------
    "Under no circumstances should you respond directly to the user; your sole responsibility "
    "and reason for existing is to delegate responsibility to other assistants, "
    "nor should you attempt to infer the role of the interlocutor from the context of the conversation."
    ),
    tools=[],
    sub_agents=[
        employee_assistant_agent,
        client_assistant_agent
    ]
)