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

#[derive(Clone)]
struct GeneralSettings {
    site_name: String,
    site_tagline: String,
    site_description: String,
    maintenance_mode: bool,
}

#[derive(Clone)]
struct CompanySettings {
    company_name: String,
    company_cnpj: String,
    company_address: String,
    company_city: String,
    company_state: String,
    company_zip: String,
    company_phone: String,
    company_email: String,
    company_whatsapp: String,
}

#[derive(Clone)]
struct BrandSettings {
    brand_primary_color: String,
    brand_secondary_color: String,
    brand_logo_light: String,
    brand_logo_dark: String,
    brand_favicon: String,
}

#[derive(Clone)]
struct SocialSettings {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
}

#[derive(Clone)]
struct SystemSettings {
    general: GeneralSettings,
    company: CompanySettings,
    brand: BrandSettings,
    social: SocialSettings,
}

impl UserProfile {
    fn to_json(&self) -> String {
        format!(
            r#"{{"id":{},"name":"{}","email":"{}","phone":"{}","bio":"{}","avatar":"{}","role":"{}","created_at":"2024-01-01T00:00:00Z","updated_at":"2024-01-01T00:00:00Z"}}"#,
            self.id, self.name, self.email, self.phone, self.bio, self.avatar, self.role
        )
    }
}

impl SystemSettings {
    fn to_json(&self) -> String {
        let json = format!(
            "{{\"general\":{{\"site_name\":\"{}\",\"site_tagline\":\"{}\",\"site_description\":\"{}\",\"maintenance_mode\":{}}},\"company\":{{\"company_name\":\"{}\",\"company_cnpj\":\"{}\",\"company_address\":\"{}\",\"company_city\":\"{}\",\"company_state\":\"{}\",\"company_zip\":\"{}\",\"company_phone\":\"{}\",\"company_email\":\"{}\",\"company_whatsapp\":\"{}\"}},\"brand\":{{\"brand_primary_color\":\"{}\",\"brand_secondary_color\":\"{}\",\"brand_logo_light\":\"{}\",\"brand_logo_dark\":\"{}\",\"brand_favicon\":\"{}\"}},\"social\":{{\"facebook\":\"{}\",\"instagram\":\"{}\",\"twitter\":\"{}\",\"linkedin\":\"{}\",\"youtube\":\"{}\"}}}}",
            self.general.site_name,
            self.general.site_tagline,
            self.general.site_description,
            self.general.maintenance_mode,
            self.company.company_name,
            self.company.company_cnpj,
            self.company.company_address,
            self.company.company_city,
            self.company.company_state,
            self.company.company_zip,
            self.company.company_phone,
            self.company.company_email,
            self.company.company_whatsapp,
            self.brand.brand_primary_color,
            self.brand.brand_secondary_color,
            self.brand.brand_logo_light,
            self.brand.brand_logo_dark,
            self.brand.brand_favicon,
            self.social.facebook,
            self.social.instagram,
            self.social.twitter,
            self.social.linkedin,
            self.social.youtube
        );
        json
    }
}

type ProfileStore = Arc<Mutex<UserProfile>>;
type SettingsStore = Arc<Mutex<SystemSettings>>;

// Helper function to extract JSON values
fn extract_json_value(body: &str, key: &str) -> Option<String> {
    if let Some(start) = body.find(key) {
        let value_start = start + key.len();
        if let Some(end) = body[value_start..].find('"') {
            return Some(body[value_start..value_start + end].to_string());
        }
    }
    None
}

