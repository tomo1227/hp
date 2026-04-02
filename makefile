.PHONY: install
install:
	pnpm i

.PHONY: run
run:
	pnpm dev

.PHONY: build
build:
	pnpm build

.PHONY: lint
lint:
	pnpm lint

.PHONY: fix
fix:
	pnpm fix

.PHONY: fmt
fmt:
	pnpm format

.PHONY: bi
bi:
	pnpm bi

.PHONY: post
post:
	pnpm post

.PHONY: gal
gal:
	pnpm gal

.PHONY: up
up:
	docker compose up -d

.PHONY: down
down:
	docker compose down

.PHONY: prune
prune:
	docker system prune -a

.PHONY: delete
delete:
	docker compose down --rmi all --volumes --remove-orphans

.PHONY: log
log:
	docker compose logs -f
