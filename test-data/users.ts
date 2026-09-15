/**
 * Saucedemo's public demo accounts (listed on the login page itself).
 * These are not secrets — do not put real credentials in this file.
 */
export interface User {
  username: string;
  password: string;
}

const PASSWORD = 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  problem: { username: 'problem_user', password: PASSWORD },
  performanceGlitch: { username: 'performance_glitch_user', password: PASSWORD },
  error: { username: 'error_user', password: PASSWORD },
  visual: { username: 'visual_user', password: PASSWORD },
} satisfies Record<string, User>;

export const invalidUsers = {
  wrongPassword: { username: 'standard_user', password: 'wrong_password' },
  unknownUser: { username: 'not_a_user', password: PASSWORD },
  emptyUsername: { username: '', password: PASSWORD },
  emptyPassword: { username: 'standard_user', password: '' },
} satisfies Record<string, User>;

export const loginErrors = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
};
