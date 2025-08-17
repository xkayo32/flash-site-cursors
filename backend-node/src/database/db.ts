import { Pool } from 'pg';

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5532'),
  database: process.env.DB_NAME || 'estudos_db',
  user: process.env.DB_USER || 'estudos_user',
  password: process.env.DB_PASSWORD || 'estudos_pass',
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função helper para executar queries
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Função para fechar o pool (usar em graceful shutdown)
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;