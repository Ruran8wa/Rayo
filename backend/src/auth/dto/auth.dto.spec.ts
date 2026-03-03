import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AuthDto } from './auth.dto';

describe('AuthDto', () => {
  it('passes with valid email and password', async () => {
    const dto = plainToInstance(AuthDto, { email: 'test@example.com', password: 'secret123' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails with invalid email', async () => {
    const dto = plainToInstance(AuthDto, { email: 'not-an-email', password: 'secret123' });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('fails with password shorter than 6 chars', async () => {
    const dto = plainToInstance(AuthDto, { email: 'test@example.com', password: '123' });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'password')).toBe(true);
  });

  it('passes with optional name and disability_type included', async () => {
    const dto = plainToInstance(AuthDto, {
      email: 'test@example.com',
      password: 'secret123',
      name: 'Jane Smith',
      disability_type: 'Mobility impairment',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
