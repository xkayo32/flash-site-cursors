use figment::{Figment, providers::{Env, Format, Toml}};
use serde::Deserialize;
use sqlx::{PgPool, Pool, Postgres};
use tracing::{info, warn};

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig {
    #[serde(alias = "DATABASE_URL")]
    pub url: String,
    pub max_connections: u32,
    pub min_connections: u32,
    pub acquire_timeout: u64,
    pub idle_timeout: u64,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            url: "postgresql://estudos_user:estudos_pass@localhost:5532/estudos_db".to_string(),
            max_connections: 10,
            min_connections: 1,
            acquire_timeout: 30,
            idle_timeout: 600,
        }
    }
}

impl DatabaseConfig {
    pub fn from_env() -> Result<Self, figment::Error> {
        Figment::new()
            .merge(Toml::file("config.toml"))
            .merge(Env::prefixed("DB_"))
            .merge(Env::raw())
            .extract()
    }

    pub async fn create_pool(&self) -> Result<PgPool, sqlx::Error> {
        info!("Creating database connection pool...");
        info!("Database URL: {}", mask_database_url(&self.url));
        
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(self.max_connections)
            .min_connections(self.min_connections)
            .acquire_timeout(std::time::Duration::from_secs(self.acquire_timeout))
            .idle_timeout(std::time::Duration::from_secs(self.idle_timeout))
            .connect(&self.url)
            .await?;

        info!("Database connection pool created successfully");
        Ok(pool)
    }

    pub async fn test_connection(&self) -> Result<(), sqlx::Error> {
        info!("Testing database connection...");
        
        let pool = self.create_pool().await?;
        
        let result = sqlx::query_scalar::<_, i32>("SELECT 1")
            .fetch_one(&pool)
            .await?;

        if result == 1 {
            info!("Database connection test successful");
            Ok(())
        } else {
            warn!("Database connection test returned unexpected result: {}", result);
            Err(sqlx::Error::Protocol("Unexpected test query result".to_string()))
        }
    }
}

fn mask_database_url(url: &str) -> String {
    if let Ok(parsed) = url::Url::parse(url) {
        let mut masked = parsed.clone();
        if parsed.password().is_some() {
            let _ = masked.set_password(Some("***"));
        }
        masked.to_string()
    } else {
        "***invalid-url***".to_string()
    }
}