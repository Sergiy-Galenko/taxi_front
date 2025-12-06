# Taxi App - React Native + Node.js

Повнофункціональний додаток для замовлення таксі з реєстрацією, логіном та управлінням поїздками.

## 🚀 Швидкий старт

### Передумови

- Node.js (версія 16 або вище)
- PostgreSQL
- React Native CLI або Expo CLI
- iOS Simulator (для macOS) або Android Emulator

### 1. Клонування проекту

```bash
git clone <repository-url>
cd taxi_front
```

### 2. Налаштування бекенду

```bash
# Перейдіть до папки бекенду
cd taxi_backend

# Встановіть залежності
npm install

# Створіть файл .env
cp .env.example .env
# Відредагуйте .env файл з вашими налаштуваннями бази даних

# Ініціалізуйте базу даних
npm run init-db

# Запустіть сервер розробки
npm run dev
```

### 3. Налаштування фронтенду

```bash
# Поверніться до кореневої папки
cd ..

# Встановіть залежності
npm install

# Запустіть додаток
npx expo start
```

## 📱 Функціональність

### Аутентифікація
- ✅ Реєстрація пасажирів
- ✅ Логін користувачів
- ✅ Автоматичне збереження сесії
- ✅ Безпечне зберігання токенів

### Користувацький інтерфейс
- ✅ Сучасний дизайн з анімаціями
- ✅ Темна тема
- ✅ Адаптивний інтерфейс
- ✅ Валідація форм

### Безпека
- ✅ JWT токени
- ✅ Хешування паролів
- ✅ Валідація даних
- ✅ Захист маршрутів

## 🗄️ Структура бази даних

Проект використовує PostgreSQL з наступними основними таблицями:

- `users` - основна інформація про користувачів
- `passengers` - додаткова інформація про пасажирів
- `drivers` - інформація про водіїв
- `rides` - інформація про поїздки
- `payments` - інформація про платежі

## 🔧 Налаштування

### Змінні середовища (.env)

```env
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
```

### API Endpoints

#### Аутентифікація
- `POST /api/auth/register` - Реєстрація користувача
- `POST /api/auth/login` - Логін користувача
- `POST /api/auth/logout` - Вихід з системи
- `GET /api/auth/me` - Отримання поточної інформації про користувача

## 🧪 Тестування

### Бекенд тести
```bash
cd taxi_backend
npm test
```

### API тестування
```bash
# Реєстрація пасажира
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phoneNumber": "+380123456789",
    "role": "passenger"
  }'

# Логін пасажира
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📁 Структура проекту

```
taxi_front/
├── src/
│   ├── components/          # React компоненти
│   ├── screens/            # Екрани додатку
│   ├── navigation/         # Навігація
│   ├── services/           # API сервіси
│   ├── hooks/              # React хуки
│   ├── utils/              # Утиліти
│   ├── config/             # Конфігурація
│   └── types/              # TypeScript типи
├── taxi_backend/
│   ├── src/
│   │   ├── controllers/    # Контролери
│   │   ├── routes/         # Маршрути
│   │   ├── middleware/     # Middleware
│   │   ├── config/         # Конфігурація
│   │   └── database/       # SQL скрипти
│   └── tests/              # Тести
└── README.md
```

## 🚨 Вирішення проблем

### Проблеми з базою даних
1. Переконайтеся, що PostgreSQL запущений
2. Перевірте налаштування в .env файлі
3. Запустіть `npm run init-db` для створення таблиць

### Проблеми з підключенням
1. Перевірте, чи запущений бекенд на порту 3001
2. Перевірте налаштування API_URL в `src/config/api.ts`
3. Перевірте CORS налаштування на бекенді

### Проблеми з мобільним додатком
1. Перезапустіть Metro bundler: `npx expo start --clear`
2. Перезапустіть симулятор/емулятор
3. Перевірте версії залежностей

## 📄 Ліцензія

Цей проект розповсюджується під ліцензією MIT.

## 🤝 Внесок

1. Форкніть проект
2. Створіть гілку для нової функції (`git checkout -b feature/amazing-feature`)
3. Зробіть коміт змін (`git commit -m 'Add some amazing feature'`)
4. Відправте зміни (`git push origin feature/amazing-feature`)
5. Відкрийте Pull Request

## 📞 Підтримка

Якщо у вас виникли питання або проблеми, створіть issue в репозиторії проекту. 