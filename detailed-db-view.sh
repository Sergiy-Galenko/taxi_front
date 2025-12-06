#!/bin/bash

echo "🔍 Детальний перегляд бази даних taxi_app"
echo "=========================================="

echo ""
echo "👥 Всі користувачі з деталями:"
psql -U postgres -d taxi_app -c "
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone_number,
    u.role,
    TO_CHAR(u.created_at, 'DD.MM.YYYY HH24:MI') as created
FROM users u
ORDER BY u.created_at DESC;
"

echo ""
echo "🚗 Деталі пасажирів:"
psql -U postgres -d taxi_app -c "
SELECT 
    p.id,
    u.full_name,
    u.email,
    u.phone_number,
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
echo "🚕 Деталі водіїв:"
psql -U postgres -d taxi_app -c "
SELECT 
    d.id,
    u.full_name,
    u.email,
    u.phone_number,
    d.license_number,
    d.car_model,
    d.car_number,
    d.car_color,
    d.car_year,
    d.is_available,
    d.rating,
    d.total_rides
FROM drivers d
JOIN users u ON d.user_id = u.id
ORDER BY d.id;
"

echo ""
echo "📋 Структура таблиць:"
psql -U postgres -d taxi_app -c "
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'passengers', 'drivers')
ORDER BY table_name, ordinal_position;
"
