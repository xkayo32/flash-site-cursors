use sqlx::{PgPool, Pool, Postgres, Row};
use tracing::{info, error};
use crate::config::DatabaseConfig;
use crate::error::ApiError;

#[derive(Clone)]
pub struct DatabaseConnection {
    pub pool: PgPool,
}

impl DatabaseConnection {
    pub async fn new(config: &DatabaseConfig) -> Result<Self, ApiError> {
        let pool = config.create_pool().await
            .map_err(|e| {
                error!("Failed to create database pool: {}", e);
                ApiError::DatabaseConnection(format!("Failed to create database pool: {}", e))
            })?;

        Ok(Self { pool })
    }

    pub async fn health_check(&self) -> Result<DatabaseHealth, ApiError> {
        let start = std::time::Instant::now();
        
        let result = sqlx::query("SELECT version(), current_database(), current_timestamp")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| {
                error!("Database health check failed: {}", e);
                ApiError::DatabaseConnection(format!("Health check failed: {}", e))
            })?;

        let version: String = result.get(0);
        let database: String = result.get(1);
        let timestamp: chrono::DateTime<chrono::Utc> = result.get(2);
        let response_time = start.elapsed();

        info!("Database health check successful - Response time: {:?}", response_time);

        Ok(DatabaseHealth {
            status: "healthy".to_string(),
            database,
            version,
            timestamp,
            response_time_ms: response_time.as_millis() as u64,
            pool_connections: self.pool_status(),
        })
    }

    pub fn pool_status(&self) -> PoolStatus {
        PoolStatus {
            size: self.pool.size(),
            idle: self.pool.num_idle(),
        }
    }

    pub async fn test_basic_queries(&self) -> Result<(), ApiError> {
        info!("Running basic database queries test...");

        // Test 1: Simple query
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| {
                error!("Basic query test failed: {}", e);
                ApiError::DatabaseQuery(format!("Users count query failed: {}", e))
            })?;

        info!("Users table contains {} records", count);

        // Test 2: Check tables existence
        let tables: Vec<String> = sqlx::query_scalar(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| {
            error!("Tables query failed: {}", e);
            ApiError::DatabaseQuery(format!("Tables query failed: {}", e))
        })?;

        info!("Database tables: {:?}", tables);

        Ok(())
    }
}

#[derive(serde::Serialize)]
pub struct DatabaseHealth {
    pub status: String,
    pub database: String,
    pub version: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub response_time_ms: u64,
    pub pool_connections: PoolStatus,
}

#[derive(serde::Serialize)]
pub struct PoolStatus {
    pub size: u32,
    pub idle: usize,
}