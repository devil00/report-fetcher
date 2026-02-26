<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
Build a backend system that aggregates data from three slow external
providers and produces a consolidated report for an authenticated user.
A key requirement is Multi-Tenancy: data for diﬀerent tenants must be
stored in separate physical databases, and the system must switch the
target database at runtime based on the tenant context.

## Approach

``` bash
./src
├── auth
│   ├── decorators
│   ├── dto
│   ├── entities
│   ├── guards
│   └── strategies
├── common
│   ├── bullmq
│   ├── interfaces
│   ├── kafka
│   └── pubsub
├── config
├── modules
│   ├── providers
│   └── report
│       ├── dto
│       ├── entities
│       ├── providers
│       │   └── entities
│       └── tasks
├── tenant
│   ├── dto
│   └── entities
└── user
    ├── dto
    └── entities
```

 A NestJS-based microservices architecture for managing multi-tenant report generation with Kafka event-driven communication and BullMQ task scheduling.
 ``` bash
 ├── src/
│   ├── modules/
│   │   ├── user/          # User management (CRUD operations)
│   │   ├── auth/          # Authentication (Passport.js, JWT, GraphQL guards)
│   │   └── report/        # Report orchestration and processing
│   └── common/            # Infrastructure setup (Kafka, BullMQ, Redis PubSub)
```


**Step-by-Step Report Creation Process**

Follow these steps in order to successfully create a report:

First,  we need to create tenant creation request through graphql mutaiton,
Second, we need to send signup mutation request in graphql and this will create the user.
Third, sign in user and et access token.
Last, send create report rtequest through grapl mutation.


**Step 1: Create a Tenant** 
Send a GraphQL mutation to create a new tenant with its database configuration.
```
Request:
mutation CreateTenant {
    createTenant(createTenantInput: {
             tenantID: "tenant-a",
            tenantName: "tenant-a",
            dataSource: {
                host: "db",
                username: "postgres",
                password: "postgres",
                port: "5432",
                db: "tenantA"
            }
    }) {
        tenantID
        tenantName
        dataSource
    }
}

Response:
{
    "data": {
        "createTenant": {
            "tenantID": "tenant-a",
            "tenantName": "tenant-a",
            "dataSource": {
                "host": "db",
                "username": "postgres",
                "password": "postgres",
                "port": "5432",
                "db": "tenantA"
            }
        }
    }
}
```
**Step 2: Register a User** 
Create a user account under the newly created tenant.

```
Request:
mutation SignUp {
    signUp(signUp: {
         tenantID: "tenant-a",
        username: "user-a",
        password: "pass",
        taxID: "tax-123"
    }) {
        tenantID
        username
        password
        taxID
    }
}

Response:
{
    "data": {
        "signUp": {
            "tenantID": "tenant-a",
            "username": "user-a",
            "password": "$2b$10$lk0Ufbhrw4rqvXpu83uxOuOR/tOSvg8F.bj5JYqFFd8jpaq9ZbPVe",
            "taxID": "tax-123"
        }
    }
}

```

**Step 3: Authenticate and Obtain Access Token** 
Create a user account under the newly created tenant.
```
Request:

mutation Login {
    login(loginInput: {
        username: "user-a",
        password: "pass",
    }) {
        accessToken
        userName
        taxID
    }
}


Response:
{
    "data": {
        "login": {
            "accessToken": "",
            "userName": "user-a",
            "taxID": "tax-123"
        }
    }
}
```
**Step 4: Authenticate and Obtain Access Token** 
```

Request:

mutation CreateReport {
  createReport {
    status
    reportID
    progress
  }
}
Header:

{
  "Authorization": "Bearer <your-access-token>"
}

Response:
{
    "data": {
        "createReport": {
            "status": "in_progress",
            "reportID": 1,
            "fileURL": null,
            "progress": 0
        }
    }
}
```
**Step 5: Get Report status** 
```
Request:
query Status {
    status(id: 1) {
        status
        reportID
        fileURL
        progress
    }
}


Response:
{
    "data": {
        "status": {
            "status": "COMPLETED",
            "reportID": null,
            "fileURL": null,
            "progress": null
        }
    }
}
```

