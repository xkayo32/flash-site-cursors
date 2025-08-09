use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};

use crate::error::api_error::ApiError;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Admin,
    Instructor,
    Student,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub role: UserRole,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl User {
    /// Create a new user in the database
    pub async fn create(
        pool: &PgPool,
        name: &str,
        email: &str,
        password_hash: &str,
        role: UserRole,
    ) -> Result<Self, ApiError> {
        let user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
            VALUES ($1, $2, $3, $4::user_role, NOW(), NOW())
            RETURNING id, name, email, password_hash, role as "role: UserRole", created_at, updated_at
            "#,
            name,
            email,
            password_hash,
            role as UserRole
        )
        .fetch_one(pool)
        .await?;

        Ok(user)
    }
    
    /// Find user by ID
    pub async fn find_by_id(pool: &PgPool, id: i32) -> Result<Option<Self>, ApiError> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT id, name, email, password_hash, role as "role: UserRole", created_at, updated_at
            FROM users
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }
    
    /// Find user by email
    pub async fn find_by_email(pool: &PgPool, email: &str) -> Result<Option<Self>, ApiError> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT id, name, email, password_hash, role as "role: UserRole", created_at, updated_at
            FROM users
            WHERE email = $1
            "#,
            email
        )
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }
    
    /// Update user information
    pub async fn update(
        pool: &PgPool,
        id: i32,
        name: Option<&str>,
        email: Option<&str>,
        password_hash: Option<&str>,
        role: Option<UserRole>,
    ) -> Result<Option<Self>, ApiError> {
        let user = sqlx::query_as!(
            User,
            r#"
            UPDATE users 
            SET 
                name = COALESCE($2, name),
                email = COALESCE($3, email),
                password_hash = COALESCE($4, password_hash),
                role = COALESCE($5::user_role, role),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, email, password_hash, role as "role: UserRole", created_at, updated_at
            "#,
            id,
            name,
            email,
            password_hash,
            role as Option<UserRole>
        )
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }
    
    /// Delete user by ID
    pub async fn delete(pool: &PgPool, id: i32) -> Result<bool, ApiError> {
        let result = sqlx::query!(
            "DELETE FROM users WHERE id = $1",
            id
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
    
    /// List all users with pagination
    pub async fn list(
        pool: &PgPool,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Self>, ApiError> {
        let limit = limit.unwrap_or(50).min(100); // Max 100 users per request
        let offset = offset.unwrap_or(0);

        let users = sqlx::query_as!(
            User,
            r#"
            SELECT id, name, email, password_hash, role as "role: UserRole", created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit,
            offset
        )
        .fetch_all(pool)
        .await?;

        Ok(users)
    }
    
    /// Count total users
    pub async fn count(pool: &PgPool) -> Result<i64, ApiError> {
        let count = sqlx::query!(
            "SELECT COUNT(*) as count FROM users"
        )
        .fetch_one(pool)
        .await?;

        Ok(count.count.unwrap_or(0))
    }
    
    /// Search users by name or email
    pub async fn search(
        pool: &PgPool,
        query: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Self>, ApiError> {
        let limit = limit.unwrap_or(50).min(100);
        let offset = offset.unwrap_or(0);
        let search_pattern = format!("%{}%", query);

        let users = sqlx::query_as!(
            User,
            r#"
            SELECT id, name, email, password_hash, role as "role: UserRole", created_at, updated_at
            FROM users
            WHERE name ILIKE $1 OR email ILIKE $1
            ORDER BY 
                CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
                name
            LIMIT $2 OFFSET $3
            "#,
            search_pattern,
            limit,
            offset
        )
        .fetch_all(pool)
        .await?;

        Ok(users)
    }
}