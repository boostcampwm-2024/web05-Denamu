export interface DatabaseConnection {
  executeQuery<T>(query: string, params: any[]): Promise<T[]>;
  end(): Promise<void>;
}
