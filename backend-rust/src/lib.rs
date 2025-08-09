pub mod config;
pub mod database;
pub mod error;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod services;
pub mod utils;

// Re-export commonly used types
pub use config::{AppConfig, DatabaseConfig};
pub use database::DatabaseConnection;
pub use error::ApiError;