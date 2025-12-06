#!/bin/bash

echo "🧪 Тестування API..."

# Перевірка чи бекенд запущений
echo "1. Перевірка доступності бекенду..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Бекенд доступний"
else
    echo "❌ Бекенд недоступний"
    exit 1
fi

# Тест реєстрації
echo "2. Тест реєстрації користувача..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phoneNumber": "+380123456789",
    "role": "passenger"
  }')

echo "Відповідь: $RESPONSE"

# Тест логіну
echo "3. Тест логіну користувача..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Відповідь логіну: $LOGIN_RESPONSE"

echo "✅ Тестування завершено!"