**Step 6: Get Report url** 
```
Request:
query GetReportUrl {
    getReportUrl(id: 1) {
        status
        reportID
        fileURL
        progress
    }
}


Response:

{
    "data": {
        "getReportUrl": {
            "status": "COMPLETED",
            "reportID": null,
            "fileURL": "https://storage/report-1.pdf",
            "progress": null
        }
    }
}
```

The system processes reports asynchronously, returning an immediate "pending" status while background jobs handle the actual generation.

### How tenant DB switching works at runtime?
The system uses a master database to store tenant configurations and dynamically switches to tenant-specific databases at runtime.
Instead of holding HTTP requests open, the system uses an event-driven approach:

How it works:

1. Tenant configurations are stored in a master database table

2. JWT token provides tenantId for each authenticated request

3. TenantDataSourceService manages a connection pool cache

4. Inject this service into repositories for tenant context switching

5. Example: ReportRepository demonstrates this pattern

### How long-running report generation is orchestrated without holding requests open?

1. Report Request Received

  - Report entity saved to tenant database

  - Immediate response: {"status": "pending"}

  - Kafka event emitted to report.create topic

2. Event Processing Pipeline

  - Kafka Event Listener consumes report.create events

  - Forwards to BullMQ for task scheduling

3. Parallel Processing with BullMQ
  - The ReportProcessor worker handles:

✅ Polling external providers every 10 seconds

✅ Database updates with progress tracking

✅ Parallel API calls to three mock providers

✅ Automatic retry queue for incomplete providers

✅ Kafka event emission when reports are ready

4. Completion Notification

  - Kafka listener consumes report.ready events

  - Triggers GraphQL subscription for real-time updates
5. Users can monitor report status via WebSocket connection:

```
subscription {
    reportReady
}
```

### How Provider Polling Works
The system uses BullMQ's built-in retry mechanism for efficient polling:
// QueueService adds job with polling configuration
await this.reportQueue.add('generate-report', data, {
    attempts: 30,                    // Max 30 attempts (5 minutes)
    backoff: { type: 'fixed', delay: 10000 }  // 10 seconds between retries
});
#### Polling Flow:

Processor checks all three providers in parallel

If any provider returns "processing", job throws STILL_PROCESSING error

BullMQ automatically retries after configured delay

When all providers complete, results are aggregated and report is finalized

## Assumptions
1. Report providers are mocked via API calls in report.processor.ts

2. Only endpoints documented above are tested

3. Development environment configuration can be adapted for production

4. Report download URLs are mocked (returns dummy URLs)

5. GraphQL subscriptions are tenant-aware via JWT token validation


## Improvements
1. Add separate ReportProvider entity for better provider management

2. Code cleanup and refactoring for better maintainability

3. Enhanced error handling and monitoring

4. Provider-specific retry strategies

5. Dashboard for job monitoring

6. Handle validations.

7. Generate report with json.csv content and expose a mutation to download report.

8. Skip sending null key-values in response.

## Project setup

**Prerequistie:**
 - Max or Linux OS
 - Install docker-compose(or any other alternative) and docker

```bash
$ docker system prune
$ docker compose up --build
```

If the above setup fails, then try to install npm in the system os.
Run below commands to verify nest setup.
```bash
$ npm install
$ npm start
```

Create tenant Databases: tenantA, tenantB etc to create report in each tenant DB.Currently, those databses can be created in the same postgresql database after all docker contains are up

## API Documentation
### GraphQL Endpoints
### Query/Mutation URL: http://localhost:3000/graphql

### Subscription WebSocket: 
 ws://localhost:3000/graphql
1. Send messages immediately after ws connection is established
```
{"type":"connection_init","payload":{"Authorization":"<Bearer Token>"}}
```
2. Send message to get report status
```
{"id":"1","type":"subscribe","payload":{"query":"subscription { reportReady }"}}
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch
- Author - [Mayur Swami](https://github.com/devil00)