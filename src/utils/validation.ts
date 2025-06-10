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
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const getPasswordError = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  return null;
};

export const getPhoneError = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const getFullNameError = (name: string): string | null => {
  if (!name) {
    return 'Full name is required';
  }
  if (name.length < 2) {
    return 'Full name must be at least 2 characters long';
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return 'Full name can only contain letters and spaces';
  }
  return null;
};

export const getLicenseNumberError = (license: string): string | null => {
  if (!license) {
    return 'License number is required';
  }
  if (license.length < 5) {
    return 'License number must be at least 5 characters long';
  }
  return null;
};

export const getCarNumberError = (number: string): string | null => {
  if (!number) {
    return 'Car number is required';
  }
  if (number.length < 4) {
    return 'Car number must be at least 4 characters long';
  }
  return null;
}; 