// src/lib/schemas.ts
import { z } from 'zod';

export const ConvertCurrencyRequestSchema = z.object({
  from: z.string().length(3, { message: "Currency code must be 3 characters" }),
  to: z.string().length(3, { message: "Currency code must be 3 characters" }),
  amount: z.number().positive({ message: "Amount must be a positive number" }),
});
