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

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# Generate Prisma Client before the first start
$ npm run prisma:generate

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Projects vertical slice

Swagger UI: `http://localhost:3000/docs`  
OpenAPI JSON: `http://localhost:3000/docs-json` and generated `openapi.json`.

The API uses a bearer authorization scheme named `bearer`. Project requests and responses include examples in the OpenAPI document. Source repository: [GitHub](https://github.com/NadiaSuganiaka/Frameworks-pr1).

The `ProjectsModule` contains the HTTP controller, application service, and Prisma repository. The controller translates HTTP input into service calls. The service receives `PrismaProjectRepository` directly through Nest dependency injection.

```text
ProjectsController -> ProjectsService -> PrismaProjectRepository -> PostgreSQL
```

The repository provides project queries, CRUD operations, and membership creation.

## PostgreSQL and Prisma 7

Copy `.env.example` to `.env` on first setup (keep existing environment values if already configured), then run:

```bash
docker compose up -d --wait
npm install
npm run db:deploy
npm run prisma:generate
npm run db:seed
npm run start:dev
```

The local database uses port `5433`, database/user/password `nest_test`/`nest`/`nest`. These are development credentials. Configure `DATABASE_URL` for other environments. PostgreSQL data is stored in the named `postgres_data` volume and survives server/container restarts. `docker compose down` preserves it; `docker compose down -v` deletes it.

The initial SQL migration is committed in `prisma/migrations`. For subsequent schema changes, run `npm run db:migrate -- --name <change>`, then regenerate the client. Deployment uses `npm run db:deploy`; it does not reset existing data. Prisma 7 configures the datasource and seed command in `prisma.config.ts`; seed runs explicitly with `npm run db:seed` ([Prisma seeding documentation](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding)). The transactional seed creates two users, StudyFlow, two memberships and one task; running it again preserves existing records.

| Model | Keys and constraints | Additional indexes |
| --- | --- | --- |
| Project | Integer primary key; unique name; enum status | `(status, createdAt)` |
| User | Integer primary key; unique email | Unique email index |
| Task | Integer primary key; project and optional assignee foreign keys; enum status | `(projectId, status)`, `assigneeId` |
| Membership | Composite primary key `(projectId, userId)`; both foreign keys; enum role | `userId` |

Project deletion cascades to tasks and memberships. User deletion removes memberships and sets task assignees to null. The membership primary key prevents duplicate membership in the same project. Foreign keys are covered by indexes, including the leading columns of composite indexes. Task assignees reference users; membership in the task's project is not enforced by this schema.

Project detail responses retain numeric IDs, status values and ISO timestamps. An absent description is omitted from JSON. Database uniqueness conflicts become HTTP 409, including concurrent writes; missing update/delete targets retain HTTP 404. Prisma connects at module initialization and disconnects on application shutdown. PR7 extends the list response and requires an owner on creation, as documented below.


## Практична робота 7

Маршрути доступні через `/api/projects` та `/projects`. Swagger: `/docs`. Список тепер повертає `{ data, meta }`. Під час створення потрібен `ownerId` наявного користувача. Авторизація поки не реалізована: bearer у Swagger лише описує схему, тому власник передається в DTO. Після додавання авторизації його потрібно брати з поточного користувача.

```http
GET /api/projects?page=1&size=5&status=active&sort=name&order=asc
GET /api/projects?assigneeId=2&sort=createdAt&order=desc

POST /api/projects
Content-Type: application/json

{"name":"PR7 Project","status":"active","ownerId":1}

POST /api/projects/1/memberships
Content-Type: application/json

{"userId":2}
```

ID у прикладах замініть на наявні ID зі своєї БД. Seed створює користувачів `alice@example.com` та `bob@example.com`.

| Параметр | Правила |
| --- | --- |
| `page` | Ціле число від 1; стандартно 1; максимум 21474836 для безпечного PostgreSQL offset |
| `size` | Ціле число 1–100; стандартно 10 |
| `status` | `draft`, `active`, `completed`; відсутність означає без фільтра |
| `assigneeId` | Додатний integer ID користувача до 2147483647; проєкт має хоча б одну задачу цього виконавця |
| `sort` | `createdAt`, `updatedAt`, `name`; стандартно `createdAt` |
| `order` | `asc`, `desc`; стандартно `desc` |

У схемі попередньої практичної ID користувачів числові, тому UUID не використовується. Некоректний ID або невідомий статус повертає 400. Обидва фільтри поєднуються через AND; кілька задач одного виконавця не дублюють проєкт у результаті. Для будь-якого сортування другий ключ — `id` із тим самим напрямком. `updatedAt` зберігається в БД і автоматично оновлюється Prisma при зміні проєкту; поле доступне для сортування без зміни форми detail-відповіді.

Пагінація виконується через `skip = (page - 1) * size` і `take = size`. `total` використовує ті самі фільтри. Список та count виконуються у транзакції `RepeatableRead`, щоб відображати один знімок даних. `meta` містить `page`, `size`, `total`, `totalPages = Math.ceil(total / size)`, `hasNextPage = page < totalPages`, `hasPreviousPage = page > 1`. За відсутності збігів `totalPages` дорівнює 0; сторінка за межами списку повертає 200 з `data: []`.

Створення `Project` і `Membership` з роллю `owner` виконується через `tx` у спільній callback-транзакції. Помилка foreign key власника відкатує проєкт і повертає 400. Складений primary key `Membership(projectId, userId)` уже забезпечує вимогу унікальності пари, тому дублювати його додатковим unique-індексом не потрібно. Реальний Prisma P2002 під час додавання учасника повертає 409 з `errorCode: MEMBERSHIP_ALREADY_EXISTS`. Збережено попередній формат помилки: `statusCode`, `errorCode`, `message`, `path`, `timestamp`, `traceId`. Внутрішні деталі неочікуваних помилок БД клієнту не повертаються.

### Контрольні запитання

1. **Навіщо `id` як другий ключ?** Він задає однозначний порядок для записів з однаковою датою або назвою й робить повторні запити стабільними за незмінних даних.
2. **Page та cursor:** сторінка використовує offset і дозволяє перехід за номером; cursor продовжує після конкретного запису, краще працює на великих зміщеннях і менше залежить від нових вставок перед поточною позицією. Offset-пагінація може зміщувати результати між запитами при зміні даних.
3. **Чому однакові фільтри для `total`?** Інакше метадані рахуватимуть іншу множину, а кількість сторінок і навігація будуть неправильними.
4. **Що буде без спільної транзакції?** Після успішного створення проєкту помилка membership може залишити проєкт без власника. Транзакція відкатує обидві операції.
5. **Чому перевірки в сервісі недостатньо?** Два паралельні запити можуть одночасно не знайти дубля. Унікальний ключ БД атомарно дозволить лише один запис; помилка другого перетворюється на 409.

## Legacy Nest documentation

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

