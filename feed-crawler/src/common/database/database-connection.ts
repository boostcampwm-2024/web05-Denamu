import { Lifecycle } from '@common/lifecycle/lifecycle.interface';

export interface DatabaseConnection extends Lifecycle {
  executeQuery<T>(query: string, params?: any[]): Promise<T[] | null>;
  executeQueryStrict<T>(query: string, params?: any[]): Promise<T[]>;
}
