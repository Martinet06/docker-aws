# AWS Docker Compose Smoke Test (API + Postgres + Nginx)

## Local
cp .env.example .env
docker compose up -d --build

Probar:
curl http://localhost/health
curl -X POST http://localhost/products -H "Content-Type: application/json" -d '{"name":"Teclado","price_cents":1999}'
curl http://localhost/products

## AWS
En EC2 (Ubuntu):
- instalar docker + docker compose
- clonar repo
- cp .env.example .env
- docker compose up -d --build

Probar:
curl http://EC2_PUBLIC_IP/health

