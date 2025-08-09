-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text', -- text, json, boolean, number, color, file
    category VARCHAR(50) DEFAULT 'general', -- general, company, brand, appearance, email, payment
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- if true, can be accessed without authentication
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER settings_updated_at_trigger
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
-- General Settings
('site_name', 'StudyPro', 'text', 'general', 'Nome do sistema', true),
('site_tagline', 'Sua aprovação começa aqui', 'text', 'general', 'Slogan do sistema', true),
('site_description', 'A plataforma mais completa para concursos públicos', 'text', 'general', 'Descrição do sistema', true),
('site_keywords', 'concursos, questões, flashcards, simulados, estudo', 'text', 'general', 'Palavras-chave para SEO', false),
('maintenance_mode', 'false', 'boolean', 'general', 'Modo de manutenção', false),

-- Company Settings
('company_name', 'StudyPro Educação Ltda', 'text', 'company', 'Nome da empresa', true),
('company_cnpj', '00.000.000/0001-00', 'text', 'company', 'CNPJ da empresa', false),
('company_address', 'Rua Principal, 123 - Centro', 'text', 'company', 'Endereço da empresa', true),
('company_city', 'São Paulo', 'text', 'company', 'Cidade', true),
('company_state', 'SP', 'text', 'company', 'Estado', true),
('company_zip', '01000-000', 'text', 'company', 'CEP', true),
('company_phone', '(11) 1234-5678', 'text', 'company', 'Telefone', true),
('company_email', 'contato@studypro.com', 'text', 'company', 'Email de contato', true),
('company_whatsapp', '(11) 91234-5678', 'text', 'company', 'WhatsApp', true),

-- Brand Settings
('brand_primary_color', '#facc15', 'color', 'brand', 'Cor primária (accent)', false),
('brand_secondary_color', '#14242f', 'color', 'brand', 'Cor secundária (military base)', false),
('brand_logo_light', '/logo.png', 'file', 'brand', 'Logo para tema claro', true),
('brand_logo_dark', '/logo.png', 'file', 'brand', 'Logo para tema escuro', true),
('brand_favicon', '/logo.png', 'file', 'brand', 'Favicon', true),
('brand_font_primary', 'Orbitron', 'text', 'brand', 'Fonte principal (títulos)', false),
('brand_font_secondary', 'Rajdhani', 'text', 'brand', 'Fonte secundária (corpo)', false),

-- Email Settings
('email_from_name', 'StudyPro', 'text', 'email', 'Nome do remetente', false),
('email_from_address', 'noreply@studypro.com', 'text', 'email', 'Email do remetente', false),
('email_smtp_host', 'smtp.gmail.com', 'text', 'email', 'Servidor SMTP', false),
('email_smtp_port', '587', 'number', 'email', 'Porta SMTP', false),
('email_smtp_username', '', 'text', 'email', 'Usuário SMTP', false),
('email_smtp_password', '', 'text', 'email', 'Senha SMTP', false),
('email_smtp_encryption', 'tls', 'text', 'email', 'Criptografia (tls/ssl)', false),

-- Payment Settings
('payment_gateway', 'stripe', 'text', 'payment', 'Gateway de pagamento', false),
('stripe_publishable_key', 'pk_test_', 'text', 'payment', 'Chave pública Stripe', false),
('stripe_secret_key', 'sk_test_', 'text', 'payment', 'Chave secreta Stripe', false),
('currency', 'BRL', 'text', 'payment', 'Moeda padrão', false),
('currency_symbol', 'R$', 'text', 'payment', 'Símbolo da moeda', true),

-- Social Media
('social_facebook', 'https://facebook.com/studypro', 'text', 'social', 'Facebook URL', true),
('social_instagram', 'https://instagram.com/studypro', 'text', 'social', 'Instagram URL', true),
('social_twitter', 'https://twitter.com/studypro', 'text', 'social', 'Twitter URL', true),
('social_linkedin', 'https://linkedin.com/company/studypro', 'text', 'social', 'LinkedIn URL', true),
('social_youtube', 'https://youtube.com/studypro', 'text', 'social', 'YouTube URL', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_public ON system_settings(is_public);

-- Create a view for public settings
CREATE OR REPLACE VIEW public_settings AS
SELECT setting_key, setting_value, setting_type, category
FROM system_settings
WHERE is_public = true;

-- Grant permissions
GRANT SELECT ON public_settings TO estudos_user;
GRANT ALL ON system_settings TO estudos_user;
GRANT USAGE, SELECT ON SEQUENCE system_settings_id_seq TO estudos_user;