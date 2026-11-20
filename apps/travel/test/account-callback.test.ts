import { expect, test } from 'bun:test';
import { getAccountCallbackURL } from '../src/auth/account-callback';

test('returns web sign-ins to the travel app origin', () => {
  expect(getAccountCallbackURL('https://travel.example.com')).toBe(
    'https://travel.example.com/account',
  );
});

test('lets the Expo auth plugin resolve the native account deep link', () => {
  expect(getAccountCallbackURL()).toBe('/account');
});
