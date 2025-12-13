# Bob's Corn API

A clean, production-ready Node.js + TypeScript API built with Fastify, following Clean Architecture principles and Domain-Driven Design (DDD).

## Tech Stack

- **Node.js** (LTS)
- **TypeScript** (strict mode)
- **Fastify** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **Zod** - Schema validation
- **Pino** - Logging
- **Jest** - Testing

## Architecture

The project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── domain/          # Domain layer (entities, repository interfaces)
├── application/     # Application layer (use cases, services)
├── infrastructure/  # Infrastructure layer (database, cache, external services)
├── routes/          # HTTP routes
└── config/          # Configuration (env, logger)
```

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL (local or remote)
- Redis (local or remote)

## Local Development

### Using Docker (Optional)

For local development, you can use Docker to run PostgreSQL and Redis:

```bash
docker-compose up -d
```

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up environment files:

   **For Development:**
   ```bash
   cp .env.dev.example .env.dev
   ```
   Then update `.env.dev` with your local development configuration.

   **For Production (local testing):**
   ```bash
   cp .env.prod.example .env.prod
   ```
   Then update `.env.prod` with your production configuration.

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:3000`

**Note:** The project uses separate environment files (`.env.dev` and `.env.prod`) that are automatically loaded based on the `APP_ENV` variable set in the scripts.

## Scripts

### Development
- `npm run dev` - Start development server with hot reload (uses `.env.dev`)
- `npm run dev:prod` - Start development server with production config (uses `.env.prod`)
- `npm run start:dev` - Start built server in development mode (uses `.env.dev`)

### Production
- `npm run build` - Build the project for development (outputs to `dist/`)
- `npm run build:prod` - Build the project for production (outputs to `dist/`)
- `npm start` - Start production server (uses `.env.prod`, requires build first)

### Testing & Quality
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run typecheck` - Type check without building
- `npm run lint` - Lint the codebase
- `npm run commitlint` - Validate commit message format

### Environment Files

The project uses separate environment files:
- `.env.dev` - Development environment (loaded with `APP_ENV=development`)
- `.env.prod` - Production environment (loaded with `APP_ENV=production`)

The appropriate file is automatically selected based on the `APP_ENV` environment variable set in the scripts.

## Environment Variables

Required environment variables:

```env
# Server
NODE_ENV=development|production|test
PORT=3000
HOST=0.0.0.0

# PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD= (optional)
REDIS_DB=0

# Logging
LOG_LEVEL=fatal|error|warn|info|debug|trace
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the API and its dependencies (PostgreSQL, Redis).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "services": {
    "database": true,
    "cache": true
  }
}
```

## Deployment

The application is designed to be deployed to Railway. Ensure that:

1. Environment variables are set in Railway
2. PostgreSQL and Redis are provisioned as managed services
3. The build process runs: `npm run build`
4. The start command is: `npm start`

## Project Structure

- **Domain Layer**: Pure business logic, no framework dependencies
- **Application Layer**: Use cases and orchestration logic
- **Infrastructure Layer**: External dependencies (database, cache, APIs)
- **Routes**: HTTP request handlers

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. All commits are automatically validated using commitlint.

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Example:**
```bash
git commit -m "feat(infrastructure): add error handler middleware"
```

For detailed information, see [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md).

## License

ISC

