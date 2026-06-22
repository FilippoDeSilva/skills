---
name: effoy-backend
description: Comprehensive guide for the Effoy Core System - a NestJS wedding management application. Use when working on this project, implementing new features, refactoring code, or troubleshooting issues. Covers architecture, configuration, utilities, database (PostgreSQL + Prisma), authentication, background jobs, and development workflows.
version: 1.0.0
author: FilippoDeSilva
tags:
  - nestjs
  - prisma
  - postgres
  - redis
  - bullmq
  - rbac
  - websocket
---

# Effoy Core System - Project Architecture & Developer Guide

## Overview

This is a NestJS-based wedding management system with PostgreSQL (Prisma ORM), Redis caching, BullMQ for background jobs, and comprehensive authentication/authorization. The project uses a modular architecture with dynamic module loading based on environment configuration.

## Project Structure

```
effoy-core-system/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/                    # API modules (feature-based)
â”‚   â”‚   â”œâ”€â”€ auth/              # Authentication module
â”‚   â”‚   â”œâ”€â”€ health/            # Health check endpoints
â”‚   â”‚   â”œâ”€â”€ home/              # Home controller
â”‚   â”‚   â”œâ”€â”€ invoice/           # Invoice management
â”‚   â”‚   â”œâ”€â”€ notification/      # Notification system
â”‚   â”‚   â”œâ”€â”€ payment/           # Payment processing
â”‚   â”‚   â”œâ”€â”€ post/              # Post/blog functionality
â”‚   â”‚   â”œâ”€â”€ user/              # User management
â”‚   â”‚   â””â”€â”€ wedding/           # Wedding-related features
â”‚   â”œâ”€â”€ background/            # Background job processing
â”‚   â”‚   â””â”€â”€ queues/            # BullMQ queues
â”‚   â”‚       â”œâ”€â”€ email-queue/   # Email verification jobs
â”‚   â”‚       â””â”€â”€ notification-queue/ # Notification jobs
â”‚   â”œâ”€â”€ common/                # Shared/common code
â”‚   â”‚   â”œâ”€â”€ config/            # Common configurations
â”‚   â”‚   â”œâ”€â”€ dto/               # Common DTOs
â”‚   â”‚   â”œâ”€â”€ interfaces/        # Common interfaces
â”‚   â”‚   â”œâ”€â”€ types/             # Common types
â”‚   â”‚   â””â”€â”€ utils/             # Common utilities
â”‚   â”œâ”€â”€ config/                # Centralized configuration
â”‚   â”‚   â”œâ”€â”€ app/               # App configuration
â”‚   â”‚   â”œâ”€â”€ auth/              # Auth configuration
â”‚   â”‚   â”œâ”€â”€ database/          # Database configuration
â”‚   â”‚   â”œâ”€â”€ mail/              # Mail configuration
â”‚   â”‚   â”œâ”€â”€ redis/             # Redis configuration
â”‚   â”‚   â”œâ”€â”€ bull-queue/        # BullMQ configuration
â”‚   â”‚   â””â”€â”€ config.type.ts     # Main config type
â”‚   â”œâ”€â”€ constants/             # Application constants
â”‚   â”œâ”€â”€ decorators/            # Custom decorators
â”‚   â”œâ”€â”€ exceptions/            # Custom exceptions
â”‚   â”œâ”€â”€ filters/               # Global filters
â”‚   â”œâ”€â”€ guards/                # Auth/authorization guards
â”‚   â”œâ”€â”€ i18n/                  # Internationalization
â”‚   â”œâ”€â”€ libs/                  # External library integrations
â”‚   â”‚   â”œâ”€â”€ aws/               # AWS services
â”‚   â”‚   â””â”€â”€ gcp/               # GCP services
â”‚   â”œâ”€â”€ mail/                  # Mail service
â”‚   â”œâ”€â”€ prisma/                # Prisma ORM service
â”‚   â”œâ”€â”€ sms/                   # SMS service (Twilio)
â”‚   â”œâ”€â”€ utils/                 # Utility functions
â”‚   â”œâ”€â”€ app.module.ts          # Root module
â”‚   â””â”€â”€ main.ts                # Application bootstrap
â”œâ”€â”€ prisma/                    # Prisma schema and migrations
â”œâ”€â”€ test/                      # E2E tests
â”œâ”€â”€ docs/                      # Documentation
â”œâ”€â”€ skills/                    # Project-specific skills
â””â”€â”€ package.json               # Dependencies
```

