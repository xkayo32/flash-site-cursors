use axum::{
    extract::State,
    response::Json,
};
use serde_json::{json, Value};
use tracing::{info, warn};
use crate::{
    database::DatabaseConnection,
    error::ApiError,
};

/// Health check endpoint that tests the API and database connectivity
/// 
/// Returns:
/// - API status (always "healthy" if responding)
/// - Database status and connection info
/// - Server timestamp
/// - Environment info
pub async fn health_check(
    State(db): State<DatabaseConnection>,
) -> Result<Json<Value>, ApiError> {
    info!("Health check requested");

    let start_time = std::time::Instant::now();
    
    // Test database connection
    let db_health = match db.health_check().await {
        Ok(health) => {
            info!("Database health check passed");
            json!({
                "status": "healthy",
                "database": health.database,
                "version": health.version,
                "timestamp": health.timestamp,
                "response_time_ms": health.response_time_ms,
                "pool": {
                    "total_connections": health.pool_connections.size,
                    "idle_connections": health.pool_connections.idle,
                }
            })
        }
        Err(e) => {
            warn!("Database health check failed: {}", e);
            json!({
                "status": "unhealthy",
                "error": e.to_string()
            })
        }
    };

    let total_response_time = start_time.elapsed();

    let response = json!({
        "api": {
            "status": "healthy",
            "service": "estudos-backend-rust",
            "version": "0.1.0",
            "timestamp": chrono::Utc::now(),
            "response_time_ms": total_response_time.as_millis(),
        },
        "database": db_health,
        "system": {
            "environment": std::env::var("RUST_ENV").unwrap_or_else(|_| "development".to_string()),
            "uptime_seconds": get_uptime_seconds(),
        }
    });

    info!("Health check completed in {:?}", total_response_time);
    Ok(Json(response))
}

/// Simple health check that only tests API availability (no database)
pub async fn health_check_simple() -> Json<Value> {
    info!("Simple health check requested");
    
    Json(json!({
        "status": "healthy",
        "service": "estudos-backend-rust",
        "version": "0.1.0",
        "timestamp": chrono::Utc::now(),
        "message": "API is running"
    }))
}

/// Detailed health check that includes database tests
pub async fn health_check_detailed(
    State(db): State<DatabaseConnection>,
) -> Result<Json<Value>, ApiError> {
    info!("Detailed health check requested");
    
    let start_time = std::time::Instant::now();

    // Run database health check
    let db_health = db.health_check().await?;
    
    // Run additional database tests
    let _basic_queries_result = db.test_basic_queries().await?;
    
    let total_response_time = start_time.elapsed();

    let response = json!({
        "api": {
            "status": "healthy",
            "service": "estudos-backend-rust",
            "version": "0.1.0",
            "timestamp": chrono::Utc::now(),
            "response_time_ms": total_response_time.as_millis(),
        },
        "database": {
            "status": "healthy",
            "database": db_health.database,
            "version": db_health.version,
            "timestamp": db_health.timestamp,
            "response_time_ms": db_health.response_time_ms,
            "pool": {
                "total_connections": db_health.pool_connections.size,
                "idle_connections": db_health.pool_connections.idle,
            },
            "queries_test": "passed"
        },
        "system": {
            "environment": std::env::var("RUST_ENV").unwrap_or_else(|_| "development".to_string()),
            "uptime_seconds": get_uptime_seconds(),
            "rust_version": env!("RUSTC_VERSION"),
        }
    });

    info!("Detailed health check completed in {:?}", total_response_time);
    Ok(Json(response))
}

// Helper function to get system uptime (simplified)
fn get_uptime_seconds() -> u64 {
    // In a real implementation, you might want to track application start time
    // For now, we'll just return a placeholder
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() % 86400 // Reset daily for demo
}