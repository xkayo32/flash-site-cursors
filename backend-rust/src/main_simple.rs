use axum::{
    routing::{get, post},
    Router,
    Json,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::net::SocketAddr;

#[derive(Debug, Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Debug, Serialize)]
struct LoginResponse {
    token: String,
    user: User,
}

#[derive(Debug, Serialize)]
struct User {
    id: i32,
    name: String,
    email: String,
    role: String,
}

#[tokio::main]
async fn main() {
    println!("🚀 Starting Estudos Backend Rust (Simplified)");
    
    // Build routes
    let app = Router::new()
        .route("/", get(root))
        .route("/api/v1/health", get(health))
        .route("/api/v1/health/simple", get(health_simple))
        .route("/api/v1/auth/login", post(login))
        .route("/api/v1/auth/register", post(register))
        .route("/api/v1/auth/logout", post(logout))
        .route("/api/v1/auth/verify", get(verify))
        .route("/api/v1/courses", get(list_courses))
        .route("/api/v1/users", get(list_users));

    // Bind to address
    let addr = SocketAddr::from(([0, 0, 0, 0], 8180));
    println!("📡 Listening on http://{}", addr);
    
    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> Json<serde_json::Value> {
    Json(json!({
        "service": "estudos-backend-rust",
        "version": "0.1.0-simplified",
        "status": "running",
        "endpoints": {
            "health": "/api/v1/health",
            "auth": {
                "login": "/api/v1/auth/login",
                "register": "/api/v1/auth/register",
                "logout": "/api/v1/auth/logout",
                "verify": "/api/v1/auth/verify"
            },
            "courses": "/api/v1/courses",
            "users": "/api/v1/users"
        }
    }))
}

async fn health() -> Json<serde_json::Value> {
    Json(json!({
        "status": "healthy",
        "service": "estudos-backend-rust",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn health_simple() -> &'static str {
    "OK"
}

async fn login(Json(payload): Json<LoginRequest>) -> Result<Json<LoginResponse>, StatusCode> {
    // Mock authentication - in production, verify against database
    if payload.email == "admin@studypro.com" && payload.password == "Admin@123" {
        Ok(Json(LoginResponse {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQHN0dWR5cHJvLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcwNDI0MDAwMH0.mock_signature".to_string(),
            user: User {
                id: 1,
                name: "Admin User".to_string(),
                email: payload.email,
                role: "admin".to_string(),
            },
        }))
    } else if payload.email == "aluno@example.com" && payload.password == "aluno123" {
        Ok(Json(LoginResponse {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6ImFsdW5vQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE3MDQyNDAwMDB9.mock_signature".to_string(),
            user: User {
                id: 2,
                name: "Aluno Teste".to_string(),
                email: payload.email,
                role: "student".to_string(),
            },
        }))
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

async fn register(Json(payload): Json<serde_json::Value>) -> Json<serde_json::Value> {
    // Mock registration
    Json(json!({
        "success": true,
        "message": "User registered successfully",
        "user": {
            "id": 3,
            "name": payload["name"],
            "email": payload["email"],
            "role": "student"
        }
    }))
}

async fn logout() -> Json<serde_json::Value> {
    Json(json!({
        "success": true,
        "message": "Logged out successfully"
    }))
}

async fn verify() -> Result<Json<serde_json::Value>, StatusCode> {
    // In production, verify JWT token from header
    Ok(Json(json!({
        "valid": true,
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@studypro.com",
            "role": "admin"
        }
    })))
}

async fn list_courses() -> Json<serde_json::Value> {
    // Mock course data
    Json(json!({
        "courses": [
            {
                "id": 1,
                "title": "Direito Constitucional",
                "description": "Curso completo de Direito Constitucional",
                "price": 297.00,
                "instructor": "Prof. Silva"
            },
            {
                "id": 2,
                "title": "Português para Concursos",
                "description": "Gramática, interpretação e redação",
                "price": 197.00,
                "instructor": "Prof. Santos"
            }
        ],
        "total": 2
    }))
}

async fn list_users() -> Json<serde_json::Value> {
    // Mock user data
    Json(json!({
        "users": [
            {
                "id": 1,
                "name": "Admin User",
                "email": "admin@studypro.com",
                "role": "admin"
            },
            {
                "id": 2,
                "name": "Aluno Teste",
                "email": "aluno@example.com",
                "role": "student"
            }
        ],
        "total": 2
    }))
}