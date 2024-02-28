import { z } from 'zod';

export const payloadSchema = z.object({
  id: z.number(),
  email: z.string().email(),
});

export type Payload = z.infer<typeof payloadSchema>;
