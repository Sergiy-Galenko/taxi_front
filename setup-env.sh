#!/bin/bash

echo "🔧 Налаштування змінних середовища..."

# Перевірка чи існує .env файл
if [ -f "taxi_backend/.env" ]; then
    echo "📝 Оновлення існуючого .env файлу..."
    
    # Створюємо резервну копію
    cp taxi_backend/.env taxi_backend/.env.backup
    
    # Оновлюємо назву бази даних
    sed -i '' 's/DB_NAME=taxi_db/DB_NAME=taxi_app/' taxi_backend/.env
    
    echo "✅ .env файл оновлено!"
    echo "📋 Поточні налаштування:"
    cat taxi_backend/.env
else
    echo "📝 Створення нового .env файлу..."
    
    cat > taxi_backend/.env << EOF
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=taxi_app
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Admin Registration Code
ADMIN_REGISTRATION_CODE=admin123

# Server Configuration
PORT=3001
NODE_ENV=development
EOF
    
    echo "✅ .env файл створено!"
fi

echo ""
echo "🚀 Тепер можна запускати проект:"
echo "   cd taxi_backend && npm run dev"
