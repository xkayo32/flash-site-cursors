use figment::{Figment, providers::{Env, Format, Toml}};
use serde::Deserialize;
use std::net::SocketAddr;

#[derive(Debug, Clone, Deserialize)]
pub struct AppConfig {
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_host")]
    pub host: String,
    #[serde(default = "default_environment")]
    pub environment: String,
    pub jwt_secret: String,
    #[serde(default = "default_cors_origins")]
    pub cors_origins: Vec<String>,
    #[serde(default = "default_log_level")]
    pub log_level: String,
}

fn default_port() -> u16 {
    8180
}

fn default_host() -> String {
    "0.0.0.0".to_string()
}

fn default_environment() -> String {
    "development".to_string()
}

fn default_cors_origins() -> Vec<String> {
    vec![
        "http://localhost:5173".to_string(),
        "http://localhost:5273".to_string(),
        "http://localhost:3000".to_string(),
    ]
}

fn default_log_level() -> String {
    "info".to_string()
}

impl AppConfig {
    pub fn from_env() -> Result<Self, figment::Error> {
        Figment::new()
            .merge(Toml::file("config.toml"))
            .merge(Env::raw())
            .extract()
    }

    pub fn socket_addr(&self) -> Result<SocketAddr, std::net::AddrParseError> {
        format!("{}:{}", self.host, self.port).parse()
    }

    pub fn is_development(&self) -> bool {
        self.environment.to_lowercase() == "development"
    }

    pub fn is_production(&self) -> bool {
        self.environment.to_lowercase() == "production"
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            port: default_port(),
            host: default_host(),
            environment: default_environment(),
            jwt_secret: "your-secret-key-change-in-production".to_string(),
            cors_origins: default_cors_origins(),
            log_level: default_log_level(),
        }
    }
}