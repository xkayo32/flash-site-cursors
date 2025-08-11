import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Settings file path
const settingsPath = path.join(__dirname, '../../data/settings.json');

// Ensure data directory exists
const dataDir = path.dirname(settingsPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default settings
const defaultSettings = {
  general: {
    site_name: 'StudyPro',
    site_tagline: 'Sua aprovação começa aqui',
    site_description: 'A plataforma mais completa para concursos públicos',
    site_keywords: '',
    maintenance_mode: false
  },
  company: {
    company_name: 'StudyPro Educação Ltda',
    company_cnpj: '00.000.000/0001-00',
    company_address: 'Rua Principal, 123 - Centro',
    company_city: 'São Paulo',
    company_state: 'SP',
    company_zip: '01000-000',
    company_phone: '(11) 1234-5678',
    company_email: 'contato@studypro.com',
    company_whatsapp: '(11) 91234-5678'
  },
  brand: {
    brand_primary_color: 'rgb(250, 204, 21)',
    brand_secondary_color: 'rgb(20, 36, 47)',
    brand_logo_light: '/logo.png',
    brand_logo_dark: '/logo.png',
    brand_favicon: '/logo.png',
    brand_font_primary: '',
    brand_font_secondary: ''
  },
  social: {
    facebook: 'https://facebook.com/studypro',
    instagram: 'https://instagram.com/studypro',
    twitter: 'https://twitter.com/studypro',
    linkedin: 'https://linkedin.com/company/studypro',
    youtube: 'https://youtube.com/studypro'
  }
};

// Initialize settings file if it doesn't exist
if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
}

// Get settings
router.get('/', optionalAuth, (_req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    res.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    res.json(defaultSettings);
  }
});

// Update settings
router.post('/', optionalAuth, (req, res) => {
  try {
    const currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const updatedSettings = { ...currentSettings, ...req.body };
    
    // Deep merge for nested objects
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
        updatedSettings[key] = { ...currentSettings[key], ...req.body[key] };
      }
    });
    
    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));
    
    res.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar configurações'
    });
  }
});

// Update settings (PUT for compatibility)
router.put('/', optionalAuth, (req, res) => {
  // Redirect to POST handler
  router.stack[0].handle(req, res, () => {});
});

export default router;