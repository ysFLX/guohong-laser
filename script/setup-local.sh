#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DB_USER="${DB_USER:-laseruser}"
DB_PASS="${DB_PASS:-laserpass}"
DB_NAME="${DB_NAME:-lasermarket}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

echo "1/6 PostgreSQL servisi başlatılıyor..."
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl start postgresql
  sudo systemctl enable postgresql >/dev/null 2>&1 || true
else
  sudo service postgresql start
fi

echo "2/6 PostgreSQL hazır mı kontrol ediliyor..."
for _ in {1..20}; do
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
  echo "Hata: PostgreSQL ${DB_HOST}:${DB_PORT} üzerinde cevap vermiyor."
  exit 1
fi

echo "3/6 Veritabanı rolü ve DB hazırlanıyor..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
    CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
  END IF;
END
\$\$;
SQL

echo "4/6 Ortam dosyası hazırlanıyor..."
if [[ ! -f .env.local ]]; then
  echo "Hata: .env.local bulunamadı."
  exit 1
fi
cp .env.local .env

echo "5/6 Prisma migration + seed çalıştırılıyor..."
set -a
source .env.local
set +a
npx prisma migrate deploy
npm run seed

echo "6/6 Kayıt kontrolü..."
COUNT="$(PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -tAc 'SELECT count(*) FROM "SparePart";')"
echo "SparePart kayıt sayısı: ${COUNT}"

if [[ "${COUNT}" == "0" ]]; then
  echo "Uyarı: Kayıt sayısı 0. Seed başarısız olmuş olabilir."
  exit 1
fi

echo "Tamamdır. Şimdi projeyi şu komutla açabilirsin:"
echo "npm run dev"
