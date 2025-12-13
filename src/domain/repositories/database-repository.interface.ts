export interface IDatabaseRepository {
  healthCheck(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
