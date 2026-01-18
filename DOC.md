==============================================================================
                        PROYECTO DAKA_POKEMON
==============================================================================

DESCRIPCIÓN GENERAL
===================

Repositorio: daka_pokemon
Tipo: Proyecto de evaluación técnica para Tiendas DAKA
Objetivo: Evaluar capacidades de desarrollo full-stack

CARACTERÍSTICAS PRINCIPALES
----------------------------
1. Sistema de autenticación de usuarios basado en JWT con hashing bcrypt
2. Sistema de entrega en tiempo real de sprites de Pokémon vía WebSocket
   (integración con PokeAPI)

ÁREAS EVALUADAS
---------------
- Backend (NestJS)
- Frontend (Vue 3)
- Containerización (Docker)
- Implementación de seguridad (cumplimiento OWASP Top 10 - 25% de la puntuación)

FUENTES: README.md1-26, TECHNICAL_ASSESSMENT.md1-26

ARQUITECTURA DEL SISTEMA
========================

La aplicación implementa una arquitectura de tres capas con separación clara entre:
1. Capa de presentación
2. Lógica de negocio
3. Persistencia de datos

ESTRUCTURA DE ALTO NIVEL DE COMPONENTES
---------------------------------------
FUENTES: README.md29-34, TECHNICAL_ASSESSMENT.md15-23, backend/src/app.module.ts10-26

TECNOLOGÍAS UTILIZADAS
======================

| Capa        | Tecnología       | Versión/Configuración          | Propósito                                |
|-------------|------------------|--------------------------------|------------------------------------------|
| Backend     | NestJS           | -                              | Framework TypeScript, arquitectura modular |
|             | TypeORM          | -                              | ORM para PostgreSQL, previene inyección SQL |
|             | Passport + JWT   | Algoritmo HS256                | Implementación de estrategia de autenticación |
|             | bcrypt           | 10+ rondas de salt             | Hashing de contraseñas                   |
|             | class-validator  | -                              | Validación y sanitización de DTOs        |
| Frontend    | Vue 3            | Composition API                | Framework de UI reactiva                 |
|             | Pinia            | -                              | Gestión de estado (reemplaza Vuex)       |
|             | TailwindCSS      | -                              | Estilos con enfoque utilitario           |
|             | Vee-Validate + Zod | -                            | Validación de formularios con esquemas   |
|             | Vite             | Puerto 5173 (desarrollo)       | Herramienta de construcción y servidor   |
| Base de datos | PostgreSQL     | Puerto 5432                    | Base de datos relacional para usuarios   |
| Infraestructura | Docker Compose | dev.yml / test.yml           | Orquestación de múltiples contenedores   |
|             | Node.js          | 20-slim                        | Entorno de ejecución                     |
|             | Nginx            | -                              | Servidor de archivos estáticos en producción |

ESTRUCTURA DE MÓDULOS DEL BACKEND
==================================

El backend NestJS está organizado en tres módulos funcionales:

| Módulo      | Clases Principales                     | Responsabilidades                             |
|-------------|----------------------------------------|-----------------------------------------------|
| AppModule   | AppController, AppService              | Módulo raíz, importa ConfigModule y TypeOrmModule |
| AuthModule  | AuthController, AuthService, JwtStrategy | Registro de usuarios, login, generación/validación JWT, hashing de contraseñas |
| PokemonModule | PokemonController, PokemonService, PokemonGateway | Integración con PokeAPI, generación de sprites aleatorios, comunicación WebSocket |

FUENTES: backend/src/app.module.ts10-26, TECHNICAL_ASSESSMENT.md28-106

ENDPOINTS Y RUTAS DEL API
=========================

ENDPOINTS HTTP
--------------
| Módulo     | Endpoint          | Método | Autenticación | Descripción                                  | Body Request (JSON)                           |
|------------|-------------------|--------|---------------|----------------------------------------------|-----------------------------------------------|
| Auth       | /auth/register    | POST   | No requerida  | Registro de nuevo usuario                    | { "username": "string", "password": "string" } |
| Auth       | /auth/login       | POST   | No requerida  | Autenticación de usuario existente           | { "username": "string", "password": "string" } |
| Auth       | /auth/me          | GET    | JWT Requerido | Obtener información del usuario autenticado  | N/A (token vía header Authorization: Bearer)  |
| Pokemon    | /pokemon/sprite   | GET    | JWT Requerido | Obtener un sprite aleatorio de Pokémon       | N/A                                           |
| Pokemon    | /pokemon/history  | GET    | JWT Requerido | Obtener historial de sprites solicitados     | N/A                                           |

