#!/bin/bash

echo "📱 Тестування API для мобільного додатку..."
echo "IP адреса: 192.168.10.192:3001"

# Тест базового endpoint
echo ""
echo "1. Тест базового endpoint..."
curl -s http://192.168.10.192:3001

echo ""
echo ""
echo "2. Тест реєстрації користувача..."
RESPONSE=$(curl -s -X POST http://192.168.10.192:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mobile@example.com",
    "password": "password123",
    "fullName": "Mobile User",
    "phoneNumber": "+380999999999",
    "role": "passenger"
  }')

echo "Відповідь: $RESPONSE"

echo ""
echo "3. Тест логіну користувача..."
LOGIN_RESPONSE=$(curl -s -X POST http://192.168.10.192:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mobile@example.com",
    "password": "password123"
  }')

echo "Відповідь логіну: $LOGIN_RESPONSE"

echo ""
echo "✅ Тестування завершено!"