## Configuration Structure

### Centralized Configuration Location
All configuration files are located in `src/config/` with feature-based subfolders:

```
src/config/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ app.config.ts          # App-level config (port, env, cors, etc.)
â”‚   â”œâ”€â”€ app-config.type.ts     # App config type definition
â”‚   â””â”€â”€ app-config.spec.ts     # App config tests
â”œâ”€â”€ auth/
â”‚   â”œâ”€â”€ auth.config.ts         # JWT and auth config
â”‚   â”œâ”€â”€ auth-config.type.ts    # Auth config type definition
â”‚   â””â”€â”€ auth-config.spec.ts    # Auth config tests
â”œâ”€â”€ database/
â”‚   â”œâ”€â”€ database.config.ts     # Database connection config
â”‚   â”œâ”€â”€ database-config.type.ts # Database config type definition
â”‚   â””â”€â”€ database-config.spec.ts # Database config tests
â”œâ”€â”€ mail/
â”‚   â”œâ”€â”€ mail.config.ts         # Mailer configuration
â”‚   â”œâ”€â”€ mail-config.type.ts    # Mail config type definition
â”‚   â””â”€â”€ mail-config.spec.ts    # Mail config tests
â”œâ”€â”€ redis/
â”‚   â”œâ”€â”€ redis.config.ts        # Redis connection config
â”‚   â””â”€â”€ redis-config.type.ts    # Redis config type definition
â”œâ”€â”€ bull-queue/
â”‚   â””â”€â”€ bull-queue.config.ts    # BullMQ queue configurations
â””â”€â”€ config.type.ts             # Main config type (AllConfigType)
```

### Configuration Access Pattern
- Use `ConfigService` to access configuration values
- Example: `configService.get<string>('database.url')`
- Type-safe access via `AllConfigType` interface
- All configs use `registerAs` pattern with validation

### Key Configuration Variables

**App Config (`src/config/app/app.config.ts`)**
- `NODE_ENV`: Environment (development/production)
- `APP_NAME`: Application name
- `APP_URL`: Application URL
- `APP_PORT`: Server port (default: 3000)
- `APP_DEBUG`: Debug mode
- `API_PREFIX`: API prefix (default: 'api')
- `APP_FALLBACK_LANGUAGE`: Default language
- `APP_LOG_LEVEL`: Logging level
- `APP_LOG_SERVICE`: Log service (console/file)
- `APP_MODULES_SET`: Module set (monolith/api/background)
- `APP_CORS_ORIGIN`: CORS origin configuration

**Database Config (`src/config/database/database.config.ts`)**
- `DATABASE_URL`: PostgreSQL connection string (primary)
- `DATABASE_TYPE`: Database type (postgres)
- `DATABASE_HOST`: Database host
- `DATABASE_PORT`: Database port (default: 5432)
- `DATABASE_USERNAME`: Database username
- `DATABASE_PASSWORD`: Database password
- `DATABASE_NAME`: Database name
- `DATABASE_LOGGING`: Enable query logging
- `DATABASE_SYNCHRONIZE`: Auto-sync schema
- `DATABASE_MAX_CONNECTIONS`: Max pool size
- `DATABASE_SSL_ENABLED`: Enable SSL
- `DATABASE_REJECT_UNAUTHORIZED`: SSL cert validation
- `DATABASE_CA`: SSL CA certificate
- `DATABASE_KEY`: SSL key
- `DATABASE_CERT`: SSL certificate

