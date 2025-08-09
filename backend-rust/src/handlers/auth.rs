use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use validator::Validate;

use crate::{
    error::api_error::ApiError,
    models::user::{User, UserRole},
    services::auth::{AuthService, Claims, LoginResponse},
};

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 1))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(length(min = 2, max = 100))]
    pub name: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 6, max = 50))]
    pub password: String,
    #[serde(default)]
    pub role: Option<UserRole>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub role: UserRole,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

/// POST /api/v1/auth/login
pub async fn login(
    State(pool): State<PgPool>,
    Json(request): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    // Validate input
    request.validate()?;
    
    let auth_service = AuthService::new(pool);
    let response = auth_service.login(&request.email, &request.password).await?;
    
    tracing::info!(
        email = %request.email,
        user_id = %response.user.id,
        "User successfully logged in"
    );
    
    Ok(Json(response))
}

/// POST /api/v1/auth/register
pub async fn register(
    State(pool): State<PgPool>,
    Json(request): Json<RegisterRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    // Validate input
    request.validate()?;
    
    // Default to student role if not specified
    let role = request.role.unwrap_or(UserRole::Student);
    
    let auth_service = AuthService::new(pool);
    let response = auth_service.register(&request.name, &request.email, &request.password, role).await?;
    
    tracing::info!(
        email = %request.email,
        user_id = %response.user.id,
        role = ?role,
        "New user registered successfully"
    );
    
    Ok(Json(response))
}

/// GET /api/v1/auth/verify
pub async fn verify_token(
    claims: Claims,
) -> Result<Json<UserResponse>, ApiError> {
    // The middleware has already verified the token and extracted claims
    // We just need to return the user info
    
    tracing::debug!(
        user_id = %claims.user_id,
        email = %claims.email,
        "Token verification successful"
    );
    
    Ok(Json(UserResponse {
        id: claims.user_id,
        name: claims.name,
        email: claims.email,
        role: claims.role,
        created_at: claims.created_at,
        updated_at: claims.updated_at,
    }))
}

/// POST /api/v1/auth/logout
pub async fn logout() -> Result<Json<serde_json::Value>, ApiError> {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the token from storage. We just return a success message.
    
    tracing::info!("User logged out (client-side token removal)");
    
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Successfully logged out. Please remove the token from client storage."
    })))
}

/// GET /api/v1/auth/refresh
pub async fn refresh_token(
    State(pool): State<PgPool>,
    claims: Claims,
) -> Result<Json<LoginResponse>, ApiError> {
    // Generate a new token with fresh expiration time
    let auth_service = AuthService::new(pool);
    let response = auth_service.refresh_token(&claims).await?;
    
    tracing::info!(
        user_id = %claims.user_id,
        "Token refreshed successfully"
    );
    
    Ok(Json(response))
}