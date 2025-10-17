import { generateToken, verifyToken } from '../jwt';

describe('JWT Utilities', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should generate a token and then successfully verify it', () => {
    const userId = 123;
    const token = generateToken(userId);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe(userId);
  });

  it('should return null for an invalid signature', () => {
    const token = generateToken(456);
    const invalidToken = token.slice(0, -5) + 'abcde';

    const payload = verifyToken(invalidToken);
    expect(payload).toBeNull();
  });

  it('should return null for an expired token', () => {
    const token = generateToken(789);

    const payload = verifyToken(token);
    expect(payload).not.toBeNull();

    jest
      .spyOn(Date, 'now')
      .mockImplementation(() => Date.now() + 2 * 60 * 60 * 1000);

    const expiredPayload = verifyToken(token);
    expect(expiredPayload).toBeNull();

    jest.restoreAllMocks();
  });
});