**Auth Config (`src/config/auth/auth.config.ts`)**
- `AUTH_JWT_SECRET`: JWT secret key
- `AUTH_JWT_TOKEN_EXPIRES_IN`: Access token expiry
- `AUTH_REFRESH_TOKEN_SECRET`: Refresh token secret
- `AUTH_REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiry
- `AUTH_REFRESH_TOKEN_ENABLED`: Enable refresh tokens
- `AUTH_FORGOT_PASSWORD_SECRET`: Forgot password secret
- `AUTH_FORGOT_PASSWORD_EXPIRES_IN`: Forgot password token expiry
- `AUTH_FORGOT_PASSWORD_ENABLED`: Enable forgot password
- `AUTH_CONFIRM_EMAIL_SECRET`: Email confirmation secret
- `AUTH_CONFIRM_EMAIL_EXPIRES_IN`: Email confirmation token expiry
- `AUTH_CONFIRM_EMAIL_ENABLED`: Enable email confirmation

**Redis Config (`src/config/redis/redis.config.ts`)**
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password
- `REDIS_TLS_ENABLED`: Enable TLS

**Mail Config (`src/config/mail/mail.config.ts`)**
- `MAIL_HOST`: SMTP host
- `MAIL_PORT`: SMTP port
- `MAIL_USER`: SMTP username
- `MAIL_PASS`: SMTP password
- `MAIL_IGNORE_TLS`: Ignore TLS
- `MAIL_SECURE`: Use SSL
- `MAIL_REQUIRE_TLS`: Require TLS
- `MAIL_DEFAULT_EMAIL`: Default sender email
- `MAIL_DEFAULT_NAME`: Default sender name

## Utilities and Helpers

### Location: `src/utils/`

**Authentication Utilities**
- `auth.util.ts`: JWT token generation and verification
- `password.util.ts`: Password hashing and comparison

**Data Utilities**
- `data.util.ts`: Data transformation helpers
- `cursor-pagination.ts`: Cursor-based pagination
- `offset-pagination.ts`: Offset-based pagination
- `load-more.ts`: Load more functionality

**Validation & Configuration**
- `validate-config.ts`: Environment variable validation
- `env.util.ts`: Environment variable helpers

**Logging & Monitoring**
- `logger-factory.ts`: Logger factory for Pino
- `mailer-custom-logger.ts`: Custom mailer logger

**API Documentation**
- `setup-swagger.ts`: Swagger/OpenAPI setup

**Other Utilities**
- `cache.util.ts`: Cache helpers
- `phone.util.ts`: Phone number normalization
- `otp.util.ts`: OTP generation and verification
- `uuid.util.ts`: UUID generation helpers

**Module Configuration**
- `modules-set.ts`: Dynamic module loading based on environment
  - Supports: monolith, api, background, default
  - Configures modules based on `MODULES_SET` env var

## Architecture & Connections

### Module Loading Architecture

The application uses dynamic module loading based on the `MODULES_SET` environment variable:

**Monolith Mode** (default)
- Loads all modules: ApiModule, BullModule, BackgroundModule, CacheModule, DbModule, I18nModule, MailModule, SmsModule

**API Mode**
- Loads: ApiModule, CacheModule, DbModule, I18nModule, MailModule, SmsModule

**Background Mode**
- Loads: BullModule, BackgroundModule, CacheModule, DbModule, I18nModule, MailModule

**Default Mode**
- Loads: ApiModule, BullModule, BackgroundModule, CacheModule, DbModule, I18nModule, MailModule

### Database Layer

**Prisma Service** (`src/prisma/prisma.service.ts`)
- Extends PrismaClient
- Uses PrismaPg adapter for PostgreSQL
- Connection string from `DATABASE_URL` environment variable
- Implements OnModuleInit/OnModuleDestroy lifecycle hooks

**Note**: Currently uses `process.env.DATABASE_URL` directly. Should be refactored to use ConfigService for consistency.

### Authentication & Authorization

**Guards** (`src/guards/`)
- `auth.guard.ts`: JWT authentication guard
  - Validates JWT tokens
  - Attaches user to request
- `roles.guard.ts`: Role-based authorization
  - Checks user roles
  - Supports role hierarchy

**Decorators** (`src/decorators/`)
- `@CurrentUser()`: Get current user from request
- `@AuthOptional()`: Optional authentication
- `@Public()`: Public route (no auth required)
- `@Roles()`: Specify required roles

### Background Job Processing

**BullMQ Integration** (`src/background/queues/`)

Thequeue system has been refactored with a resilient, secure, and scalable architecture:

Directory Structure:**
```
src/background/queues/
â”œâ”€â”€ base/                      # Base classes and utilities
â”‚   â”œâ”€â”€ base-queue-processor.ts # Abstract processor with common functionality
â”‚   â”œâ”€â”€ base-queue-service.ts   # Abstract service with validation/encryption
â”‚   â”œâ”€â”€ circuit-breaker.util.ts  # Circuit breaker for external services
â”‚   â”œâ”€â”€ graceful-shutdown.util.ts # Graceful shutdown handling
â”‚   â”œâ”€â”€ job-dependencies.util.ts # Job chaining and dependencies
â”‚   â”œâ”€â”€ scheduled-jobs.util.ts   # Cron-like scheduled jobs
â”‚   â””â”€â”€ index.ts                # Barrel exports
â”œâ”€â”€ email-queue/               # Email verification jobs
â”‚   â”œâ”€â”€ email-queue.service.ts
â”‚   â”œâ”€â”€ email.processor.ts
â”‚   â””â”€â”€ email-queue.module.ts
â”œâ”€â”€ notification-queue/        # Notification jobs
â”‚   â”œâ”€â”€ notification-queue.service.ts
â”‚   â”œâ”€â”€ notification.processor.ts
â”‚   â””â”€â”€ notification-queue.module.ts
â”œâ”€â”€ health/                    # Queue health monitoring
â”‚   â””â”€â”€ queue-health.controller.ts
â”œâ”€â”€ metrics/                  # Queue metrics collection
â”‚   â””â”€â”€ queue-metrics.service.ts
â””â”€â”€ validation/                # Job data validation schemas
    â”œâ”€â”€ email-job.validation.ts
    â””â”€â”€ notification-job.validation.ts