EVENTOS WEBSOCKET
-----------------
| Evento          | Dirección | Autenticación | Descripción                                  |
|-----------------|-----------|---------------|----------------------------------------------|
| request-sprite  | Cliente→Servidor | JWT Requerido | Solicitar un nuevo sprite aleatorio          |
| sprite-data     | Servidor→Cliente | Automática   | Envío de datos del sprite (URL, ID, nombre)  |
| delete-sprite   | Cliente→Servidor | JWT Requerido | Solicitar eliminación de un sprite específico |

FUENTES: TECHNICAL_ASSESSMENT.md28-101, backend/src/auth/auth.service.ts24-152, TECHNICAL_ASSESSMENT.md104-127

FLUJO DE AUTENTICACIÓN
======================

ENDPOINTS DE AUTENTICACIÓN
--------------------------
| Endpoint        | Método | Autenticación | Propósito                                  |
|-----------------|--------|---------------|--------------------------------------------|
| /auth/register  | POST   | Ninguna       | Crear nuevo usuario con contraseña hasheada |
| /auth/login     | POST   | Ninguna       | Validar credenciales, devolver token JWT   |
| /auth/me        | GET    | JWT Requerido | Recuperar perfil de usuario actual         |

FLUJO DE SOLICITUD/RESPUESTA
----------------------------
FUENTES: TECHNICAL_ASSESSMENT.md28-101, backend/src/auth/auth.service.ts24-152

SISTEMA DE POKÉMON EN TIEMPO REAL
==================================

El módulo Pokemon se integra con la PokeAPI externa y entrega sprites al frontend mediante conexiones WebSocket.

FLUJO DE COMUNICACIÓN WEBSOCKET
--------------------------------
FUENTES: TECHNICAL_ASSESSMENT.md104-141

CONFIGURACIÓN DEL ENTORNO
=========================

La aplicación soporta dos modos operativos con configuraciones distintas:

| Aspecto                  | Desarrollo (docker-compose.dev.yml)      | Producción (docker-compose.test.yml)    |
|--------------------------|------------------------------------------|-----------------------------------------|
| Servicio Frontend        | Servidor dev Vite (puerto 5173)          | Nginx (puerto 80)                       |
| Hot Reload               | Habilitado vía montajes de volumen       | Deshabilitado, usa build compilado      |
| Código Fuente            | Montado como volumen                     | No montado, copiado en la imagen        |
| Node Modules             | Cacheado en volúmenes nombrados          | Incluido en la imagen durante el build  |
| Modo Backend             | Modo watch de NestJS                     | Modo producción (JS compilado)          |
| Documentación Swagger    | Disponible en /api/docs                  | No expuesta                             |
| Logging                  | Salida detallada                         | Logging optimizado                      |
| Tipo de Build            | Dependencias de desarrollo incluidas     | Solo dependencias de producción         |

VARIABLES DE ENTORNO CLAVE
--------------------------
# Configuración de Base de Datos (POSTGRES_*)
POSTGRES_DB=technical-test_db
POSTGRES_USER=technical-test
POSTGRES_PASSWORD=1234
PORT=5432

# Configuración del Backend
JWT_SECRET=your-strong-secret-here-min-32-characters-long
NODE_ENV=development|production
PORT=3000
FRONTEND_URL=http://localhost:5173

# Configuración del Frontend (VITE_*)
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000

FUENTES: .env.example1-31, README.md37-73, TECHNICAL_ASSESSMENT.md144-193

INICIO LOCAL Y USO DEL MAKEFILE
================================

PREREQUISITOS
-------------
- Docker y Docker Compose instalados
- Git instalado
- Puerto 5173 (frontend) y 3000 (backend) disponibles

