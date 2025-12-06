#!/bin/bash

echo "🚀 Запуск Taxi App проекту..."

# Перевірка чи встановлений Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлений. Будь ласка, встановіть Node.js версії 16 або вище."
    exit 1
fi

# Перевірка чи встановлений PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL не знайдено. Будь ласка, встановіть PostgreSQL."
    echo "   Продовжити без бази даних? (y/n)"
    read -r response
    if [[ "$response" != "y" ]]; then
        exit 1
    fi
fi

echo "✅ Node.js знайдено: $(node --version)"

# Встановлення залежностей бекенду
echo "📦 Встановлення залежностей бекенду..."
cd taxi_backend
npm install

# Перевірка наявності .env файлу
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не знайдено. Створюю .env.example..."
    cat > .env << EOF
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=taxi_app
DB_PASSWORD=your_password
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
    echo "📝 Створено файл .env. Будь ласка, відредагуйте його з вашими налаштуваннями бази даних."
    echo "   Натисніть Enter після редагування..."
    read -r
fi

# Ініціалізація бази даних
echo "🗄️  Ініціалізація бази даних..."
npm run init-db

# Запуск бекенду в фоновому режимі
echo "🚀 Запуск бекенду..."
npm run dev &
BACKEND_PID=$!

# Повернення до кореневої папки
cd ..

# Встановлення залежностей фронтенду
echo "📦 Встановлення залежностей фронтенду..."
npm install

# Очікування запуску бекенду
echo "⏳ Очікування запуску бекенду..."
sleep 5

# Перевірка чи бекенд запущений
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Бекенд успішно запущений на http://localhost:3001"
else
    echo "⚠️  Бекенд не відповідає. Перевірте логи вище."
fi

# Запуск фронтенду
echo "📱 Запуск мобільного додатку..."
echo "   Відкрийте новий термінал і виконайте: npx expo start"
echo "   Або натисніть Enter для запуску зараз..."
read -r

npx expo start

# Очищення при завершенні
echo "🛑 Зупинка серверів..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Проект зупинено."
