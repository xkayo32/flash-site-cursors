use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    error::api_error::ApiError,
    models::user::{User, UserRole},
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub user_id: i32,
    pub name: String,
    pub email: String,
    pub role: UserRole,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub exp: i64, // Expiration time (as Unix timestamp)
    pub iat: i64, // Issued at (as Unix timestamp)
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub role: UserRole,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<User> for UserInfo {
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

pub struct AuthService {
    pool: PgPool,
    jwt_secret: String,
}

impl AuthService {
    pub fn new(pool: PgPool) -> Self {
        let jwt_secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "your-jwt-secret-change-in-production".to_string());
        
        Self { pool, jwt_secret }
    }

    /// Authenticate user and generate JWT token
    pub async fn login(&self, email: &str, password: &str) -> Result<LoginResponse, ApiError> {
        // Find user by email
        let user = User::find_by_email(&self.pool, email).await?
            .ok_or_else(|| ApiError::invalid_credentials())?;

        // Verify password
        if !bcrypt::verify(password, &user.password_hash)? {
            return Err(ApiError::invalid_credentials());
        }

        // Generate JWT token
        let token_data = self.generate_token(&user)?;

        Ok(LoginResponse {
            token: token_data.0,
            user: user.into(),
            expires_at: token_data.1,
        })
    }

    /// Register new user and generate JWT token
    pub async fn register(
        &self,
        name: &str,
        email: &str,
        password: &str,
        role: UserRole,
    ) -> Result<LoginResponse, ApiError> {
        // Check if email already exists
        if User::find_by_email(&self.pool, email).await?.is_some() {
            return Err(ApiError::email_already_exists());
        }

        // Hash password
        let password_hash = bcrypt::hash(password, bcrypt::DEFAULT_COST)?;

        // Create user
        let user = User::create(&self.pool, name, email, &password_hash, role).await?;

        // Generate JWT token
        let token_data = self.generate_token(&user)?;

        Ok(LoginResponse {
            token: token_data.0,
            user: user.into(),
            expires_at: token_data.1,
        })
    }

    /// Refresh an existing JWT token
    pub async fn refresh_token(&self, claims: &Claims) -> Result<LoginResponse, ApiError> {
        // Verify user still exists and is active
        let user = User::find_by_id(&self.pool, claims.user_id).await?
            .ok_or_else(|| ApiError::user_not_found())?;

        // Generate new token
        let token_data = self.generate_token(&user)?;

        Ok(LoginResponse {
            token: token_data.0,
            user: user.into(),
            expires_at: token_data.1,
        })
    }

    /// Generate JWT token for user
    fn generate_token(&self, user: &User) -> Result<(String, chrono::DateTime<chrono::Utc>), ApiError> {
        let now = Utc::now();
        let expires_at = now + Duration::hours(24); // Token expires in 24 hours

        let claims = Claims {
            user_id: user.id,
            name: user.name.clone(),
            email: user.email.clone(),
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
            exp: expires_at.timestamp(),
            iat: now.timestamp(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        )?;

        Ok((token, expires_at))
    }

    /// Verify and decode JWT token
    pub fn verify_token(&self, token: &str) -> Result<Claims, ApiError> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }
}