PASOS DE CONFIGURACIÓN
----------------------
1. Clonar el repositorio:
   ```bash
   git clone <repositorio>
   cd daka_pokemon


Configurar variables de entorno:
bash

cp .env.example .env
# Editar .env con valores apropiados (especialmente JWT_SECRET)

    Usar el Makefile para gestionar los contenedores:

COMANDOS DISPONIBLES EN EL MAKEFILE
makefile

# Variables
DC_DEV=docker compose -f docker-compose.dev.yml
DC_TEST=docker compose -f docker-compose.test.yml

# Desarrollo
dev-up:          # Levantar entorno de desarrollo
dev-down:        # Detener entorno de desarrollo
dev-logs:        # Ver logs en tiempo real
dev-restart:     # Reiniciar servicios
dev-ps:          # Ver estado de contenedores

# Testing / Pre-producción
test-up:         # Levantar entorno de testing (simulación producción)
test-down:       # Detener entorno de testing
test-logs:       # Ver logs de testing
test-restart:    # Reiniciar servicios de testing
test-ps:         # Ver estado de contenedores de testing

# Limpieza de volúmenes
clean-dev:       # Eliminar contenedores y volúmenes de desarrollo
clean-test:      # Eliminar contenedores y volúmenes de testing

FLUJO DE INICIO RÁPIDO

    Para entorno de desarrollo:
    bash

make dev-up

Esto construirá y levantará los contenedores de:

    PostgreSQL (puerto 5432)

    Backend NestJS (puerto 3000)

    Frontend Vue (puerto 5173)

Acceder a la aplicación:

    Frontend: http://localhost:5173

    Backend API: http://localhost:3000

    Swagger Docs: http://localhost:3000/api/docs (solo desarrollo)

Para entorno de testing (producción simulada):
bash

make test-up

    Frontend servido por Nginx en puerto 80: http://localhost

DETENCIÓN Y LIMPIEZA

    Para desarrollo: make dev-down o make clean-dev (elimina datos)

    Para testing: make test-down o make clean-test (elimina datos)

INTEGRACIONES EXTERNAS
======================

INTEGRACIÓN CON POKEAPI

El PokemonService se integra con la PokeAPI externa:

    URL Base: https://pokeapi.co/api/v2/pokemon/{id}

    Rango de IDs: 1-898 (Generaciones I-VIII)

    Extracción de respuesta: campo sprites.front_default

    Manejo de errores: Bloques try/catch con logging detallado

    Validación: Validación de estructura de respuesta antes del procesamiento

SERVIDOR WEBSOCKET

El PokemonGateway implementa comunicación bidireccional en tiempo real:

    Protocolo: Socket.IO sobre WebSocket

    Autenticación: Validación de token JWT al momento de conexión

    Eventos:

        request-sprite: Cliente solicita nuevo sprite aleatorio

        sprite-data: Servidor emite información del sprite

        delete-sprite: Cliente solicita eliminación de sprite

    Guardias: @UseGuards(AuthGuard('jwt')) en la clase gateway

FUENTES: TECHNICAL_ASSESSMENT.md104-127

IMPLEMENTACIÓN DE SEGURIDAD
===========================

Los requisitos de seguridad constituyen el 25% de la puntuación de evaluación.

MEDIDAS DE SEGURIDAD (CUMPLIMIENTO OWASP TOP 10 2021)
Categoría OWASP	Implementación
A01: Broken Access Control	@UseGuards en rutas protegidas, guards de Vue Router verificando estado de autenticación
A02: Cryptographic Failures	Hashing bcrypt (10+ salt rounds), JWT_SECRET desde variables de entorno
A03: Injection	DTOs con class-validator, consultas parametrizadas de TypeORM
A05: Security Misconfiguration	Orígenes CORS específicos, configuración basada en entorno, mensajes genéricos
A07: Identification/Authentication	Validación fuerte de contraseñas, expiración de tokens JWT (1 hora), cookies HTTP-Only
A08: Software and Data Integrity	Validación de respuesta de API externa, verificación de estructura
A09: Security Logging Failures	NestJS Logger para eventos de seguridad, logs detallados en servidor
A10: Server-Side Request Forgery	URL base fija de PokeAPI, sin URLs controladas por usuario, generación de IDs en servidor

FUENTES: TECHNICAL_ASSESSMENT.md196-226, README.md23-25

ESTÁNDARES DE DESARROLLO
========================

El proyecto aplica controles de calidad automatizados mediante GitHub Actions:

COMPROBACIONES DE CALIDAD