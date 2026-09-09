import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
});
export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  username: z.string().regex(/^[a-z0-9_]{3,30}$/, 'Use 3–30 lowercase letters, numbers or underscores.'),
  agreed: z.literal(true, { error: 'Please agree to the terms to continue.' }),
});
