use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};

fn handle_client(mut stream: TcpStream) {
    let mut buffer = [0; 4096];
    stream.read(&mut buffer).unwrap();
    
    let request = String::from_utf8_lossy(&buffer[..]);
    let path = request.lines().next().unwrap_or("");
    
    println!("Request line: '{}'", path);
    
    let (status, content_type, body) = if path.contains("/uploads/") {
        println!("MATCHED UPLOADS!");
        ("200 OK", "image/svg+xml", "<svg><circle cx='50' cy='50' r='40' fill='red'/></svg>".to_string())
    } else if path.contains("/default-avatar.png") {
        println!("MATCHED DEFAULT AVATAR!");
        ("200 OK", "image/svg+xml", "<svg><circle cx='50' cy='50' r='40' fill='blue'/></svg>".to_string())
    } else {
        println!("NO MATCH: '{}'", path);
        ("404 Not Found", "application/json", r#"{"error":"Not found"}"#.to_string())
    };
    
    let response = format!(
        "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type, Authorization\r\n\r\n{}",
        status, content_type, body.len(), body
    );
    
    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn main() {
    println!("🚀 Test server on port 8180");
    
    let listener = TcpListener::bind("0.0.0.0:8180").unwrap();
    println!("📡 Listening on http://0.0.0.0:8180");
    
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_client(stream);
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }
    }
}