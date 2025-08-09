use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::fmt;
use thiserror::Error;
use tracing::error;

#[derive(Error, Debug)]
pub enum ApiError {
    // Database errors
    #[error("Database connection error: {0}")]
    DatabaseConnection(String),
    
    #[error("Database query error: {0}")]
    DatabaseQuery(String),

    // Authentication errors
    #[error("Authentication failed: {0}")]
    Authentication(String),
    
    #[error("Authorization failed: {0}")]
    Authorization(String),
    
    #[error("Invalid JWT token: {0}")]
    InvalidToken(String),

    // Validation errors
    #[error("Validation failed: {0}")]
    Validation(String),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    // Business logic errors
    #[error("Resource not found: {0}")]
    NotFound(String),
    
    #[error("Resource already exists: {0}")]
    AlreadyExists(String),
    
    #[error("Operation not allowed: {0}")]
    Forbidden(String),

    // Server errors
    #[error("Internal server error: {0}")]
    InternalServer(String),
    
    #[error("Service unavailable: {0}")]
    ServiceUnavailable(String),
    
    #[error("Configuration error: {0}")]
    Configuration(String),

    // External service errors
    #[error("External service error: {0}")]
    ExternalService(String),
}

impl ApiError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            ApiError::DatabaseConnection(_) | ApiError::DatabaseQuery(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Authentication(_) => StatusCode::UNAUTHORIZED,
            ApiError::Authorization(_) | ApiError::Forbidden(_) => StatusCode::FORBIDDEN,
            ApiError::InvalidToken(_) => StatusCode::UNAUTHORIZED,
            ApiError::Validation(_) | ApiError::InvalidInput(_) => StatusCode::BAD_REQUEST,
            ApiError::NotFound(_) => StatusCode::NOT_FOUND,
            ApiError::AlreadyExists(_) => StatusCode::CONFLICT,
            ApiError::InternalServer(_) | ApiError::Configuration(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::ServiceUnavailable(_) => StatusCode::SERVICE_UNAVAILABLE,
            ApiError::ExternalService(_) => StatusCode::BAD_GATEWAY,
        }
    }

    pub fn error_code(&self) -> &'static str {
        match self {
            ApiError::DatabaseConnection(_) => "DATABASE_CONNECTION_ERROR",
            ApiError::DatabaseQuery(_) => "DATABASE_QUERY_ERROR",
            ApiError::Authentication(_) => "AUTHENTICATION_FAILED",
            ApiError::Authorization(_) => "AUTHORIZATION_FAILED",
            ApiError::InvalidToken(_) => "INVALID_TOKEN",
            ApiError::Validation(_) => "VALIDATION_FAILED",
            ApiError::InvalidInput(_) => "INVALID_INPUT",
            ApiError::NotFound(_) => "RESOURCE_NOT_FOUND",
            ApiError::AlreadyExists(_) => "RESOURCE_ALREADY_EXISTS",
            ApiError::Forbidden(_) => "OPERATION_FORBIDDEN",
            ApiError::InternalServer(_) => "INTERNAL_SERVER_ERROR",
            ApiError::ServiceUnavailable(_) => "SERVICE_UNAVAILABLE",
            ApiError::Configuration(_) => "CONFIGURATION_ERROR",
            ApiError::ExternalService(_) => "EXTERNAL_SERVICE_ERROR",
        }
    }

    pub fn should_log(&self) -> bool {
        match self {
            // Don't log client errors
            ApiError::Authentication(_) |
            ApiError::Authorization(_) |
            ApiError::InvalidToken(_) |
            ApiError::Validation(_) |
            ApiError::InvalidInput(_) |
            ApiError::NotFound(_) |
            ApiError::AlreadyExists(_) |
            ApiError::Forbidden(_) => false,
            
            // Log server errors
            _ => true,
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let error_code = self.error_code();
        let message = self.to_string();

        // Log server errors
        if self.should_log() {
            error!("API Error [{}]: {} - {}", status.as_u16(), error_code, message);
        }

        let error_response = json!({
            "error": {
                "code": error_code,
                "message": message,
                "status": status.as_u16(),
                "timestamp": chrono::Utc::now().to_rfc3339(),
            }
        });

        (status, Json(error_response)).into_response()
    }
}

// Convert from common errors
impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => ApiError::NotFound("Resource not found".to_string()),
            sqlx::Error::PoolClosed => ApiError::DatabaseConnection("Connection pool closed".to_string()),
            sqlx::Error::PoolTimedOut => ApiError::DatabaseConnection("Connection pool timeout".to_string()),
            _ => ApiError::DatabaseQuery(err.to_string()),
        }
    }
}

impl From<figment::Error> for ApiError {
    fn from(err: figment::Error) -> Self {
        ApiError::Configuration(err.to_string())
    }
}

impl From<jsonwebtoken::errors::Error> for ApiError {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        ApiError::InvalidToken(err.to_string())
    }
}

impl From<validator::ValidationErrors> for ApiError {
    fn from(err: validator::ValidationErrors) -> Self {
        ApiError::Validation(err.to_string())
    }
}

// Convert from bcrypt errors
impl From<bcrypt::BcryptError> for ApiError {
    fn from(err: bcrypt::BcryptError) -> Self {
        ApiError::InternalServer(format!("Password hashing error: {}", err))
    }
}

// Helper functions for common errors
impl ApiError {
    pub fn not_found(resource: &str) -> Self {
        Self::NotFound(format!("{} not found", resource))
    }

    pub fn already_exists(resource: &str) -> Self {
        Self::AlreadyExists(format!("{} already exists", resource))
    }

    pub fn forbidden(action: &str) -> Self {
        Self::Forbidden(format!("Not allowed to {}", action))
    }

    pub fn invalid_input(field: &str, reason: &str) -> Self {
        Self::InvalidInput(format!("Invalid {}: {}", field, reason))
    }

    pub fn internal_server_error(message: &str) -> Self {
        Self::InternalServer(message.to_string())
    }

    // Specific authentication errors
    pub fn invalid_credentials() -> Self {
        Self::Authentication("Invalid email or password".to_string())
    }
    
    pub fn email_already_exists() -> Self {
        Self::AlreadyExists("Email address already registered".to_string())
    }
    
    pub fn user_not_found() -> Self {
        Self::NotFound("User not found".to_string())
    }
    
    pub fn missing_auth_header() -> Self {
        Self::Authentication("Missing authorization header".to_string())
    }
    
    pub fn missing_auth_token() -> Self {
        Self::Authentication("Missing authentication token".to_string())
    }
    
    pub fn insufficient_permissions() -> Self {
        Self::Authorization("Insufficient permissions for this operation".to_string())
    }
}