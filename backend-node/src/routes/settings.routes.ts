import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { optionalAuth, requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Settings file paths
const settingsPath = path.join(__dirname, '../../data/settings.json');
const userSettingsPath = path.join(__dirname, '../../../user_settings.json');
const usersPath = path.join(__dirname, '../../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(settingsPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure user settings file exists
if (!fs.existsSync(userSettingsPath)) {
  fs.writeFileSync(userSettingsPath, JSON.stringify({}, null, 2));
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

// Get user settings
router.get('/user', requireAuth, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    let userSettings = {};
    if (fs.existsSync(userSettingsPath)) {
      const allUserSettings = JSON.parse(fs.readFileSync(userSettingsPath, 'utf-8'));
      userSettings = allUserSettings[userId] || {};
    }

    // Default user settings
    const defaultUserSettings = {
      profile: {
        name: req.user?.name || '',
        email: req.user?.email || '',
        phone: '',
        avatar: ''
      },
      notifications: {
        'study-reminders': {
          enabled: true,
          channels: { email: true, push: true, sms: false }
        },
        'new-content': {
          enabled: true,
          channels: { email: true, push: false, sms: false }
        },
        'achievements': {
          enabled: true,
          channels: { email: false, push: true, sms: false }
        },
        'marketing': {
          enabled: false,
          channels: { email: false, push: false, sms: false }
        }
      },
      privacy: {
        'profile-visibility': false,
        'ranking-participation': true,
        'study-data-sharing': true
      },
      appearance: {
        theme: 'system',
        compactMode: false,
        stealthMode: false,
        animations: true
      },
      study: {
        dailyTimeGoal: 120,
        dailyCardsGoal: 50,
        autoReview: true,
        intensiveMode: false,
        focusMode: true
      }
    };

    const mergedSettings = {
      ...defaultUserSettings,
      ...userSettings,
      profile: {
        ...defaultUserSettings.profile,
        ...(userSettings as any)?.profile
      },
      notifications: {
        ...defaultUserSettings.notifications,
        ...(userSettings as any)?.notifications
      },
      privacy: {
        ...defaultUserSettings.privacy,
        ...(userSettings as any)?.privacy
      },
      appearance: {
        ...defaultUserSettings.appearance,
        ...(userSettings as any)?.appearance
      },
      study: {
        ...defaultUserSettings.study,
        ...(userSettings as any)?.study
      }
    };

    res.json({ success: true, settings: mergedSettings });
  } catch (error) {
    console.error('Error reading user settings:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar configurações' });
  }
});

// Save user settings
router.put('/user', requireAuth, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    // Validate that body has data
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma configuração fornecida' 
      });
    }

    let allUserSettings = {};
    if (fs.existsSync(userSettingsPath)) {
      allUserSettings = JSON.parse(fs.readFileSync(userSettingsPath, 'utf-8'));
    }

    const currentUserSettings = (allUserSettings as any)[userId] || {};
    const updatedUserSettings = {
      ...currentUserSettings,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    (allUserSettings as any)[userId] = updatedUserSettings;
    fs.writeFileSync(userSettingsPath, JSON.stringify(allUserSettings, null, 2));

    // Update user profile data if provided
    // Comentado temporariamente devido a problemas de permissão
    /*
    if (req.body.profile) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1 && req.body.profile.name) {
        users[userIndex].name = req.body.profile.name;
        users[userIndex].updatedAt = new Date().toISOString();
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      }
    }
    */

    res.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      settings: updatedUserSettings
    });
  } catch (error) {
    console.error('Error saving user settings:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar configurações' });
  }
});

// Update notifications settings
router.put('/notifications', requireAuth, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    let allUserSettings = {};
    if (fs.existsSync(userSettingsPath)) {
      allUserSettings = JSON.parse(fs.readFileSync(userSettingsPath, 'utf-8'));
    }

    const currentSettings = (allUserSettings as any)[userId] || {};
    currentSettings.notifications = {
      ...currentSettings.notifications,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    (allUserSettings as any)[userId] = currentSettings;
    fs.writeFileSync(userSettingsPath, JSON.stringify(allUserSettings, null, 2));

    res.json({
      success: true,
      message: 'Configurações de notificação atualizadas',
      notifications: currentSettings.notifications
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar notificações' });
  }
});

// Change password
router.put('/password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nova senha e confirmação não conferem' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nova senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Get user and verify current password
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Senha atual incorreta' 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const userIndex = users.findIndex((u: any) => u.id === userId);
    users[userIndex].password = hashedNewPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Erro ao alterar senha' });
  }
});

// Logo upload endpoint
router.post('/logo', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem fazer upload de logo' 
      });
    }

    // For now, we'll just accept the logo data and save the path
    // In a real implementation, you would handle file upload with multer
    const { type, data } = req.body; // type: 'light' | 'dark', data: base64 or url
    
    if (!type || !data) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo e dados da logo são obrigatórios' 
      });
    }

    // Read current settings
    let settings = defaultSettings;
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }

    // Update logo path based on type
    if (type === 'light') {
      settings.brand.brand_logo_light = data;
    } else if (type === 'dark') {
      settings.brand.brand_logo_dark = data;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo de logo inválido. Use "light" ou "dark"' 
      });
    }

    // Save settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

    res.json({
      success: true,
      message: 'Logo atualizada com sucesso',
      logoUrl: data
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer upload da logo' 
    });
  }
});

export default router;