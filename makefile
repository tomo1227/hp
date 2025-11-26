.PHONY: npm
install:
	npm i

.PHONY: ci
ci:
	npm ci

.PHONY: run
run:
	npm run dev

.PHONY: lint
lint:
	npm run lint

.PHONY: format
format:
	npm run format

.PHONY: check
check:
	npm run check

.PHONY: bi
bi:
	npm run bi

.PHONY: post
post:
	npm run post

.PHONY: gal
gal:
	npm run gal

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
