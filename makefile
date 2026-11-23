.PHONY: install run build lint fix fmt bi post gal test up down prune delete log apm_ci apm_audit

install:
	pnpm i

run:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint

fix:
	pnpm fix

fmt:
	pnpm format

bi:
	pnpm bi

post:
	pnpm post

gal:
	pnpm gal

test:
	pnpm -s test:dict

up:
	docker compose up -d

down:
	docker compose down

prune:
	docker system prune -a

delete:
	docker compose down --rmi all --volumes --remove-orphans

log:
	docker compose logs -f

apm_ci:
	apm install --policy ./apm-policy.yml --frozen

apm_audit:
	apm audit --ci --policy ./apm-policy.yml
