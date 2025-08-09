use warp::Filter;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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

#[derive(Debug, Serialize, Clone)]
struct User {
    id: i32,
    name: String,
    email: String,
    role: String,
}

#[derive(Debug, Serialize)]
struct Course {
    id: i32,
    title: String,
    description: String,
    price: f64,
    instructor: String,
}

#[tokio::main]
async fn main() {
    println!("🚀 Starting Estudos Backend (Warp) on port 8180");

    // Root endpoint
    let root = warp::path::end()
        .map(|| {
            warp::reply::json(&serde_json::json!({
                "service": "estudos-backend-rust",
                "version": "0.1.0-warp",
                "status": "running",
                "endpoints": {
                    "health": "/api/v1/health",
                    "auth": {
                        "login": "/api/v1/auth/login",
                        "register": "/api/v1/auth/register"
                    },
                    "courses": "/api/v1/courses"
                }
            }))
        });

    // Health check
    let health = warp::path!("api" / "v1" / "health")
        .map(|| {
            warp::reply::json(&serde_json::json!({
                "status": "healthy",
                "service": "estudos-backend-rust"
            }))
        });

    // Simple health
    let health_simple = warp::path!("api" / "v1" / "health" / "simple")
        .map(|| "OK");

    // Login endpoint
    let login = warp::path!("api" / "v1" / "auth" / "login")
        .and(warp::post())
        .and(warp::body::json())
        .map(|body: LoginRequest| {
            if body.email == "admin@studypro.com" && body.password == "Admin@123" {
                warp::reply::json(&LoginResponse {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_admin_token".to_string(),
                    user: User {
                        id: 1,
                        name: "Admin User".to_string(),
                        email: body.email,
                        role: "admin".to_string(),
                    },
                })
            } else if body.email == "aluno@example.com" && body.password == "aluno123" {
                warp::reply::json(&LoginResponse {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_student_token".to_string(),
                    user: User {
                        id: 2,
                        name: "Aluno Teste".to_string(),
                        email: body.email,
                        role: "student".to_string(),
                    },
                })
            } else {
                warp::reply::json(&serde_json::json!({
                    "error": "Invalid credentials"
                }))
            }
        });

    // Register endpoint
    let register = warp::path!("api" / "v1" / "auth" / "register")
        .and(warp::post())
        .and(warp::body::json())
        .map(|body: HashMap<String, String>| {
            warp::reply::json(&serde_json::json!({
                "success": true,
                "message": "User registered successfully",
                "user": {
                    "id": 3,
                    "name": body.get("name").unwrap_or(&"New User".to_string()),
                    "email": body.get("email").unwrap_or(&"user@example.com".to_string()),
                    "role": "student"
                }
            }))
        });

    // Logout endpoint
    let logout = warp::path!("api" / "v1" / "auth" / "logout")
        .and(warp::post())
        .map(|| {
            warp::reply::json(&serde_json::json!({
                "success": true,
                "message": "Logged out successfully"
            }))
        });

    // Verify endpoint
    let verify = warp::path!("api" / "v1" / "auth" / "verify")
        .map(|| {
            warp::reply::json(&serde_json::json!({
                "valid": true,
                "user": {
                    "id": 1,
                    "name": "Admin User",
                    "email": "admin@studypro.com",
                    "role": "admin"
                }
            }))
        });

    // List courses
    let courses = warp::path!("api" / "v1" / "courses")
        .map(|| {
            let courses = vec![
                Course {
                    id: 1,
                    title: "Direito Constitucional".to_string(),
                    description: "Curso completo de Direito Constitucional".to_string(),
                    price: 297.00,
                    instructor: "Prof. Silva".to_string(),
                },
                Course {
                    id: 2,
                    title: "Português para Concursos".to_string(),
                    description: "Gramática, interpretação e redação".to_string(),
                    price: 197.00,
                    instructor: "Prof. Santos".to_string(),
                }
            ];
            warp::reply::json(&courses)
        });

    // List users
    let users = warp::path!("api" / "v1" / "users")
        .map(|| {
            let users = vec![
                User {
                    id: 1,
                    name: "Admin User".to_string(),
                    email: "admin@studypro.com".to_string(),
                    role: "admin".to_string(),
                },
                User {
                    id: 2,
                    name: "Aluno Teste".to_string(),
                    email: "aluno@example.com".to_string(),
                    role: "student".to_string(),
                }
            ];
            warp::reply::json(&users)
        });

    // CORS configuration
    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
        .allow_headers(vec!["Content-Type", "Authorization"]);

    // Combine all routes
    let routes = root
        .or(health)
        .or(health_simple)
        .or(login)
        .or(register)
        .or(logout)
        .or(verify)
        .or(courses)
        .or(users)
        .with(cors);

    println!("📡 Server listening on http://0.0.0.0:8180");
    
    // Start server
    warp::serve(routes)
        .run(([0, 0, 0, 0], 8180))
        .await;
}