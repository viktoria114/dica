# Dica – Sistema Integral de Gestión de Pedidos y Agentes Conversacionales

**Dica** es una plataforma full-stack que integra:
- Un **servicio REST** (API-DICA) en Node.js/Express/TypeScript para gestionar clientes, empleados, pedidos, pagos, etc.
- Un **frontend** (DICA-APP) en React, Vite y Material-UI para la interfaz de administración y estadísticas.
- Un **módulo de agentes conversacionales** (AGENTE-DICA) en Python para atención al cliente y apoyo a empleados mediante Google ADK.

Permite automatizar la atención vía WhatsApp, gestionar el ciclo de vida de un pedido y ofrecer reportes detallados.

## Características principales
- 🤖 **Agentes conversacionales** para clientes y empleados con integración ADK.  
- 📦 **CRUD completo** de clientes, empleados, menú, promociones, pedidos, pagos y gastos.  
- 📊 **Dashboard y reportes** de ventas, cancelaciones, flujo de caja y estadísticas.  
- 🔒 **Autenticación JWT** con roles y protección de rutas.  
- 📱 **Frontend responsivo** con React, Material-UI y Redux Toolkit.  

## Puntos fuertes
- Fácil extensión de herramientas de agente mediante `tools.py`.  
- Arquitectura modular: **Controllers ↔ Routes ↔ Models** en API.  
- Gestión centralizada de estados y peticiones con **Redux Toolkit & Axios**.  
- Diseño escalable: capas de servicios, utilitarios y middleware.  

## Tecnologías utilizadas
- **Backend**: Node.js, Express, TypeScript, PostgreSQL, pg, jwt, bcrypt  
- **Frontend**: React, Vite, TypeScript, Material-UI, Redux Toolkit, Axios  
- **Agentes**: Python, Google ADK, Requests, dotenv  
- **Otros**: Notistack, jsPDF, Dropbox API  

---

## Cómo instalar y ejecutar

```bash
# Clonar el repositorio
git clone https://github.com/<usuario>/dica.git
cd dica

# 1. API
cd API-DICA
npm install
# Configurar .env con POSTGRES_URI, PORT, JWT_SECRET,...
npm run dev

# 2. Agentes
cd ../AGENTE-DICA
pip install -r requirements.txt
# Variables: API_DICA_URL, AGENTE_CLIENTES_USERNAME/PASSWORD, MODEL,...
python -m agente_clientes.agent

# 3. Frontend
cd ../DICA-APP
npm install
# Variables: VITE_API_URL, VITE_CLIENTES, VITE_AGENTE_URL,...
npm run dev
```

---

## Estructura del Proyecto

```
dica/
├── AGENTE-DICA/
│   └── agente_clientes/
│       ├── tools.py           # Funciones para llamar a la API y ADK
│       ├── agent.py           # Agente raíz customer_service_agent
│       └── prompts.py         # Instrucciones globales y específicas
├── API-DICA/
│   └── src/
│       ├── app.ts             # Registro de rutas y middlewares
│       ├── server.ts          # Arranque del servidor
│       ├── config/
│       │   ├── config.ts      # Entorno y flags de servicio de agente
│       │   └── db.ts          # Conexión y pool a PostgreSQL
│       ├── middlewares/
│       │   ├── authHandler.ts # Verificación JWT y roles
│       │   └── errorHandler.ts# Captura y formato de errores
│       ├── controllers/       # Lógica de negocio y transacciones
│       │   ├── agenteController.ts
│       │   ├── authController.ts
│       │   ├── clienteController.ts
│       │   ├── empleadoController.ts
│       │   ├── pedidoController.ts
│       │   ├── cancelacionesController.ts
│       │   ├── pagoController.ts
│       │   ├── gastoController.ts
│       │   ├── menuController.ts
│       │   ├── promocionesController.ts
│       │   ├── reportesController.ts
│       │   ├── dashboardController.ts
│       │   ├── stockControllers.ts
│       │   └── sugerenciasController.ts
│       ├── models/            # Definición de entidades
│       │   ├── cliente.ts
│       │   ├── empleado.ts
│       │   ├── pedido.ts
│       │   ├── pago.ts
│       │   ├── gasto.ts
│       │   ├── menu.ts
│       │   ├── promocion.ts
│       │   ├── stock.ts
│       │   ├── registroStock.ts
│       │   └── sugerencia.ts
│       ├── routes/            # Enrutadores REST
│       │   ├── authRoutes.ts
│       │   ├── agenteRoutes.ts
│       │   ├── clienteRoutes.ts
│       │   ├── empleadoRoutes.ts
│       │   ├── pedidoRoutes.ts
│       │   ├── pagoRoutes.ts
│       │   ├── gastosRoutes.ts
│       │   ├── menuRoutes.ts
│       │   ├── promocionesRoutes.ts
│       │   ├── reportesRoutes.ts
│       │   ├── dashboardRoutes.ts
│       │   ├── stockRoutes.ts
│       │   └── sugerenciaRoutes.ts
│       └── utils/             # Utilidades compartidas
│           ├── adk.ts
│           ├── gmaps.ts
│           ├── whatsapp.ts
│           ├── image.ts
│           └── blacklist.ts
└── DICA-APP/
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── vite-env.d.ts
        ├── api/
        │   ├── api.ts          # Instancia Axios con interceptores
        │   ├── clientes.ts
        │   ├── pedidos.ts
        │   └── agente.ts
        ├── contexts/
        │   ├── SnackbarContext.tsx
        │   └── DropboxTokenContext.tsx
        ├── hooks/              # Custom hooks por entidad
        │   ├── Clientes/
        │   ├── Empleados/
        │   ├── Gastos/
        │   ├── Pedidos/
        │   └── ...            
        ├── store/
        │   ├── index.ts
        │   ├── hooks.ts
        │   └── slices/
        ├── services/
        │   ├── pdfGenerator.ts
        │   └── theme.ts
        ├── Components/         # UI por módulo
        │   ├── common/
        │   ├── Estadisticas/
        │   ├── Inicio/
        │   ├── Menu/
        │   ├── Pedidos/
        │   └── ...
        └── Pages/
            ├── Login.tsx
            ├── Inicio.tsx
            ├── Clientes.tsx
            └── ...
```

---

## Próximos Pasos
- Integrar tests automatizados (Jest, pytest).  
- Desplegar en contenedores (Docker) y orquestadores (Kubernetes).  
- Añadir canal de notificaciones en tiempo real (WebSockets).  
- Mejorar escalabilidad de agentes con colas de mensajes.  
- Internacionalizar la interfaz y mensajes de agente.

---

## Créditos y Despliegue
Por: Equipo Dica (Arancio Oviedo María Victoria, Matias Francisco Moreno Brizuela, Valentino Gabriel Herrera, Federico Salomón) 
GitHub: https://github.com/viktoria114/dica