```

**Base Classes:**

**BaseQueueProcessor** (`src/background/queues/base/base-queue-processor.ts`)
- Abstract base class for all queue processors
- Provides common functionality:
  - Logging and error handling
  - Job data validation and decryption
  - Metrics emission
  - Retry logic hooks
  - Job lifecycle event handlers
- Extends `WorkerHost` from BullMQ
- Abstract methods to implement:
  - `validateJobData()`: Validate job data before processing
  - `getSensitiveFields()`: Return field names to encrypt
  - `processJob()`: Main job processing logic

**BaseQueueService** (`src/background/queues/base/base-queue-service.ts`)
- Abstract base class for all queue services
- Provides common functionality:
  - Job data validation
  - Sensitive field encryption
  - Job addition with options
  - Bulk job addition
  - Audit logging hooks
- Abstract methods to implement:
  - `getQueueName()`: Return the queue name
  - `getSensitiveFields()`: Return field names to encrypt
  - `validateJobData()`: Validate job data

**Utilities:**

**CircuitBreaker** (`src/background/queues/base/circuit-breaker.util.ts`)
- Prevents cascading failures for external service calls
- Configurable thresholds:
  - `failureThreshold`: Number of failures before opening (default: 5)
  - `successThreshold`: Number of successes before closing (default: 3)
  - `timeout`: Time to wait before attempting recovery (default: 60000ms)
  - `monitoringPeriod`: Time window for failure counting (default: 30000ms)
- States: CLOSED, OPEN, HALF_OPEN
- Registry for managing multiple circuit breakers

**GracefulShutdown** (`src/background/queues/base/graceful-shutdown.util.ts`)
- Ensures jobs aren't lost during application shutdown
- Handles SIGTERM and SIGINT signals
- Closes all registered queues gracefully
- Provides queue statistics before shutdown
- Singleton pattern

**ScheduledJobsManager** (`src/background/queues/base/scheduled-jobs.util.ts`)
- Manages cron-like scheduled jobs
- Supports repeating jobs with cron patterns
- Supports delayed jobs
- Timezone support
- Singleton pattern

**JobDependenciesManager** (`src/background/queues/base/job-dependencies.util.ts`)
- Manages job dependencies and chaining
- Supports sequential job chaining
- Supports parallel job flows
- Limited support for multiple parent dependencies
- Parent job tracking

**QueueMetricsService** (`src/background/queues/metrics/queue-metrics.service.ts`)
- Collects metrics for queue operations
- Supports counters, timings, and gauges
- Provides percentile statistics (p50, p95, p99)
- Singleton pattern
- Can be integrated with Prometheus/Datadog

**Queue Configuration** (`src/config/bull-queue/bull-queue.config.ts`)

**Notification Queue:**
- Concurrency: 20 (increased from 5 for better resource utilization)
- Rate limiting: 50 jobs/second (increased from 10)
- Attempts: 5 (increased from 3)
- Backoff: Exponential, 2 seconds
- Retention: 1 hour for completed, 24 hours for failed
- Stalled job detection: 5 minutes
- Dead letter queue configured

**Email Queue:**
- Concurrency: 10 (increased from 1 for better resource utilization)
- Rate limiting: 20 jobs/second (increased from 1)
- Attempts: 5 (increased from 3)
- Backoff: Exponential, 2 seconds
- Retention: 1 hour for completed, 24 hours for failed
- Stalled job detection: 5 minutes
- Dead letter queue configured

**Security Features:**
- Job data validation before queue addition
- Sensitive field encryption (email, phone, tokens)
- Circuit breaker protection for external services
- Audit logging hooks

**Health Monitoring** (`src/background/queues/health/queue-health.controller.ts`)
- Endpoints:
  - `GET /health/queues` - Overall queue health
  - `GET /health/queues/notification` - Notification queue stats
  - `GET /health/queues/email` - Email queue stats
- Returns queue statistics (waiting, active, completed, failed, delayed)

**Adding a New Queue:**

1. Create queue config in `src/config/bull-queue/bull-queue.config.ts`
2. Create validation schema in `src/background/queues/validation/`
3. Create queue service extending `BaseQueueService<T>`:
   ```typescript
   @Injectable()
   export class MyQueueService extends BaseQueueService<IMyJob> {
     constructor(
       @InjectQueue(QueueName.MY_QUEUE) queue: any,
       configService: ConfigService,
       encryptionUtil: EncryptionUtil,
     ) {
       super('MyQueueService', queue, configService, encryptionUtil);
     }

    getQueueName(): string {
      return QueueName.MY_QUEUE;
    }

    getSensitiveFields(): string[] {
      return ['email', 'phone']; // Fields to encrypt
    }

    async validateJobData(data: IMyJob): Promise<void> {
      // Validation logic
    }
  }
  ```

4. Create processor extending `BaseQueueProcessor<T>`:
  ```typescript
  @Processor(QueueName.MY_QUEUE, {
    concurrency: 10,
    drainDelay: 300,
    stalledInterval: 300000,
  })
  export class MyProcessor extends BaseQueueProcessor<IMyJob> {
    constructor(
      configService: ConfigService,
      encryptionUtil: EncryptionUtil,
      myService: MyService,
    ) {
      super('MyProcessor', configService, encryptionUtil);
      this.myService = myService;
    }

    async validateJobData(data: IMyJob): Promise<void> {
      // Validation logic
    }

    getSensitiveFields(): string[] {
      return ['email', 'phone'];
    }

    async processJob(job: Job<IMyJob>): Promise<any> {
      // Job processing logic
    }
  }
  ```

5. Create module and add to BackgroundModule
6. Add tests mocking dependencies (queue, configService, encryptionUtil)

### Caching Strategy

**Redis Integration**
- Used for session storage
- Rate limiting storage
- Cache backend for various services

**Throttler Configuration**
- Rate limiting for auth endpoints: 5 requests per minute
- Disabled in development for easier testing
- Uses ThrottlerStorageRedisService

### Internationalization (i18n)

**Location**: `src/i18n/`
- Supports multiple languages
- Fallback language configurable
- Used for error messages and UI text

### API Layer Structure

**Standard Module Pattern**:
```
feature/
â”œâ”€â”€ dto/                      # Data Transfer Objects
â”‚   â”œâ”€â”€ create-feature.req.dto.ts
â”‚   â”œâ”€â”€ update-feature.req.dto.ts
â”‚   â””â”€â”€ feature.res.dto.ts
â”œâ”€â”€ feature.controller.ts     # HTTP endpoints
â”œâ”€â”€ feature.service.ts        # Business logic
â”œâ”€â”€ feature.module.ts         # Module definition
â””â”€â”€ __tests__/                # Module tests
    â””â”€â”€ feature.service.spec.ts
