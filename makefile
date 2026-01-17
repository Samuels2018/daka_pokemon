# Variables
DC_DEV=docker compose -f docker-compose.dev.yml
DC_TEST=docker compose -f docker-compose.test.yml

# Desarrollo
dev-up:
	$(DC_DEV) up --build

dev-down:
	$(DC_DEV) down

dev-logs:
	$(DC_DEV) logs -f

dev-restart:
	$(DC_DEV) restart

dev-ps:
	$(DC_DEV) ps

# Testing / Pre-producción
test-up:
	$(DC_TEST) up --build

test-down:
	$(DC_TEST) down

test-logs:
	$(DC_TEST) logs -f

test-restart:
	$(DC_TEST) restart

test-ps:
	$(DC_TEST) ps

# Limpieza de volúmenes
clean-dev:
	$(DC_DEV) down -v

clean-test:
	$(DC_TEST) down -v