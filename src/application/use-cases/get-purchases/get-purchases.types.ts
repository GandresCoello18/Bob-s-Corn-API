import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

export interface Purchase {
  id: string;
  clientIp: string;
  createdAt: Date;
  status: PurchaseStatus;
  meta: unknown;
}

export interface GetPurchasesInput {
  clientIp: string;
  limit?: number;
  offset?: number;
  status?: PurchaseStatus;
}

export interface GetPurchasesResult {
  purchases: Purchase[];
  total: number;
  limit: number;
  offset: number;
}
