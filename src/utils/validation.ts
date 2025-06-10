export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone: string): boolean => {
  // Ukrainian phone number format
  const phoneRegex = /^\+380\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateFullName = (name: string): boolean => {
  // At least 2 words with minimum 2 characters each
  const nameRegex = /^[а-яА-ЯіІїЇєЄґҐa-zA-Z]{2,}\s[а-яА-ЯіІїЇєЄґҐa-zA-Z]{2,}$/;
  return nameRegex.test(name);
};

export const validateLicenseNumber = (license: string): boolean => {
  // Ukrainian driver's license format
  const licenseRegex = /^[A-Z]{2}\d{6}$/;
  return licenseRegex.test(license);
};

export const validateCarNumber = (number: string): boolean => {
  // Ukrainian car number format
  const numberRegex = /^[A-Z]{2}\d{4}[A-Z]{2}$/;
  return numberRegex.test(number);
};

export const getEmailError = (email: string): string | null => {
  if (!email) {
    return 'Електронна пошта обов\'язкова';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Невірний формат електронної пошти';
  }
  return null;
};

export const getPasswordError = (password: string): string | null => {
  if (!password) {
    return 'Пароль обов\'язковий';
  }
  if (password.length < 8) {
    return 'Пароль повинен містити щонайменше 8 символів';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Пароль повинен містити щонайменше одну велику літеру';
  }
  if (!/[a-z]/.test(password)) {
    return 'Пароль повинен містити щонайменше одну малу літеру';
  }
  if (!/[0-9]/.test(password)) {
    return 'Пароль повинен містити щонайменше одну цифру';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Пароль повинен містити щонайменше один спеціальний символ (!@#$%^&*)';
  }
  return null;
};

export const getPhoneError = (phone: string): string | null => {
  if (!phone) {
    return 'Номер телефону обов\'язковий';
  }
  const phoneRegex = /^\+?[0-9]{10,12}$/;
  if (!phoneRegex.test(phone)) {
    return 'Невірний формат номеру телефону';
  }
  return null;
};

export const getFullNameError = (fullName: string): string | null => {
  if (!fullName) {
    return 'Повне ім\'я обов\'язкове';
  }
  if (fullName.length < 2) {
    return 'Ім\'я повинно містити щонайменше 2 символи';
  }
  if (!/^[а-яА-ЯіІїЇєЄґҐa-zA-Z\s-]+$/.test(fullName)) {
    return 'Ім\'я може містити тільки літери, пробіли та дефіс';
  }
  return null;
};

export const getLicenseNumberError = (licenseNumber: string): string | null => {
  if (!licenseNumber) {
    return 'Номер водійського посвідчення обов\'язковий';
  }
  if (!/^[A-Z]{2}\d{6}$/.test(licenseNumber)) {
    return 'Невірний формат номеру водійського посвідчення (наприклад: AB123456)';
  }
  return null;
};

export const getCarNumberError = (carNumber: string): string | null => {
  if (!carNumber) {
    return 'Номер автомобіля обов\'язковий';
  }
  if (!/^[A-Z]{2}\d{4}[A-Z]{2}$/.test(carNumber)) {
    return 'Невірний формат номеру автомобіля (наприклад: AA1234BB)';
  }
  return null;
}; 