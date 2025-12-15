![Baner](https://www.baselabs.mx/images/logo-with-icon.png)

# Bob's Corn API

API REST desarrollada con TypeScript y Node.js que permite a los clientes realizar compras de maíz. El sistema implementa control de rate limiting para gestionar el tráfico de solicitudes, registra las transacciones exitosas y de rate limit en base de datos y proporciona endpoints para consultar el historial de compras. Incluye validación de datos, manejo centralizado de errores y logging estructurado para facilitar el monitoreo y debugging del sistema.

## Arquitectura

Este proyecto sigue los principios de **Clean Architecture**, organizando el código en capas bien definidas:

- **Domain**: Interfaces de repositorios y entidades del dominio
- **Application**: Casos de uso y lógica de negocio
- **Infrastructure**: Implementaciones técnicas (bases de datos, cache, HTTP)
- **Presentation**: Handlers y rutas HTTP

- ![arquitecture](https://github.com/user-attachments/assets/81397599-6609-4480-b05d-474989099a9e)


Esta estructura garantiza separación de responsabilidades, testabilidad, mantenibilidad y la independencia del código de negocio respecto a frameworks y tecnologías externas.

## Stack Tecnológico

- **Runtime**: Node.js (>=18.0.0) con TypeScript
- **Framework HTTP**: Fastify
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Cache y Rate Limiting**: Redis con ioredis
- **Validación**: Zod
- **Logging**: Pino
- **Testing**: Jest
- **Containerización**: Docker y Docker Compose
- **Seguridad**: Helmet y CORS (habilitado a cualquier cliente *)

## Requisitos Previos

- Node.js >= 18.0.0
- Yarn (gestor de paquetes)
- Docker y Docker Compose
- Git

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd backend
```

### 2. Instalar dependencias

```bash
yarn install
```

### 3. Configurar variables de entorno

Crea los archivos de configuración necesarios:

- `.env.dev` - Variables de entorno para desarrollo
- `.env.prod` - Variables de entorno para producción

Ejemplo de estructura de `.env.dev`:

```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bobs_corn_db
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=1
CORS_ORIGIN=*
```

### 4. Levantar servicios con Docker Compose

```bash
docker-compose up -d
```

Esto iniciará los siguientes servicios:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- pgAdmin (puerto 5050)
- Redis Commander (puerto 8081)

### 5. Ejecutar migraciones de base de datos

```bash
yarn db:migrate:deploy
```

### 6. Generar cliente de Prisma

```bash
yarn db:generate
```

### 7. Iniciar el servidor en modo desarrollo

```bash
yarn dev
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

### Desarrollo

- `yarn dev` - Inicia el servidor en modo desarrollo con hot-reload
- `yarn dev:prod` - Inicia el servidor en modo producción con hot-reload
- `yarn start` - Inicia el servidor en modo producción (requiere build previo)
- `yarn start:dev` - Inicia el servidor en modo desarrollo (requiere build previo)

### Build

- `yarn build` - Compila el código TypeScript y genera el cliente de Prisma
- `yarn build:prod` - Compila el código TypeScript para producción

### Testing

- `yarn test` - Ejecuta todos los tests (unitarios y E2E)
- `yarn test:unit` - Ejecuta solo los tests unitarios
- `yarn test:e2e` - Ejecuta solo los tests E2E
- `yarn test:watch` - Ejecuta todos los tests en modo watch
- `yarn test:watch:unit` - Ejecuta tests unitarios en modo watch
- `yarn test:watch:e2e` - Ejecuta tests E2E en modo watch
- `yarn test:coverage` - Genera reporte de cobertura de todos los tests
- `yarn test:coverage:unit` - Genera reporte de cobertura de tests unitarios
- `yarn test:coverage:e2e` - Genera reporte de cobertura de tests E2E

### Linting y Formato

- `yarn lint` - Ejecuta ESLint para verificar problemas de código
- `yarn lint:fix` - Ejecuta ESLint y corrige automáticamente los problemas
- `yarn format` - Formatea el código con Prettier
- `yarn format:check` - Verifica si el código cumple con el formato de Prettier
- `yarn typecheck` - Verifica errores de tipos de TypeScript sin compilar
- `yarn check` - Ejecuta typecheck, lint y format:check en secuencia

### Base de Datos

- `yarn db:generate` - Genera el cliente de Prisma
- `yarn db:push` - Sincroniza el esquema con la base de datos (sin crear migraciones)
- `yarn db:migrate` - Crea y aplica una nueva migración
- `yarn db:migrate:deploy` - Aplica todas las migraciones pendientes
- `yarn db:migrate:reset` - Resetea la base de datos y aplica todas las migraciones
- `yarn db:studio` - Abre Prisma Studio (interfaz visual para la base de datos)
- `yarn db:seed` - Ejecuta los seeders de la base de datos

## Endpoints Disponibles

- `GET /api/v001/health` - Health check del sistema
- `POST /api/v001/purchases` - Realizar una compra de maíz
- `GET /api/v001/purchases` - Consultar historial de compras (con filtros opcionales: limit, offset, status)

## Herramientas de Desarrollo

- **pgAdmin**: `http://localhost:5050` - Interfaz web para gestionar PostgreSQL
- **Redis Commander**: `http://localhost:8081` - Interfaz web para visualizar y gestionar Redis
- **Prisma Studio**: Ejecutar `yarn db:studio` - Interfaz visual para explorar y editar datos en la base de datos


## Autores ✒️

- **Andrés Coello Goyes** - _SOFTWARE ENGINEER_ - [Andres Coello](https://linktr.ee/gandrescoello)

#### 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://andres-coello-goyes.vercel.app/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andrescoellogoyes/)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/acoellogoyes)

## Expresiones de Gratitud 🎁

- Pasate por mi perfil para ver algun otro proyecto 📢
- Desarrollemos alguna app juntos, puedes escribirme en mis redes.
- Muchas gracias por pasarte por este proyecto 🤓.

---

⌨️ con ❤️ por [Andres Coello Goyes](https://linktr.ee/gandrescoello) 😊
