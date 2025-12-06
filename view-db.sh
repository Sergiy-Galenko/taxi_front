#!/bin/bash

echo "🗄️  Перегляд вмісту бази даних taxi_app..."

# Перевірка підключення до бази даних
echo "1. Перевірка підключення..."
psql -U postgres -d taxi_app -c "SELECT version();" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Помилка підключення до бази даних"
    exit 1
fi

echo ""
echo "2. Список таблиць:"
psql -U postgres -d taxi_app -c "\dt"

echo ""
echo "3. Кількість записів у таблицях:"
psql -U postgres -d taxi_app -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo ""
echo "4. Користувачі в системі:"
psql -U postgres -d taxi_app -c "
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users 
ORDER BY created_at DESC;
"

echo ""
echo "5. Пасажири:"
psql -U postgres -d taxi_app -c "
SELECT 
    p.id,
    u.full_name,
    u.email,
    p.home_address,
    p.work_address,
    p.preferred_payment_method,
    p.rating,
    p.total_rides
FROM passengers p
JOIN users u ON p.user_id = u.id
ORDER BY p.id;
"

echo ""
echo "6. Водії:"
psql -U postgres -d taxi_app -c "
SELECT 
    d.id,
    u.full_name,
    u.email,
    d.license_number,
    d.car_model,
    d.car_number,
    d.car_color,
    d.is_available,
    d.rating
FROM drivers d
JOIN users u ON d.user_id = u.id
ORDER BY d.id;
"

echo ""
echo "✅ Перегляд бази даних завершено!"
