export interface ICacheRepository {
  healthCheck(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
