PNPM := pnpm

.PHONY: install lint format format-check build test dev-web dev-lambdas seed

install:
	$(PNPM) install

lint:
	$(PNPM) lint

format:
	$(PNPM) format

format-check:
	$(PNPM) format:check

build:
	$(PNPM) build

test:
	$(PNPM) test

dev-web:
	$(PNPM) dev:web

dev-lambdas:
	$(PNPM) dev:lambdas:offline

seed:
	$(PNPM) seed
