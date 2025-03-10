import * as dotenv from "dotenv";

dotenv.config({
  path:
    {
      PROD: `${process.cwd()}/env/.env.prod`,
      LOCAL: `${process.cwd()}/env/.env.local`,
      DEV: `${process.cwd()}/env/.env.local`,
    }[process.env.NODE_ENV] || "",
});
