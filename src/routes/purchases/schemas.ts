import { z } from 'zod';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

/**
 * Validation schema for GET /purchases query parameters
 */
export const getPurchasesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z
    .enum([PurchaseStatus.SUCCESS, PurchaseStatus.RATE_LIMITED, PurchaseStatus.FAILED])
    .optional(),
});

/**
 * Type inferred from getPurchasesQuerySchema
 */
export type GetPurchasesQuery = z.infer<typeof getPurchasesQuerySchema>;
