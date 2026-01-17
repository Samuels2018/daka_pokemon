# Prueba Técnica Full-Stack: Tiendas DAKA

## 📋 Descripción General

Esta es una prueba técnica diseñada para evaluar tus habilidades como desarrollador Full-Stack. Deberás completar una aplicación web que incluye autenticación de usuarios y visualización en tiempo real de sprites de Pokémon utilizando **NestJS** (backend) y **Vue.js 3** (frontend).

## ⏱️ Tiempo Estimado

De **48** y **72** horas para completar todas las funcionalidades requeridas.

---

## 🎯 Objetivos de la Prueba

Implementar:

1. **Sistema de Autenticación Completo** (Backend + Frontend)
2. **Integración con API Externa** (PokeAPI)
3. **Comunicación en Tiempo Real** (WebSockets)
4. **Infraestructura Docker** (Multi-stage builds, ambientes dev/test)
5. **Mejores Prácticas de Seguridad** (OWASP Top 10)
6. **Manejo Robusto de Errores**

---

## 📦 Funcionalidades a Implementar

### 1. Autenticación de Usuarios (Backend)

**Ubicación**: `backend/src/auth/`

Debes completar la implementación del módulo de autenticación:

#### ✅ Registro de Usuarios (`AuthService.register()`)

- Validar que el usuario no exista
- **Hash de contraseña** usando bcrypt
- Guardar usuario en PostgreSQL
- Retornar mensaje de éxito

#### ✅ Login (`AuthService.login()`)

- Validar credenciales
- Comparar password hasheado
- **Generar JWT token**
- Retornar token y datos del usuario

#### ✅ JWT Strategy

- Completar `jwt.strategy.ts`
- Implementar validación de token
- Verificar que el usuario existe

#### ✅ Guards de Protección

- Proteger rutas con `@UseGuards(AuthGuard('jwt'))`
- Implementar el guard correctamente

#### ✅ Manejo de Errores HTTP

- `UnauthorizedException` para credenciales inválidas
- `BadRequestException` para usuarios duplicados
- Try/catch en todas las operaciones async

---

### 2. Autenticación de Usuarios (Frontend)

**Ubicación**: `frontend/src/`

Debes crear las siguientes vistas:

#### ✅ Vista de Login (`views/LoginView.vue`)

- Formulario con username y password
- Validación con **Vee-Validate + Zod**
- Llamar al endpoint `/auth/login`
- Guardar token (evalúa la mejor opción: sessionStorage, localStorage, cookies)
- Redirigir a Dashboard al tener éxito
- Mostrar errores al usuario

#### ✅ Vista de Registro (`views/RegisterView.vue`)

- Formulario con username, password, confirmPassword
- Validación de contraseña (mínimo 6 caracteres)
- Validar que las contraseñas coincidan
- Llamar al endpoint `/auth/register`
- Redirigir a login tras registro exitoso

#### ✅ Pinia Store (`stores/auth.ts`)

- Completar métodos `login()`, `register()`, `logout()`
- Gestionar estado del usuario
- Gestionar token de autenticación

#### ✅ Route Guards (`router/index.ts`)

- Proteger ruta `/dashboard` (requiere autenticación)
- Redirigir a login si no está autenticado
- Prevenir acceso a login/register si ya está autenticado

---

### 3. Sistema de Pokémon en Tiempo Real

#### Backend

**Ubicación**: `backend/src/pokemon/`

#### ✅ PokemonService

- Implementar método `getRandomSprite()`:
  - Generar ID aleatorio (1-898)
  - Llamar a PokeAPI: `https://pokeapi.co/api/v2/pokemon/{id}`
  - **Manejo de errores**: try/catch, validar respuesta
  - Extraer `sprites.front_default` y `name`
  - Retornar objeto `{ id, url, name }`

#### ✅ PokemonGateway (WebSocket)

- **Crear archivo** `pokemon.gateway.ts`
- Implementar `@WebSocketGateway()`
- **Autenticación de WebSocket**: validar JWT en conexión
- Evento `request-sprite`: obtener sprite y emitir al cliente
- Evento `delete-sprite`: manejar eliminación
- **Manejo de errores**: desconectar clientes sin token válido

#### Frontend

**Ubicación**: `frontend/src/views/`

#### ✅ Vista Dashboard (`views/DashboardView.vue`)

- Conectar a WebSocket con autenticación (enviar JWT)
- Botón "Request Sprite" que emita evento `request-sprite`
- Mostrar lista de sprites recibidos
- Botón "Delete" por cada sprite
- Botón "Delete All" para limpiar lista
- **Animaciones**: entrada suave de sprites
- **Responsive design**: grid que se adapte a móvil/desktop

---

### 4. Infraestructura Docker

#### ✅ Backend Dockerfile (Multi-stage)

**Ubicación**: `backend/Dockerfile`

Debes completar el Dockerfile con:

- **Stage 1 (builder)**:
  - Base: `node:20-slim`
  - Instalar dependencias
  - Compilar aplicación TypeScript
  
- **Stage 2 (production)**:
  - Base: `node:20-slim`
  - Copiar solo dependencias de producción
  - Copiar build desde stage anterior
  - **Usuario no-root** para seguridad
  - Exponer puerto 3000
  - CMD para ejecutar aplicación

