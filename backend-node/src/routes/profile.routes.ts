import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Profile data storage
const profilePath = path.join(__dirname, '../../data/profiles.json');

// Ensure data directory exists
const dataDir = path.dirname(profilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Default profiles
const defaultProfiles: any = {
  '1': {
    id: 1,
    name: 'Admin User',
    email: 'admin@studypro.com',
    phone: '(11) 98765-4321',
    bio: 'Administrador do sistema StudyPro',
    avatar: null,
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  '2': {
    id: 2,
    name: 'Aluno Teste',
    email: 'aluno@example.com',
    phone: '',
    bio: '',
    avatar: '/uploads/avatars/default-avatar.jpg',
    role: 'student',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
};

// Load or initialize profiles
let profiles: any = {};
if (fs.existsSync(profilePath)) {
  try {
    profiles = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
  } catch {
    profiles = { ...defaultProfiles };
    fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2));
  }
} else {
  profiles = { ...defaultProfiles };
  fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2));
}

// Get profile
router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id || 1;
  const profile = profiles[userId] || defaultProfiles[userId];
  res.json(profile);
});

// Update profile
router.post('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || 1;
    const currentProfile = profiles[userId] || defaultProfiles[userId];
    
    const updatedProfile = {
      ...currentProfile,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    profiles[userId] = updatedProfile;
    fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2));
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil'
    });
  }
});

// Update profile (PUT for compatibility)
router.put('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || 1;
    const currentProfile = profiles[userId] || defaultProfiles[userId];
    
    const updatedProfile = {
      ...currentProfile,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    profiles[userId] = updatedProfile;
    fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2));
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil'
    });
  }
});

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), (req: AuthRequest, res): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
      return;
    }
    
    const userId = req.user?.id || 1;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Update profile with new avatar
    const currentProfile = profiles[userId] || defaultProfiles[userId];
    profiles[userId] = {
      ...currentProfile,
      avatar: avatarUrl,
      updated_at: new Date().toISOString()
    };
    
    fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2));
    
    res.json({
      success: true,
      url: avatarUrl,
      message: 'Avatar atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do avatar'
    });
  }
});

export default router;