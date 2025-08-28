# Database Migrations

This directory contains PostgreSQL migration files for the school management system.

## Structure

```
migrations/
├── 001_initial_schema.sql     # Core tables (users, schools, sessions)
├── 002_seed_data.sql          # Sample data for development
├── 003_add_students_table.sql # Student and class management
└── ...                        # Future migrations
```

## Usage

### Run Migrations

```bash
# Run all pending migrations
node src/db/migrate.js up

# Check migration status
node src/db/migrate.js status

# Create new migration
node src/db/migrate.js create "add grades table"
```

### Environment Variables

Set these in your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=your_user
DB_PASSWORD=your_password
```

## Migration Files

### 001_initial_schema.sql

- Creates core tables: `users`, `schools`, `user_schools`, `sessions`
- Sets up user-school relationships with roles
- Adds performance indexes
- Creates `updated_at` triggers

### 002_seed_data.sql

- Sample schools and users for development
- Role-based permissions examples
- Safe to run multiple times (uses `ON CONFLICT DO NOTHING`)

### 003_add_students_table.sql

- Student management tables
- Class assignment system
- Grade level tracking
- Parent contact information storage

## Roles and Permissions

The system supports role-based access control:

- **admin**: Full school management access
- **principal**: School oversight and teacher management
- **teacher**: Student and grade management
- **student**: Limited read access (future)

## Schema Features

- **Multi-tenant**: Users can belong to multiple schools
- **Role-based**: Granular permissions per school
- **Audit trail**: Created/updated timestamps on all tables
- **Performance**: Optimized indexes for common queries
- **Data integrity**: Foreign key constraints and unique constraints

## Adding New Migrations

1. Create migration: `node src/db/migrate.js create "description"`
2. Edit the generated SQL file
3. Run migration: `node src/db/migrate.js up`
4. Commit the migration file to version control

## Best Practices

- Always test migrations on development data first
- Use transactions (migrations are wrapped automatically)
- Add rollback instructions in comments if needed
- Keep migrations small and focused
- Use descriptive names for new migrations