fn handle_client(mut stream: TcpStream, profile_store: ProfileStore, settings_store: SettingsStore) {
    let mut buffer = [0; 4096];
    stream.read(&mut buffer).unwrap();
    
    let request = String::from_utf8_lossy(&buffer[..]);
    let path = request.lines().next().unwrap_or("");
    
    // Debug logging
    println!("Request line: '{}'", path);
    
    let (status, content_type, body) = if path.starts_with("OPTIONS") {
        // Handle CORS preflight requests for any OPTIONS request
        println!("Matched OPTIONS preflight");
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
        // Return current settings from store
        let settings = settings_store.lock().unwrap();
        let json = settings.to_json();
        drop(settings);
        ("200 OK", "application/json", json)
    } else if path.contains("PUT /api/v1/settings") || path.contains("POST /api/v1/settings") {
        // Update settings with real data parsing
        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
        let body = &request[body_start..];
        println!("Settings update received: {}", body);
        
        let mut settings = settings_store.lock().unwrap();
        
        // Parse and update general settings
        if body.contains(r#""general":"#) {
            if let Some(site_name) = extract_json_value(body, r#""site_name":""#) {
                println!("Updated site_name to: {}", site_name);
                settings.general.site_name = site_name;
            }
            if let Some(site_tagline) = extract_json_value(body, r#""site_tagline":""#) {
                settings.general.site_tagline = site_tagline;
            }
            if let Some(site_description) = extract_json_value(body, r#""site_description":""#) {
                settings.general.site_description = site_description;
            }
            if body.contains(r#""maintenance_mode":true"#) {
                settings.general.maintenance_mode = true;
            } else if body.contains(r#""maintenance_mode":false"#) {
                settings.general.maintenance_mode = false;
            }
        }
        
        // Parse and update company settings
        if body.contains(r#""company":"#) {
            if let Some(company_name) = extract_json_value(body, r#""company_name":""#) {
                settings.company.company_name = company_name;
            }
            if let Some(company_cnpj) = extract_json_value(body, r#""company_cnpj":""#) {
                settings.company.company_cnpj = company_cnpj;
            }
            if let Some(company_address) = extract_json_value(body, r#""company_address":""#) {
                settings.company.company_address = company_address;
            }
            if let Some(company_city) = extract_json_value(body, r#""company_city":""#) {
                settings.company.company_city = company_city;
            }
            if let Some(company_state) = extract_json_value(body, r#""company_state":""#) {
                settings.company.company_state = company_state;
            }
            if let Some(company_zip) = extract_json_value(body, r#""company_zip":""#) {
                settings.company.company_zip = company_zip;
            }
            if let Some(company_phone) = extract_json_value(body, r#""company_phone":""#) {
                settings.company.company_phone = company_phone;
            }
            if let Some(company_email) = extract_json_value(body, r#""company_email":""#) {
                settings.company.company_email = company_email;
            }
            if let Some(company_whatsapp) = extract_json_value(body, r#""company_whatsapp":""#) {
                settings.company.company_whatsapp = company_whatsapp;
            }
        }
        
        // Parse and update brand settings
        if body.contains(r#""brand":"#) {
            if let Some(brand_primary_color) = extract_json_value(body, r#""brand_primary_color":""#) {
                settings.brand.brand_primary_color = brand_primary_color;
            }
            if let Some(brand_secondary_color) = extract_json_value(body, r#""brand_secondary_color":""#) {
                settings.brand.brand_secondary_color = brand_secondary_color;
            }
            if let Some(brand_logo_light) = extract_json_value(body, r#""brand_logo_light":""#) {
                settings.brand.brand_logo_light = brand_logo_light;
            }
            if let Some(brand_logo_dark) = extract_json_value(body, r#""brand_logo_dark":""#) {
                settings.brand.brand_logo_dark = brand_logo_dark;
            }
            if let Some(brand_favicon) = extract_json_value(body, r#""brand_favicon":""#) {
                settings.brand.brand_favicon = brand_favicon;
            }
        }
        
        // Parse and update social settings
        if body.contains(r#""social":"#) {
            if let Some(facebook) = extract_json_value(body, r#""facebook":""#) {
                settings.social.facebook = facebook;
            }
            if let Some(instagram) = extract_json_value(body, r#""instagram":""#) {
                settings.social.instagram = instagram;
            }
            if let Some(twitter) = extract_json_value(body, r#""twitter":""#) {
                settings.social.twitter = twitter;
            }
            if let Some(linkedin) = extract_json_value(body, r#""linkedin":""#) {
                settings.social.linkedin = linkedin;
            }
            if let Some(youtube) = extract_json_value(body, r#""youtube":""#) {
                settings.social.youtube = youtube;
            }
        }
        
        drop(settings);
        
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
        println!("No match found for path: '{}'", path);
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
    
    // Initialize default settings
    let default_settings = SystemSettings {
        general: GeneralSettings {
            site_name: "StudyPro".to_string(),
            site_tagline: "Sua aprovação começa aqui".to_string(),
            site_description: "A plataforma mais completa para concursos públicos".to_string(),
            maintenance_mode: false,
        },
        company: CompanySettings {
            company_name: "StudyPro Educação Ltda".to_string(),
            company_cnpj: "00.000.000/0001-00".to_string(),
            company_address: "Rua Principal, 123 - Centro".to_string(),
            company_city: "São Paulo".to_string(),
            company_state: "SP".to_string(),
            company_zip: "01000-000".to_string(),
            company_phone: "(11) 1234-5678".to_string(),
            company_email: "contato@studypro.com".to_string(),
            company_whatsapp: "(11) 91234-5678".to_string(),
        },
        brand: BrandSettings {
            brand_primary_color: "rgb(250, 204, 21)".to_string(),
            brand_secondary_color: "rgb(20, 36, 47)".to_string(),
            brand_logo_light: "/logo.png".to_string(),
            brand_logo_dark: "/logo.png".to_string(),
            brand_favicon: "/logo.png".to_string(),
        },
        social: SocialSettings {
            facebook: "https://facebook.com/studypro".to_string(),
            instagram: "https://instagram.com/studypro".to_string(),
            twitter: "https://twitter.com/studypro".to_string(),
            linkedin: "https://linkedin.com/company/studypro".to_string(),
            youtube: "https://youtube.com/studypro".to_string(),
        },
    };
    
    let profile_store: ProfileStore = Arc::new(Mutex::new(default_profile));
    let settings_store: SettingsStore = Arc::new(Mutex::new(default_settings));
    
    let listener = TcpListener::bind("0.0.0.0:8180").unwrap();
    println!("📡 Server listening on http://0.0.0.0:8180");
    
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                let profile_clone = Arc::clone(&profile_store);
                let settings_clone = Arc::clone(&settings_store);
                thread::spawn(move || {
                    handle_client(stream, profile_clone, settings_clone);
                });
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }
    }
}