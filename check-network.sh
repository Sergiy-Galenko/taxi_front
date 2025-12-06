#!/bin/bash

echo "🌐 Перевірка мережевих налаштувань..."
echo "====================================="

echo ""
echo "1. IP адреса комп'ютера:"
ifconfig | grep "inet " | grep -v 127.0.0.1

echo ""
echo "2. Перевірка доступності бекенду через localhost:"
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ localhost:3001 доступний"
else
    echo "❌ localhost:3001 недоступний"
fi

echo ""
echo "3. Перевірка доступності бекенду через IP:"
if curl -s http://192.168.10.192:3001 > /dev/null; then
    echo "✅ 192.168.10.192:3001 доступний"
else
    echo "❌ 192.168.10.192:3001 недоступний"
fi

echo ""
echo "4. Перевірка портів:"
lsof -i :3001

echo ""
echo "5. Перевірка брандмауера:"
echo "Переконайтеся, що порт 3001 не заблокований брандмауером"

echo ""
echo "6. Налаштування для різних платформ:"
echo "📱 iOS Simulator: використовуйте localhost або IP адресу"
echo "🤖 Android Emulator: використовуйте 10.0.2.2 (localhost хост-машини)"
echo "📱 Фізичний пристрій: використовуйте IP адресу комп'ютера"

echo ""
echo "7. Тест API через IP:"
curl -s http://192.168.10.192:3001

echo ""
echo "✅ Перевірка завершена!"
