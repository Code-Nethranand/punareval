import { z } from 'zod';

export const subjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  semester: z.number().int().positive(),
  marks: z.number().int().min(0).max(100),
  fee: z.number().positive(),
});

export const revaluationRequestSchema = z.object({
  userId: z.string(),
  subjects: z.array(subjectSchema).min(1),
  totalFee: z.number().positive(),
});

export const validateRevaluationRequest = (data: unknown) => {
  return revaluationRequestSchema.parse(data);
};