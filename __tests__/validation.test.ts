import { getFullNameError, getLicenseNumberError, getPasswordError, validatePassword } from '../src/utils/validation';
test('whitespace is not a name', () => { expect(getFullNameError('   ')).not.toBeNull(); });
test.each(['AB 123456', 'АВ 123456', '1234-5678'])('accepts supported license format %s', (value) => {
  expect(getLicenseNumberError(value)).toBeNull();
});
test('password validation helpers agree about special characters', () => {
  expect(validatePassword('Password1!')).toBe(true); expect(getPasswordError('Password1!')).toBeNull();
  expect(validatePassword('Password12')).toBe(false); expect(getPasswordError('Password12')).not.toBeNull();
});
