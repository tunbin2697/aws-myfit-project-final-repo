# Flyway migrations

Place versioned SQL files here, for example:
- `V1__init_schema.sql`
- `V2__seed_core.sql`

Production startup now uses:
- `spring.jpa.hibernate.ddl-auto=validate`
- `spring.flyway.enabled=true`

Do not rely on runtime Java seeders for production data initialization.
