#!/bin/bash

echo "🧪 Додавання тестових даних..."

# Додавання тестових користувачів
echo "1. Додавання тестових користувачів..."

psql -U postgres -d taxi_app -c "
INSERT INTO users (email, password, full_name, phone_number, role) VALUES
('john@example.com', '\$2a\$10\$test_hash_1', 'John Doe', '+380111111111', 'passenger'),
('jane@example.com', '\$2a\$10\$test_hash_2', 'Jane Smith', '+380222222222', 'passenger'),
('driver1@example.com', '\$2a\$10\$test_hash_3', 'Mike Johnson', '+380333333333', 'driver'),
('driver2@example.com', '\$2a\$10\$test_hash_4', 'Sarah Wilson', '+380444444444', 'driver')
ON CONFLICT (email) DO NOTHING;
"

# Додавання тестових пасажирів
echo "2. Додавання тестових пасажирів..."

psql -U postgres -d taxi_app -c "
INSERT INTO passengers (user_id, home_address, work_address, preferred_payment_method) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 'вул. Шевченка, 1', 'вул. Хрещатик, 10', 'card'),
((SELECT id FROM users WHERE email = 'jane@example.com'), 'вул. Франка, 5', 'вул. Велика Васильківська, 15', 'cash')
ON CONFLICT DO NOTHING;
"

# Додавання тестових водіїв
echo "3. Додавання тестових водіїв..."

psql -U postgres -d taxi_app -c "
INSERT INTO drivers (user_id, license_number, car_model, car_number, car_color, car_year) VALUES
((SELECT id FROM users WHERE email = 'driver1@example.com'), 'AA123456', 'Toyota Camry', 'AA1234BB', 'Сірий', 2020),
((SELECT id FROM users WHERE email = 'driver2@example.com'), 'BB789012', 'Honda Civic', 'BB5678CC', 'Білий', 2021)
ON CONFLICT DO NOTHING;
"

echo "✅ Тестові дані додано!"

# Показати результат
echo ""
echo "📊 Оновлена статистика:"
./quick-db-view.sh