#### ✅ Frontend Dockerfile (Multi-stage)

**Ubicación**: `frontend/Dockerfile`

- **Stage 1 (builder)**: Build de Vite
- **Stage 2 (production)**: Servidor nginx con el build estático

#### ✅ Docker Compose para Desarrollo

**Ubicación**: `docker-compose.dev.yml`

Debes completar:

- **Definir red interna** para comunicación entre servicios
- **Definir volúmenes**:
  - Base de datos PostgreSQL (persistencia)
  - node_modules del backend
  - node_modules del frontend
- **Health checks** para todos los servicios
- Variables de entorno apropiadas

#### ✅ Docker Compose para Test/Producción

**Ubicación**: `docker-compose.test.yml`

- Similar al dev pero usando las imágenes de producción
- Sin volúmenes de código fuente (solo código compilado)
- Configuraciones de producción

---

## 🔒 Requisitos de Seguridad (OWASP Top 10)

> [!IMPORTANT]
> **Debes implementar las mejores prácticas de seguridad**. Consulta el archivo `OWASP_REQUIREMENTS.md` para detalles específicos.

### Requisitos Mínimos

1. **A01 - Broken Access Control**:
   - Guards en todas las rutas protegidas
   - Validación de permisos en backend

2. **A02 - Cryptographic Failures**:
   - Hash de contraseñas con bcrypt (salt rounds >= 10)
   - JWT con secret fuerte (variable de entorno)
   - NUNCA hardcodear secretos

3. **A03 - Injection**:
   - Usar TypeORM (previene SQL injection)
   - Validar TODA entrada con `class-validator`
   - Sanitizar datos

4. **A05 - Security Misconfiguration**:
   - CORS configurado específicamente (no `*`)
   - Variables de entorno para secretos
   - Separación dev/production

5. **A07 - Authentication Failures**:
   - Validación robusta de contraseñas
   - Expiración de tokens JWT
   - Mensajes de error genéricos (no revelar si usuario existe)

---

## 🚨 Manejo de Errores

### Backend

**Requerido en TODOS los servicios**:

```typescript
// ✅ CORRECTO
async someMethod() {
    try {
        const result = await externalAPI.call();
        return result;
    } catch (error) {
        this.logger.error('Error detail', error);
        throw new HttpException(
            'User-friendly message',
            HttpStatus.BAD_GATEWAY
        );
    }
}
```

### Frontend

**Requerido en TODAS las llamadas API**:

```typescript
// ✅ CORRECTO
try {
    await authStore.login(username, password);
    router.push('/dashboard');
} catch (error) {
    // Mostrar mensaje de error al usuario
    errorMessage.value = error.response?.data?.message || 'Error de conexión';
}
```

---

## 📊 Criterios de Evaluación

| Criterio | Peso | Descripción |
|----------|------|-------------|
| **Funcionalidad** | 30% | ¿Funciona todo según especificaciones? |
| **Seguridad (OWASP)** | 25% | ¿Se implementaron las mejores prácticas? |
| **Calidad de Código** | 20% | ¿Es mantenible, limpio, bien estructurado? |
| **Manejo de Errores** | 15% | ¿Errores manejados robustamente? |
| **Docker** | 10% | ¿Dockerfiles optimizados? ¿Ambientes separados? |

---

## 📦 Entregables

### Debes entregar

1. **Código Fuente Completo**
   - Todos los archivos modificados/creados
   - Sin `node_modules` (usar .gitignore)

2. **Dockerfiles Completos**
   - `backend/Dockerfile`
   - `frontend/Dockerfile`
   - `docker-compose.dev.yml`
   - `docker-compose.test.yml`

3. **Documentación**
   - `README.md` actualizado con instrucciones de ejecución
   - Comentarios en código complejo
   - Variables de entorno documentadas

4. **Archivo `.env.example`**
   - Con todas las variables necesarias
   - Sin valores sensibles reales

---

## 🚀 Instrucciones de Inicio

### Pre-requisitos

- Docker y Docker Compose instalados
- Node.js 20+ (para desarrollo local opcional)
- Git

### Ejecutar en Desarrollo

```bash
# Copiar variables de entorno
cp .env.example .env

# Iniciar con Docker
docker-compose -f docker-compose.dev.yml up --build

# La aplicación estará disponible en:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

### Ejecutar en Test (Producción)

```bash
docker-compose -f docker-compose.test.yml up --build
```

---

## 💡 Consejos

1. **Lee TODO el archivo `OWASP_REQUIREMENTS.md`** antes de empezar
2. **Busca comentarios `// TODO:`** en el código - te guiarán
3. **Prueba frecuentemente** - no dejes todo para el final
4. **Manejo de errores** - implementa try/catch desde el inicio
5. **Git commits** - haz commits descriptivos de tu progreso
6. **Documentación** - comenta las decisiones importantes

---

## 📚 Recursos Útiles

- [NestJS Docs](https://docs.nestjs.com/)
- [Vue.js 3 Docs](https://vuejs.org/)
- [PokeAPI Docs](https://pokeapi.co/docs/v2)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## ❓ Preguntas

Si tienes dudas sobre los requisitos, anota tus suposiciones en el README.md y procede con la implementación más razonable.

**¡Éxito con la prueba técnica! 🚀**