```

**Service Pattern**:
- Constructor injects PrismaService
- Methods: create, findAll, findOne, update, remove
- Uses specific DTOs for type safety
- Implements authorization checks
- Throws appropriate exceptions (NotFoundException, ForbiddenException, etc.)

**Controller Pattern**:
- Uses decorators for validation and documentation
- Implements role-based access control
- Uses guards for authentication/authorization
- Returns response DTOs

### Exception Handling

**Global Exception Filter** (`src/filters/global-exception.filter.ts`)
- Catches all exceptions globally
- Formats error responses
- Logs errors appropriately

**Custom Exceptions** (`src/exceptions/`)
- Domain-specific exceptions
- Consistent error handling

### Validation

**Validation Pipe** (configured in `main.ts`)
- Global validation pipe
- Transforms and whitelists DTOs
- Throws UnprocessableEntityException for validation errors

**Custom Validators** (`src/decorators/validators/`)
- `is-ms.decorator.ts`: Validates millisecond duration strings
- Additional custom validators as needed

### API Documentation

**Swagger/OpenAPI** (`src/utils/setup-swagger.ts`)
- Auto-generated API documentation
- Available in development mode
- Configured via setupSwagger utility

## Key Patterns & Best Practices

### 1. Configuration Access
- **DO**: Use `ConfigService` for all configuration access
- **DON'T**: Use `process.env` directly (except in special cases like module loading)
- **Example**: `configService.get<string>('database.url')`

### 2. Service Layer
- **DO**: Inject PrismaService in constructor
- **DO**: Use specific DTOs for request/response
- **DO**: Implement proper authorization checks
- **DO**: Throw specific exceptions (NotFoundException, ForbiddenException)
- **DON'T**: Return raw Prisma entities (use DTOs)

### 3. Controller Layer
- **DO**: Use decorators for validation (@Body, @Query, @Param)
- **DO**: Use @Roles() decorator for authorization
- **DO**: Use @Public() for public endpoints
- **DON'T**: Put business logic in controllers

### 4. Module Organization
- **DO**: Organize by feature, not technical layer
- **DO**: Keep related files in same directory
- **DO**: Use barrel exports for clean imports
- **DON'T**: Create circular dependencies

### 5. Testing
- **DO**: Write unit tests for services
- **DO**: Mock external dependencies (PrismaService, ConfigService)
- **DO**: Test both success and error cases
- **DON'T**: Skip testing edge cases

## Adding New Features

### Step 1: Create Module Structure
```bash
src/api/new-feature/
â”œâ”€â”€ dto/
â”‚   â”œâ”€â”€ create-new-feature.req.dto.ts
â”‚   â”œâ”€â”€ update-new-feature.req.dto.ts
â”‚   â””â”€â”€ new-feature.res.dto.ts
â”œâ”€â”€ new-feature.controller.ts
â”œâ”€â”€ new-feature.service.ts
â”œâ”€â”€ new-feature.module.ts
â””â”€â”€ __tests__/
    â””â”€â”€ new-feature.service.spec.ts
