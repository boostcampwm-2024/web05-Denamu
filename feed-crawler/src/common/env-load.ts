import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// PROD 환경에서는 런타임 환경 변수만 사용
if (process.env.NODE_ENV !== 'PROD') {
  const envMap = {
    LOCAL: path.join(process.cwd(), 'env/.env.local'),
    DEV: path.join(process.cwd(), 'env/.env.local'),
  } as const;

  const chosen = envMap[process.env.NODE_ENV as keyof typeof envMap];

  if (!chosen) {
    throw new Error(`Unknown NODE_ENV: ${process.env.NODE_ENV}`);
  }

  if (!fs.existsSync(chosen)) {
    throw new Error(`Environment file not found: ${chosen}`);
  }

  dotenv.config({ path: chosen });
}
