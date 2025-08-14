import { Pool, PoolClient } from 'pg';

// Configuração da conexão PostgreSQL
const pool = new Pool({
  user: process.env.DB_USERNAME || 'estudos_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'estudos_db',
  password: process.env.DB_PASSWORD || 'estudos_pass',
  port: parseInt(process.env.DB_PORT || '5532'),
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para executar queries
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para executar transações
export async function transaction(callback: (client: PoolClient) => Promise<any>): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ PostgreSQL conectado:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão PostgreSQL:', error);
    return false;
  }
}

// Função para obter estatísticas do pool
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}

export default pool;