```

### Step 2: Add Configuration (if needed)
```bash
src/config/new-feature/
â”œâ”€â”€ new-feature.config.ts
â”œâ”€â”€ new-feature-config.type.ts
â””â”€â”€ new-feature-config.spec.ts
```

Update `src/config/config.type.ts` to include new config type.

### Step 3: Define DTOs
- Use class-validator decorators for validation
- Use custom decorators for specific validation
- Keep DTOs focused and type-safe

### Step 4: Implement Service
- Inject PrismaService
- Implement CRUD operations
- Add authorization checks
- Use specific exceptions

### Step 5: Implement Controller
- Define endpoints with decorators
- Add role-based authorization
- Use DTOs for request/response
- Document with Swagger decorators

### Step 6: Add to Module Loading
- Update `src/utils/modules-set.ts` if feature needs conditional loading
- Add to appropriate module sets (monolith/api/background)

### Step 7: Write Tests
- Mock PrismaService
- Test all service methods
- Test authorization logic
- Test error handling

## Common Tasks

### Adding a New Environment Variable
1. Add to appropriate config validator class
2. Add to config return object
3. Add to config type definition
4. Update .env.example
5. Use via ConfigService in code

### Adding a New Role
1. Update `src/constants/roles.constant.ts`
2. Update role hierarchy if needed
3. Use @Roles() decorator in controllers
4. Update role guard if needed

### Adding a New Queue
1. Create queue config in `src/config/bull-queue/`
2. Create queue service in `src/background/queues/`
3. Add to background module
4. Implement job processor
5. Add tests

### Adding a New API Endpoint
1. Add method to controller
2. Add corresponding service method
3. Create/update DTOs
4. Add authorization if needed
5. Write tests

## Important Notes

### Database
- Uses PostgreSQL with Prisma ORM
- Connection string: `DATABASE_URL`
- Schema defined in `prisma/schema.prisma`
- Migrations in `prisma/migrations/`

### Redis
- Used for caching and session storage
- Connection configured in `src/config/redis/redis.config.ts`
- Used by rate limiter and cache module

### Background Jobs
- Uses BullMQ for job processing
- Queues defined in `src/config/bull-queue/`
- Processors in `src/background/queues/`

### Authentication
- JWT-based authentication
- Access tokens and refresh tokens
- Email verification support
- Forgot password support

### Testing
- Jest for unit testing
- Supertest for E2E testing
- Run tests: `pnpm test`
- Test configuration in `jest.config.json`

### Environment Variables
- All environment variables defined in `.env.example`
- Development: `.env`
- Docker: `.env.docker`
- Never commit `.env` files

## File Locations Quick Reference

| Purpose | Location |
|---------|----------|
| App configuration | `src/config/app/` |
| Database configuration | `src/config/database/` |
| Auth configuration | `src/config/auth/` |
| Redis configuration | `src/config/redis/` |
| Mail configuration | `src/config/mail/` |
| Queue configuration | `src/config/bull-queue/` |
| Main config type | `src/config/config.type.ts` |
| Prisma service | `src/prisma/prisma.service.ts` |
| Auth guard | `src/guards/auth.guard.ts` |
| Roles guard | `src/guards/roles.guard.ts` |
| Global exception filter | `src/filters/global-exception.filter.ts` |
| Utility functions | `src/utils/` |
| Custom decorators | `src/decorators/` |
| Constants | `src/constants/` |
| API modules | `src/api/` |
| Background jobs | `src/background/queues/` |
| Mail service | `src/mail/` |
| SMS service | `src/sms/` |
| Module loading logic | `src/utils/modules-set.ts` |
| Application bootstrap | `src/main.ts` |
| Root module | `src/app.module.ts` |

## Dependencies

### Core
- `@nestjs/core`: NestJS framework
- `@nestjs/common`: Common NestJS utilities
- `@nestjs/config`: Configuration module
- `@prisma/client`: Prisma ORM client
- `@prisma/adapter-pg`: PostgreSQL adapter for Prisma

### Authentication & Security
- `@nestjs/jwt`: JWT authentication
- `@nestjs/passport`: Passport integration
- `passport-jwt`: JWT strategy for Passport
- `bcrypt`: Password hashing
- `helmet`: Security headers
- `class-validator`: Input validation
- `class-transformer`: Data transformation

### Database & Caching
- `@prisma/client`: Prisma ORM
- `redis`: Redis client
- `@nest-lab/throttler-storage-redis`: Redis-based rate limiting

### Background Jobs
- `@nestjs/bullmq`: BullMQ integration
- `bullmq`: Queue system

### Mail & SMS
- `@nestjs-modules/mailer`: Mailer integration
- `nodemailer`: Email sending
- `twilio`: SMS service

### Utilities
- `nestjs-pino`: Pino logger
- `compression`: Response compression
- `swagger-ui-express`: API documentation

## Development Workflow

### Running the Application
```bash
# Development
pnpm start:dev

