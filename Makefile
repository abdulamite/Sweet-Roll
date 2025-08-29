# Load environment variables from .env file if it exists
ifneq (,$(wildcard .env))
    include .env
    export
endif

# Database connection settings (can be overridden by environment variables)
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_NAME ?= school_management
DB_USER ?= postgres
DB_PASSWORD ?= password

# PostgreSQL connection string
DB_URL = postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help db-status db-create db-drop db-reset db-clear-data db-clear-tables db-seed db-migrate db-migrate-status

# Default target
help:
	@echo "$(GREEN)Database Management Commands$(NC)"
	@echo "================================"
	@echo ""
	@echo "$(YELLOW)Setup:$(NC)"
	@echo "  make db-create        Create database"
	@echo "  make db-drop          Drop database (careful!)"
	@echo "  make db-migrate       Run all pending migrations"
	@echo ""
	@echo "$(YELLOW)Data Management:$(NC)"
	@echo "  make db-clear-data    Clear all data (keep tables)"
	@echo "  make db-clear-tables  Drop all tables"
	@echo "  make db-seed          Populate with seed data"
	@echo "  make db-reset         Full reset: clear tables + migrate + seed"
	@echo ""
	@echo "$(YELLOW)Info:$(NC)"
	@echo "  make db-status        Show database and migration status"
	@echo "  make db-migrate-status Show migration status only"
	@echo ""
	@echo "$(YELLOW)Environment:$(NC)"
	@echo "  DB_HOST: $(DB_HOST)"
	@echo "  DB_PORT: $(DB_PORT)"
	@echo "  DB_NAME: $(DB_NAME)"
	@echo "  DB_USER: $(DB_USER)"

# Check database connection
db-status:
	@echo "$(GREEN)Checking database status...$(NC)"
	@echo "Database: $(DB_NAME)"
	@echo "Host: $(DB_HOST):$(DB_PORT)"
	@echo "User: $(DB_USER)"
	@echo ""
	@psql "$(DB_URL)" -c "SELECT version();" 2>/dev/null || echo "$(RED)❌ Cannot connect to database$(NC)"
	@psql "$(DB_URL)" -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo ""
	@echo ""
	@make db-migrate-status

# Create database
db-create:
	@echo "$(GREEN)Creating database: $(DB_NAME)$(NC)"
	@createdb "$(DB_NAME)" -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) 2>/dev/null || echo "$(YELLOW)Database may already exist$(NC)"

# Drop database (dangerous!)
db-drop:
	@echo "$(RED)⚠️  WARNING: This will permanently delete the database!$(NC)"
	@read -p "Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || (echo "Cancelled." && exit 1)
	@echo "$(RED)Dropping database: $(DB_NAME)$(NC)"
	@dropdb "$(DB_NAME)" -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) 2>/dev/null || echo "$(YELLOW)Database may not exist$(NC)"

# Clear all data but keep table structure
db-clear-data:
	@echo "$(YELLOW)Clearing all data from database...$(NC)"
	@psql "$(DB_URL)" -c "\
		DO \$$\$$ \
		DECLARE \
			table_name text; \
		BEGIN \
			-- Disable triggers temporarily \
			SET session_replication_role = replica; \
			-- Clear all tables \
			FOR table_name IN \
				SELECT tablename FROM pg_tables WHERE schemaname = 'public' \
			LOOP \
				EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name) || ' RESTART IDENTITY CASCADE'; \
			END LOOP; \
			-- Re-enable triggers \
			SET session_replication_role = DEFAULT; \
		END \$$\$$;"
	@echo "$(GREEN)✓ All data cleared$(NC)"

# Drop all tables
db-clear-tables:
	@echo "$(YELLOW)Dropping all tables...$(NC)"
	@psql "$(DB_URL)" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	@echo "$(GREEN)✓ All tables dropped$(NC)"

# Run migrations
db-migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	@node src/db/migrate.js up

# Show migration status
db-migrate-status:
	@echo "$(GREEN)Migration Status:$(NC)"
	@node src/db/migrate.js status

# Populate with seed data (run specific seed migration)
db-seed:
	@echo "$(GREEN)Populating database with seed data...$(NC)"
	@psql "$(DB_URL)" -f src/db/migrations/002_seed_data.sql
	@echo "$(GREEN)✓ Seed data loaded$(NC)"

# Full database reset: clear tables + migrate + seed
db-reset:
	@echo "$(GREEN)Performing full database reset...$(NC)"
	@make db-clear-tables
	@make db-migrate
	@echo "$(GREEN)✓ Database reset complete!$(NC)"

# Quick reset: clear data + reseed (keeps schema)
db-quick-reset:
	@echo "$(GREEN)Performing quick reset (keeping schema)...$(NC)"
	@make db-clear-data
	@make db-seed
	@echo "$(GREEN)✓ Quick reset complete!$(NC)"

# Development helpers
dev-setup: db-create db-migrate
	@echo "$(GREEN)✓ Development database setup complete!$(NC)"

dev-reset: db-clear-data db-seed
	@echo "$(GREEN)✓ Development database reset complete!$(NC)"

# Backup database
db-backup:
	@echo "$(GREEN)Creating database backup...$(NC)"
	@mkdir -p backups
	@pg_dump "$(DB_URL)" > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/ directory$(NC)"

# Restore from latest backup
db-restore:
	@echo "$(YELLOW)Restoring from latest backup...$(NC)"
	@latest_backup=$$(ls -t backups/*.sql | head -n1); \
	if [ -z "$$latest_backup" ]; then \
		echo "$(RED)No backup files found$(NC)"; \
		exit 1; \
	fi; \
	echo "Restoring from: $$latest_backup"; \
	make db-drop; \
	make db-create; \
	psql "$(DB_URL)" < "$$latest_backup"
	@echo "$(GREEN)✓ Database restored$(NC)"
