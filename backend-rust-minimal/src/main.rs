use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
struct UserProfile {
    id: i32,
    name: String,
    email: String,
    phone: String,
    bio: String,
    avatar: String,
    role: String,
}

impl UserProfile {
    fn to_json(&self) -> String {
        format!(
            r#"{{"id":{},"name":"{}","email":"{}","phone":"{}","bio":"{}","avatar":"{}","role":"{}","created_at":"2024-01-01T00:00:00Z","updated_at":"2024-01-01T00:00:00Z"}}"#,
            self.id, self.name, self.email, self.phone, self.bio, self.avatar, self.role
        )
    }
}

type ProfileStore = Arc<Mutex<UserProfile>>;

fn handle_client(mut stream: TcpStream, profile_store: ProfileStore) {
    let mut buffer = [0; 4096];
    stream.read(&mut buffer).unwrap();
    
    let request = String::from_utf8_lossy(&buffer[..]);
    let path = request.lines().next().unwrap_or("");
    
    // Debug logging
    println!("Request line: '{}'", path);
    
    let (status, content_type, body) = if path.starts_with("OPTIONS") {
        // Handle CORS preflight requests for any OPTIONS request
        ("200 OK", "text/plain", "".to_string())
    } else if path.contains("OPTIONS") {
        // Fallback for any other OPTIONS variation
        ("200 OK", "text/plain", "".to_string())
    } else if path.contains("GET / ") {
        ("200 OK", "application/json", r#"{"service":"estudos-backend-rust","version":"0.1.0-minimal","status":"running","endpoints":{"/api/v1/health":"Health check","/api/v1/auth/login":"Login endpoint","/api/v1/settings":"Settings management"}}"#.to_string())
    } else if path.contains("GET /api/v1/health") {
        ("200 OK", "application/json", r#"{"status":"healthy","service":"estudos-backend-rust"}"#.to_string())
    } else if path.contains("GET /api/v1/health/simple") {
        ("200 OK", "text/plain", "OK".to_string())
    } else if path.contains("POST /api/v1/auth/login") {
        // Parse JSON body to check credentials
        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
        let body = &request[body_start..];
        
        if body.contains(r#""email":"admin@studypro.com"#) && body.contains(r#""password":"Admin@123"#) {
            ("200 OK", "application/json", r#"{"success":true,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_admin","user":{"id":1,"name":"Admin User","email":"admin@studypro.com","role":"admin"}}"#.to_string())
        } else if body.contains(r#""email":"aluno@example.com"#) && body.contains(r#""password":"aluno123"#) {
            ("200 OK", "application/json", r#"{"success":true,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_student","user":{"id":2,"name":"Aluno Teste","email":"aluno@example.com","role":"student"}}"#.to_string())
        } else {
            ("200 OK", "application/json", r#"{"success":false,"message":"Email ou senha incorretos. Por favor, verifique suas credenciais."}"#.to_string())
        }
    } else if path.contains("POST /api/v1/auth/register") {
        ("200 OK", "application/json", r#"{"success":true,"message":"User registered successfully","user":{"id":3,"name":"New User","email":"user@example.com","role":"student"}}"#.to_string())
    } else if path.contains("POST /api/v1/auth/logout") {
        ("200 OK", "application/json", r#"{"success":true,"message":"Logged out successfully"}"#.to_string())
    } else if path.contains("GET /api/v1/auth/verify") {
        ("200 OK", "application/json", r#"{"valid":true,"user":{"id":1,"name":"Admin User","email":"admin@studypro.com","role":"admin"}}"#.to_string())
    } else if path.contains("GET /api/v1/courses") {
        ("200 OK", "application/json", r#"[{"id":1,"title":"Direito Constitucional","description":"Curso completo","price":297.00,"instructor":"Prof. Silva"},{"id":2,"title":"Português para Concursos","description":"Gramática e redação","price":197.00,"instructor":"Prof. Santos"}]"#.to_string())
    } else if path.contains("GET /api/v1/users") {
        ("200 OK", "application/json", r#"[{"id":1,"name":"Admin User","email":"admin@studypro.com","role":"admin"},{"id":2,"name":"Aluno Teste","email":"aluno@example.com","role":"student"}]"#.to_string())
    } else if path.contains("GET /api/v1/settings") {
        // Return settings - simplified without problematic characters
        ("200 OK", "application/json", r#"{"general":{"site_name":"StudyPro","site_tagline":"Sua aprovação começa aqui","site_description":"A plataforma mais completa para concursos públicos","maintenance_mode":false},"company":{"company_name":"StudyPro Educação Ltda","company_cnpj":"00.000.000/0001-00","company_address":"Rua Principal, 123 - Centro","company_city":"São Paulo","company_state":"SP","company_zip":"01000-000","company_phone":"(11) 1234-5678","company_email":"contato@studypro.com","company_whatsapp":"(11) 91234-5678"},"brand":{"brand_primary_color":"rgb(250, 204, 21)","brand_secondary_color":"rgb(20, 36, 47)","brand_logo_light":"/logo.png","brand_logo_dark":"/logo.png","brand_favicon":"/logo.png"},"social":{"facebook":"https://facebook.com/studypro","instagram":"https://instagram.com/studypro","twitter":"https://twitter.com/studypro","linkedin":"https://linkedin.com/company/studypro","youtube":"https://youtube.com/studypro"}}"#.to_string())
    } else if path.contains("PUT /api/v1/settings") || path.contains("POST /api/v1/settings") {
        // Save settings (mock response)
        println!("Settings update received");
        ("200 OK", "application/json", r#"{"success":true,"message":"Configurações salvas com sucesso"}"#.to_string())
    } else if path.contains("POST /api/v1/settings/logo") {
        // Upload logo (mock response)
        println!("Logo upload received");
        ("200 OK", "application/json", r#"{"success":true,"url":"/uploads/logo-new.png","message":"Logo atualizada com sucesso"}"#.to_string())
    } else if path.contains("/uploads/") || path.contains("/default-avatar.png") {
        // Serve static files FIRST - must come before profile avatar upload
        println!("Static file requested: {}", path);
        
        // Return a simple SVG avatar as placeholder
        let svg_avatar = "<svg width=\"150\" height=\"150\" viewBox=\"0 0 150 150\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\
            <circle cx=\"75\" cy=\"75\" r=\"75\" fill=\"gray\"/>\
            <circle cx=\"75\" cy=\"60\" r=\"25\" fill=\"white\"/>\
            <path d=\"M75 95c-20 0-35 10-35 25v30h70v-30c0-15-15-25-35-25z\" fill=\"white\"/>\
        </svg>";
        
        ("200 OK", "image/svg+xml", svg_avatar.to_string())
    } else if path.contains("POST /api/v1/profile/avatar") {
        // Upload avatar and update profile
        println!("Avatar upload received");
        
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let new_avatar_url = format!("/uploads/avatars/avatar-{}.jpg", timestamp);
        
        // Update avatar in profile store
        let mut profile = profile_store.lock().unwrap();
        profile.avatar = new_avatar_url.clone();
        println!("Updated avatar to: {}", new_avatar_url);
        drop(profile);
        
        let response_json = format!(
            r#"{{"success":true,"url":"{}","message":"Avatar atualizado com sucesso"}}"#,
            new_avatar_url
        );
        
        ("200 OK", "application/json", response_json)
    } else if path.contains("GET /api/v1/profile") {
        // Return current user profile
        let profile = profile_store.lock().unwrap();
        let json = profile.to_json();
        drop(profile);
        ("200 OK", "application/json", json)
    } else if path.contains("PUT /api/v1/profile") || path.contains("POST /api/v1/profile") {
        // Update user profile with real data parsing
        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
        let body = &request[body_start..];
        println!("Profile update received: {}", body);
        
        let mut profile = profile_store.lock().unwrap();
        
        // Simple JSON parsing (basic implementation)
        if body.contains(r#""name":"#) {
            if let Some(start) = body.find(r#""name":""#) {
                if let Some(end) = body[start + 8..].find('"') {
                    let name = &body[start + 8..start + 8 + end];
                    profile.name = name.to_string();
                    println!("Updated name to: {}", name);
                }
            }
        }
        
        if body.contains(r#""email":"#) {
            if let Some(start) = body.find(r#""email":""#) {
                if let Some(end) = body[start + 9..].find('"') {
                    let email = &body[start + 9..start + 9 + end];
                    profile.email = email.to_string();
                    println!("Updated email to: {}", email);
                }
            }
        }
        
        if body.contains(r#""phone":"#) {
            if let Some(start) = body.find(r#""phone":""#) {
                if let Some(end) = body[start + 9..].find('"') {
                    let phone = &body[start + 9..start + 9 + end];
                    profile.phone = phone.to_string();
                    println!("Updated phone to: {}", phone);
                }
            }
        }
        
        if body.contains(r#""bio":"#) {
            if let Some(start) = body.find(r#""bio":""#) {
                if let Some(end) = body[start + 7..].find('"') {
                    let bio = &body[start + 7..start + 7 + end];
                    profile.bio = bio.to_string();
                    println!("Updated bio to: {}", bio);
                }
            }
        }
        
        let updated_profile = profile.clone();
        drop(profile);
        
        let response_json = format!(
            r#"{{"success":true,"message":"Perfil atualizado com sucesso","profile":{}}}"#,
            updated_profile.to_json()
        );
        
        ("200 OK", "application/json", response_json)
    } else {
        ("404 Not Found", "application/json", r#"{"error":"Endpoint not found"}"#.to_string())
    };
    
    let response = format!(
        "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type, Authorization\r\n\r\n{}",
        status,
        content_type,
        body.len(),
        body
    );
    
    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn main() {
    println!("🚀 Starting Estudos Backend Rust (Minimal) on port 8180");
    
    // Initialize default profile
    let default_profile = UserProfile {
        id: 1,
        name: "Admin User".to_string(),
        email: "admin@studypro.com".to_string(),
        phone: "(11) 98765-4321".to_string(),
        bio: "Administrador do sistema StudyPro".to_string(),
        avatar: "/uploads/avatars/admin-avatar.jpg".to_string(),
        role: "admin".to_string(),
    };
    
    let profile_store: ProfileStore = Arc::new(Mutex::new(default_profile));
    
    let listener = TcpListener::bind("0.0.0.0:8180").unwrap();
    println!("📡 Server listening on http://0.0.0.0:8180");
    
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                let store_clone = Arc::clone(&profile_store);
                thread::spawn(move || {
                    handle_client(stream, store_clone);
                });
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }
    }
}