# Production build
pnpm build
pnpm start:prod

# Docker
docker-compose up
```

### Running Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test with coverage
pnpm test:cov
```

### Database Operations
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Create new migration
pnpm prisma migrate dev --name migration_name

# Open Prisma Studio
pnpm prisma studio
```

### Code Quality
```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm type-check
```

## Troubleshooting

### Common Issues

**Module not found errors**
- Check import paths after moving files
- Verify tsconfig.json paths configuration
- Ensure barrel exports are correct

**Configuration errors**
- Verify environment variables are set
- Check config validator classes
- Ensure config type definitions match

**Database connection errors**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify SSL settings match database

**Redis connection errors**
- Verify REDIS_HOST and REDIS_PORT
- Check Redis is running
- Verify password if set

**Test failures**
- Check for missing mocks
- Verify ConfigService is mocked in tests
- Ensure PrismaService is properly mocked

## Performance Considerations

### Database
- Use connection pooling (configured in DATABASE_MAX_CONNECTIONS)
- Enable query logging only in development
- Use indexes for frequently queried fields
- Consider read replicas for high traffic

### Caching
- Use Redis for session storage
- Cache frequently accessed data
- Implement cache invalidation strategy
- Monitor cache hit rates

### Background Jobs
- Configure appropriate retry policies (5 attempts with exponential backoff)
- Set reasonable job retention periods (1hr completed, 24hr failed)
- Monitor queue depths via health endpoints
- Use dead letter queues for failed jobs
- Use circuit breakers for external service calls
- Implement job validation and encryption
- Use recommended concurrency limits (I/O-bound: 10-20, CPU-bound: 1-5)
- Use global rate limiting (50 jobs/sec for notification, 20 jobs/sec for email)

### API
- Enable compression (already configured)
- Use pagination for large datasets
- Implement rate limiting (already configured)
- Consider response caching for GET requests

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use environment variables** for all sensitive data
3. **Enable SSL/TLS** for database connections in production
4. **Use strong JWT secrets** - Generate with proper entropy
5. **Implement rate limiting** - Already configured for auth endpoints
6. **Validate all inputs** - Use class-validator decorators
7. **Use parameterized queries** - Prisma handles this automatically
8. **Implement proper CORS** - Configure via APP_CORS_ORIGIN
9. **Use security headers** - Helmet middleware configured
10. **Log security events** - Use appropriate log levels

## Future Enhancements

### Potential Improvements
1. **GraphQL API** - Consider adding GraphQL alongside REST
2. **WebSockets** - Real-time notifications
3. **File Upload** - S3 integration for file storage
4. **Analytics** - User behavior tracking
5. **A/B Testing** - Feature flag system
6. **Multi-tenancy** - Support for multiple organizations
7. **API Versioning** - Already URI-based, consider header-based
8. **Circuit Breaker** - Resilience for external services
9. **Distributed Tracing** - OpenTelemetry integration
10. **Metrics** - Prometheus/Grafana integration

---

This skill provides a comprehensive overview of the Effoy Core System architecture. Use it as a reference when implementing new features, refactoring existing code, or troubleshooting issues.
