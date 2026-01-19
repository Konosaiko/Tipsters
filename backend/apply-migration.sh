#!/bin/bash

echo "🔍 Checking if PostgreSQL is running..."
if ! docker ps | grep -q postgres; then
    echo "❌ PostgreSQL is not running. Starting it now..."
    cd /home/user/Tipsters
    docker compose up -d
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 3
else
    echo "✅ PostgreSQL is running"
fi

echo ""
echo "📦 Applying database migration..."
cd /home/user/Tipsters/backend

# Try to apply migration
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🔄 Regenerating Prisma client..."
    npx prisma generate
    echo ""
    echo "✅ Done! Restart your backend server now."
    echo ""
    echo "To restart backend:"
    echo "  1. Stop the server (Ctrl+C)"
    echo "  2. Run: npm run dev"
else
    echo ""
    echo "❌ Migration failed. Let me try an alternative method..."
    echo ""
    echo "Running direct SQL migration..."

    # Extract connection details from .env
    DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

    # Run migration SQL directly
    docker exec -i $(docker ps -qf "ancestor=postgres:16-alpine") psql "$DATABASE_URL" < prisma/migrations/20260116190254_add_tip_results/migration.sql

    if [ $? -eq 0 ]; then
        echo "✅ Direct migration successful!"
        npx prisma generate
        echo "✅ Prisma client regenerated!"
    else
        echo "❌ Migration failed. Please check the error above."
    fi
fi
