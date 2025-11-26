.PHONY: pnpm
install:
	pnpm i

.PHONY: run
run:
	pnpm run dev

.PHONY: build
build:
	pnpm run build

.PHONY: lint
lint:
	pnpm run lint

.PHONY: format
format:
	pnpm run format

.PHONY: check
check:
	pnpm run check

.PHONY: bi
bi:
	pnpm run bi

.PHONY: post
post:
	pnpm run post

.PHONY: gal
gal:
	pnpm run gal

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
