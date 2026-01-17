# Prueba Técnica Full-Stack: NestJS + Vue 3 + Docker

Bienvenido a la prueba técnica para el rol de Consultor de Tecnología. Este repositorio contiene una base de código moderna pero incompleta funcionalmente, diseñada para evaluar tus habilidades en desarrollo Full-Stack, arquitectura de software, contenedores y seguridad.

---

## 🎯 Objetivo

Tu misión es **completar la implementación** de una aplicación que gestiona autenticación de usuarios y visualización de sprites de Pokémon en tiempo real, siguiendo estrictamente los requerimientos definidos.

No buscamos solo "que funcione", buscamos:

- **Calidad de código**: Clean Code, SOLID, tipado fuerte.
- **Seguridad**: Implementación proactiva de OWASP Top 10.
- **Infraestructura**: Manejo correcto de Docker y variables de entorno.
- **Manejo de errores**: Robustez ante fallos externos.

---

## 📚 Documentación Importante

Antes de empezar, es **OBLIGATORIO** leer los siguientes documentos incluidos en este repositorio:

1. [`TECHNICAL_ASSESSMENT.md`](./TECHNICAL_ASSESSMENT.md): Contiene las instrucciones detalladas, historias de usuario, criterios de aceptación y guía de entrega.
2. [`OWASP_REQUIREMENTS.md`](./OWASP_REQUIREMENTS.md): Detalla los requisitos de seguridad **críticos** que debes implementar. Su cumplimiento representa el 25% de la nota.

---

## 🛠️ Stack Tecnológico Base

- **Backend**: NestJS, TypeORM, PostgreSQL.
- **Frontend**: Vue 3, Pinia, TailwindCSS, Vee-Validate.
- **Infraestructura**: Docker, Docker Compose (Multi-stage builds).

---

## 🚀 Cómo Iniciar

El proyecto ha sido configurado para soportar dos entornos mediante Docker Compose.

### 1. Configuración de Entorno

Copia el archivo de ejemplo y configura tus variables (especialmente `JWT_SECRET` y credenciales de DB):

```bash
cp .env.example .env
```

### 2. Ejecutar en Desarrollo (Hot-Reload)

Para desarrollar, utiliza el archivo `docker-compose.dev.yml`. Este entorno monta el código fuente como volúmenes para permitir hot-reload tanto en backend como frontend.

```bash
# Levantar el entorno de integración
docker-compose -f docker-compose.dev.yml up --build
```

- **Frontend**: <http://localhost:5173>
- **Backend**: <http://localhost:3000>
- **Swagger**: <http://localhost:3000/api/docs>

> **IMPORTANTE**: Deberás completar el archivo `docker-compose.dev.yml` (y los `Dockerfile`) ya que contienen secciones `TODO`.

### 3. Ejecutar en Modo Test/Producción

Para verificar tu entrega final, utiliza `docker-compose.test.yml`. Este entorno simula producción: no monta volúmenes de código, usa imágenes compiladas y optimizadas, y sirve el frontend con Nginx.

```bash
docker-compose -f docker-compose.test.yml up --build
```

- **App**: <http://localhost:80> (o el puerto que configures)

---

## 🧪 Resumen de Tareas Pendientes

El código base tiene múltiples comentarios `TODO` guiándote. Las tareas principales son:

1. **Backend Auth**: Completar `AuthService` (login, register), `JwtStrategy` y proteger rutas.
2. **Backend Pokémon**: Integrar PokeAPI, mejorar manejo de errores y preparar el Gateway (que fue eliminado intencionalmente).
3. **Frontend**: Implementar vistas de Login, Registro y Dashboard (actualmente son placeholders).
4. **Docker**: Configurar correctamente los Dockerfiles multi-stage y las redes en docker-compose.
5. **Seguridad**: Asegurar la aplicación según `OWASP_REQUIREMENTS.md`.

---

## 📦 Entrega

1. Asegúrate de que `docker-compose.test.yml` levante todo el stack correctamente.
2. Incluye un archivo `SOLUTION.md` (opcional) si deseas explicar decisiones técnicas complejas.
3. Sube tu solución a un repositorio o entrega el archivo comprimido según las instrucciones de RRHH.

¡Mucho éxito! Demuestra tu potencial. 🚀
