#!/bin/bash

echo "📊 Швидкий перегляд бази даних taxi_app"
echo "========================================"

echo ""
echo "👥 Користувачі:"
psql -U postgres -d taxi_app -c "
SELECT 
    id,
    email,
    full_name,
    role,
    TO_CHAR(created_at, 'DD.MM.YYYY HH24:MI') as created
FROM users 
ORDER BY created_at DESC;
"

echo ""
echo "🚗 Пасажири:"
psql -U postgres -d taxi_app -c "
SELECT COUNT(*) as count FROM passengers;
"

echo ""
echo "🚕 Водії:"
psql -U postgres -d taxi_app -c "
SELECT COUNT(*) as count FROM drivers;
"

echo ""
echo "📈 Поїздки:"
psql -U postgres -d taxi_app -c "
SELECT COUNT(*) as count FROM rides;
"

echo ""
echo "💳 Платежі:"
psql -U postgres -d taxi_app -c "
SELECT COUNT(*) as count FROM payments;
"
