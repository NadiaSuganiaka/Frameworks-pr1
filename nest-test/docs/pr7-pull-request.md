# Add project pagination, filtering, sorting and transactional ownership

Project listing now accepts validated `page`, `size`, `status`, `assigneeId`, `sort` and `order` parameters and returns `{ data, meta }`. Filtering, pagination, sorting and counting run in PostgreSQL; the list and count share a RepeatableRead snapshot. Every sort includes an ID tie breaker. Both `/projects` and `/api/projects` are supported.

Project creation requires an existing `ownerId` and atomically inserts the project and its owner membership. A failed membership insert rolls back the project. The membership endpoint maps real database uniqueness conflicts to HTTP 409 with `MEMBERSHIP_ALREADY_EXISTS`, retaining the existing error envelope. Unexpected errors no longer expose internal database messages.

The schema adds `updatedAt` and indexes for sorting. Existing numeric user IDs and lowercase project statuses are retained. Assignee filtering follows task assignments. The composite membership primary key already enforces uniqueness of `(projectId, userId)`.

Validation completed:

- Build and lint passed.
- Migration applied to the development database.

The README includes setup commands, API examples and answers to the PR7 review questions.
