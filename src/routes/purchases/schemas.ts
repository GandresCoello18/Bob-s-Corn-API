import { z } from 'zod';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

export const getPurchasesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum([PurchaseStatus.SUCCESS, PurchaseStatus.RATE_LIMITED]).optional(),
});

export type GetPurchasesQuery = z.infer<typeof getPurchasesQuerySchema>;
