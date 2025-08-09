use axum::{
    extract::{Request, State},
    http::{header::AUTHORIZATION, StatusCode},
    middleware::Next,
    response::Response,
};
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use sqlx::PgPool;

use crate::{
    error::api_error::ApiError,
    services::auth::{AuthService, Claims},
    models::user::UserRole,
};

/// Middleware to extract and verify JWT token from Authorization header
pub async fn auth_middleware(
    State(pool): State<PgPool>,
    mut request: Request,
    next: Next,
) -> Result<Response, ApiError> {
    let auth_header = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|header| {
            if header.starts_with("Bearer ") {
                Some(&header[7..])
            } else {
                None
            }
        })
        .ok_or_else(|| ApiError::missing_auth_header())?;

    let auth_service = AuthService::new(pool);
    let claims = auth_service.verify_token(auth_header)?;
    
    // Insert claims into request extensions so handlers can access them
    request.extensions_mut().insert(claims);
    
    Ok(next.run(request).await)
}

/// Middleware to require admin role
pub async fn admin_middleware(
    claims: Claims,
    request: Request,
    next: Next,
) -> Result<Response, ApiError> {
    if claims.role != UserRole::Admin {
        return Err(ApiError::insufficient_permissions());
    }

    Ok(next.run(request).await)
}

/// Middleware to require instructor role or higher (admin/instructor)
pub async fn instructor_middleware(
    claims: Claims,
    request: Request,
    next: Next,
) -> Result<Response, ApiError> {
    match claims.role {
        UserRole::Admin | UserRole::Instructor => Ok(next.run(request).await),
        _ => Err(ApiError::insufficient_permissions()),
    }
}

/// Extractor for Claims from request extensions
/// This allows handlers to easily access the authenticated user's claims
#[axum::async_trait]
impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<Claims>()
            .cloned()
            .ok_or_else(|| ApiError::missing_auth_token())
    }
}

/// Helper function to extract user ID from request
pub fn extract_user_id(parts: &Parts) -> Result<i32, ApiError> {
    parts
        .extensions
        .get::<Claims>()
        .map(|claims| claims.user_id)
        .ok_or_else(|| ApiError::missing_auth_token())
}

/// Helper function to check if user has admin role
pub fn is_admin(parts: &Parts) -> bool {
    parts
        .extensions
        .get::<Claims>()
        .map(|claims| claims.role == UserRole::Admin)
        .unwrap_or(false)
}

/// Helper function to check if user has instructor role or higher
pub fn is_instructor_or_admin(parts: &Parts) -> bool {
    parts
        .extensions
        .get::<Claims>()
        .map(|claims| matches!(claims.role, UserRole::Admin | UserRole::Instructor))
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::user::UserRole;
    use chrono::Utc;

    #[test]
    fn test_claims_extraction() {
        let mut parts = Parts::default();
        
        // Test without claims
        let result = parts.extensions.get::<Claims>();
        assert!(result.is_none());
        
        // Test with claims
        let claims = Claims {
            user_id: 1,
            name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            role: UserRole::Student,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            exp: (Utc::now().timestamp() + 3600),
            iat: Utc::now().timestamp(),
        };
        
        parts.extensions.insert(claims.clone());
        
        let extracted = parts.extensions.get::<Claims>().unwrap();
        assert_eq!(extracted.user_id, claims.user_id);
        assert_eq!(extracted.email, claims.email);
    }
    
    #[test]
    fn test_role_helpers() {
        let mut parts = Parts::default();
        
        // Test admin role
        let admin_claims = Claims {
            user_id: 1,
            name: "Admin User".to_string(),
            email: "admin@example.com".to_string(),
            role: UserRole::Admin,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            exp: (Utc::now().timestamp() + 3600),
            iat: Utc::now().timestamp(),
        };
        
        parts.extensions.insert(admin_claims);
        
        assert!(is_admin(&parts));
        assert!(is_instructor_or_admin(&parts));
        assert_eq!(extract_user_id(&parts).unwrap(), 1);
    }
}