import { hashPassword, verifyPassword } from '../hash';

describe('Password Hashing', () => {
  it('should hash a password and then successfully verify it', async () => {
    const password = 'mySecurePassword123';
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toEqual(password);
    expect(hashedPassword).toContain(':');

    const isCorrect = await verifyPassword(hashedPassword, password);
    expect(isCorrect).toBe(true);
  });

  it('should fail to verify an incorrect password', async () => {
    const password = 'mySecurePassword123';
    const wrongPassword = 'wrongPassword';
    const hashedPassword = await hashPassword(password);

    const isCorrect = await verifyPassword(hashedPassword, wrongPassword);
    expect(isCorrect).toBe(false);
  });
});
