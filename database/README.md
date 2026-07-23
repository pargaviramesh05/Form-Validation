# Database

MySQL 8+ schema for the FormApp project.

## Files

| File | Purpose |
|---|---|
| `schema.sql` | Creates the `formapp_db` database and all tables (`admins`, `submissions`, `admin_activity_log`) with primary keys, foreign keys, and indexes. |
| `seed.sql` | Optional sample submission rows for local development/demo purposes. |

## Setup

```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql   # optional, sample data only
```

## Notes

- The **admin account is not created by SQL**. On first startup the backend
  automatically creates one admin row using `ADMIN_USERNAME` /
  `ADMIN_PASSWORD` from `backend/.env`, hashing the password with bcrypt
  before it is stored. This keeps plain-text credentials out of the
  database layer and out of source control.
- `submissions.status` tracks admin triage (`new` / `reviewed` / `resolved`).
- All tables use `InnoDB` for foreign key and transaction support, and
  `utf8mb4` so names/messages in any language/emoji are stored correctly.
- Indexes are added on the columns the dashboard actually filters/sorts by
  (`created_at`, `email`, `status`) to keep search and pagination fast as
  the table grows.
