import { translations } from '../src/i18n/translations';
import { authMessages } from '../src/i18n/authMessages';
test('English and Ukrainian dictionaries have matching keys and interpolation parameters', () => {
  expect(Object.keys(translations.en).sort()).toEqual(Object.keys(translations.uk).sort());
  for (const key of Object.keys(translations.en)) {
    expect(translations.en[key].match(/\{\w+\}/g)?.sort() ?? []).toEqual(translations.uk[key].match(/\{\w+\}/g)?.sort() ?? []);
  }
});
test('legacy authentication messages translate without changing validation contracts', () => {
  expect(translations.en['Паролі не співпадають']).toBe('Passwords do not match');
  expect(translations.uk['Паролі не співпадають']).toBe('Паролі не співпадають');
  expect(Object.values(authMessages).every((value) => !/[А-Яа-яіІїЇєЄґҐ]/.test(value))).toBe(true);
});
