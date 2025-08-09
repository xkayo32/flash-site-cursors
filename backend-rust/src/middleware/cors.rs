use tower_http::cors::{CorsLayer, Any};
use axum::http::{Method, HeaderValue};
use crate::config::AppConfig;
use tracing::info;

pub fn create_cors_layer(config: &AppConfig) -> CorsLayer {
    info!("Setting up CORS with origins: {:?}", config.cors_origins);

    let mut cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::PATCH,
            Method::OPTIONS,
        ])
        .allow_headers(Any)
        .allow_credentials(true);

    if config.is_development() {
        // In development, allow any origin
        cors = cors.allow_origin(Any);
        info!("CORS: Development mode - allowing any origin");
    } else {
        // In production, only allow specified origins
        let origins: Vec<HeaderValue> = config.cors_origins
            .iter()
            .filter_map(|origin| origin.parse().ok())
            .collect();
        
        if !origins.is_empty() {
            cors = cors.allow_origin(origins);
            info!("CORS: Production mode - allowing specific origins");
        } else {
            // Fallback to allow any origin if no valid origins configured
            cors = cors.allow_origin(Any);
            info!("CORS: No valid origins configured, allowing any origin");
        }
    }

    cors
}