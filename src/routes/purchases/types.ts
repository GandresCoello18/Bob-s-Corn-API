import { GetPurchasesUseCase } from '@/application/use-cases/get-purchases/get-purchases.use-case';
import { PurchaseCornUseCase } from '@/application/use-cases/purchase-corn/purchase-corn.use-case';

import { Logger } from '@config/logger';

export interface PurchasesRoutesDependencies {
  getPurchasesUseCase: GetPurchasesUseCase;
  purchaseCornUseCase: PurchaseCornUseCase;
  logger: Logger;
}
