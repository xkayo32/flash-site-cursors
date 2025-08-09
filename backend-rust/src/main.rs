use axum::{
    routing::{get, post},
    Router,
    extract::State,
};
use tower::ServiceBuilder;
use tower_http::trace::TraceLayer;
use tracing::{info, error, warn};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use estudos_backend_rust::{
    config::{AppConfig, DatabaseConfig},
    database::DatabaseConnection,
    handlers::{health, auth},
    middleware::{cors::create_cors_layer, auth::auth_middleware},
    ApiError,
};

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub config: AppConfig,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    init_tracing()?;
    
    info!("Starting Estudos Backend (Rust) v0.1.0");

    // Load environment variables
    dotenv::dotenv().ok();
    
    // Load configuration
    let app_config = AppConfig::from_env()
        .map_err(|e| {
            error!("Failed to load app configuration: {}", e);
            e
        })?;
    
    let db_config = DatabaseConfig::from_env()
        .map_err(|e| {
            error!("Failed to load database configuration: {}", e);
            e
        })?;

    info!("Configuration loaded successfully");
    info!("Environment: {}", app_config.environment);
    info!("Server will bind to: {}", app_config.socket_addr()?);

    // Test database connection
    info!("Testing database connection...");
    if let Err(e) = db_config.test_connection().await {
        error!("Database connection test failed: {}", e);
        return Err(Box::new(e));
    }
    
    // Create database connection pool
    let db = DatabaseConnection::new(&db_config).await
        .map_err(|e| {
            error!("Failed to create database connection: {}", e);
            e
        })?;

    info!("Database connection established");

    // Create app state
    let app_state = AppState {
        db: db.clone(),
        config: app_config.clone(),
    };

    // Create router
    let app = create_router(app_state, &app_config);

    // Get socket address
    let addr = app_config.socket_addr()?;

    info!("🚀 Server starting on {}", addr);
    info!("📊 Health check available at: http://{}/api/v1/health", addr);
    
    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn create_router(state: AppState, config: &AppConfig) -> Router {
    // Create CORS layer
    let cors_layer = create_cors_layer(config);
    
    // Create middleware stack
    let middleware = ServiceBuilder::new()
        .layer(TraceLayer::new_for_http())
        .layer(cors_layer);

    // Health routes (no auth required)
    let health_routes = Router::new()
        .route("/health", get(health::health_check))
        .route("/health/simple", get(health::health_check_simple))
        .route("/health/detailed", get(health::health_check_detailed))
        .with_state(state.db.clone());

    // Auth routes (no auth required for login/register)
    let auth_routes = Router::new()
        .route("/auth/login", post(auth::login))
        .route("/auth/register", post(auth::register))
        .route("/auth/logout", post(auth::logout))
        .with_state(state.db.pool.clone());

    // Protected routes (auth required)
    let protected_routes = Router::new()
        .route("/auth/verify", get(auth::verify_token))
        .route("/auth/refresh", get(auth::refresh_token))
        .layer(axum::middleware::from_fn_with_state(
            state.db.pool.clone(), 
            auth_middleware
        ))
        .with_state(state.db.pool.clone());

    // Combine all API routes
    let api_routes = Router::new()
        .merge(health_routes)
        .merge(auth_routes)
        .merge(protected_routes);

    // Main router
    Router::new()
        .nest("/api/v1", api_routes)
        .route("/", get(root_handler))
        .with_state(state)
        .layer(middleware)
}

async fn root_handler(State(state): State<AppState>) -> Result<axum::Json<serde_json::Value>, ApiError> {
    Ok(axum::Json(serde_json::json!({
        "service": "estudos-backend-rust",
        "version": "0.1.0",
        "status": "running",
        "environment": state.config.environment,
        "timestamp": chrono::Utc::now(),
        "endpoints": {
            "health_check": "/api/v1/health",
            "simple_health": "/api/v1/health/simple", 
            "detailed_health": "/api/v1/health/detailed",
            "auth": {
                "login": "/api/v1/auth/login",
                "register": "/api/v1/auth/register",
                "logout": "/api/v1/auth/logout",
                "verify": "/api/v1/auth/verify",
                "refresh": "/api/v1/auth/refresh"
            }
        }
    })))
}

fn init_tracing() -> Result<(), Box<dyn std::error::Error>> {
    // Get log level from environment or default to info
    let log_level = std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string());
    
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| log_level.into()),
        )
        .with(tracing_subscriber::fmt::layer().with_target(true))
        .init();

    Ok(())
}