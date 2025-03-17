import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const URL = process.env.NODE_ENV === 'REMOTE' ? process.env.DATABASE_REMOTE_URL : process.env.DATABASE_LOCAL_URL
const _POOL = typeof process.env.DB_POOL === 'undefined' ? 50 : parseInt(process.env.DB_POOL);
console.log(URL,_POOL)

const pool = new Pool({
  connectionString: URL,
  max : _POOL
});

export default pool;
