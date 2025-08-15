import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Flashcard decks data storage
const decksPath = path.join(__dirname, '../../data/flashcard-decks.json');

// Ensure data directory exists
const dataDir = path.dirname(decksPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  subject: string;
  flashcard_ids: string[];
  owner_id: string;
  owner_name: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  total_cards: number;
  studied_count: number;
  mastery_level: number;
}

// Load or initialize decks
let decks: FlashcardDeck[] = [];
if (fs.existsSync(decksPath)) {
  try {
    decks = JSON.parse(fs.readFileSync(decksPath, 'utf-8'));
  } catch {
    decks = [];
    fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2));
  }
} else {
  fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2));
}

// Get all decks for a user (their own + public decks)
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id?.toString();
    
    // Filter decks: user's own decks + public decks
    const userDecks = decks.filter(deck => 
      deck.owner_id === userId || deck.is_public
    );

    res.json({
      success: true,
      data: userDecks
    });
  } catch (error) {
    console.error('Error listing decks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar arsenais' 
    });
  }
});

// Get single deck by ID
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const deckId = req.params.id;
    const userId = req.user?.id?.toString();
    const deck = decks.find(d => d.id === deckId);
    
    if (!deck) {
      res.status(404).json({ 
        success: false,
        message: 'Arsenal não encontrado' 
      });
      return;
    }

    // Check access permissions
    if (!deck.is_public && deck.owner_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado ao arsenal' 
      });
      return;
    }

    res.json({
      success: true,
      data: deck
    });
  } catch (error) {
    console.error('Error getting deck:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar arsenal' 
    });
  }
});

// Create new deck
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const {
      name,
      description,
      subject,
      flashcard_ids = [],
      is_public = false
    } = req.body;

    // Validate required fields
    if (!name || !subject) {
      res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: name, subject' 
      });
      return;
    }

    // Generate new ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `deck_${timestamp}_${random}`;

    // Create new deck
    const newDeck: FlashcardDeck = {
      id: newId,
      name,
      description: description || '',
      subject,
      flashcard_ids: Array.isArray(flashcard_ids) ? flashcard_ids : [],
      owner_id: req.user!.id.toString(),
      owner_name: req.user!.name,
      is_public,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_cards: flashcard_ids.length,
      studied_count: 0,
      mastery_level: 0
    };

    // Add to array and save
    decks.push(newDeck);
    fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2));

    res.json({
      success: true,
      message: 'Arsenal criado com sucesso',
      data: newDeck
    });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar arsenal' 
    });
  }
});

// Update deck
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const deckId = req.params.id;
    const userId = req.user?.id?.toString();
    const deckIndex = decks.findIndex(d => d.id === deckId);

    if (deckIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Arsenal não encontrado' 
      });
      return;
    }

    const existingDeck = decks[deckIndex];
    
    // Check ownership
    if (existingDeck.owner_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Apenas o criador pode editar este arsenal' 
      });
      return;
    }

    // Update deck data
    const updatedDeck: FlashcardDeck = {
      ...existingDeck,
      ...req.body,
      id: existingDeck.id, // Don't allow ID change
      owner_id: existingDeck.owner_id, // Don't allow owner change
      owner_name: existingDeck.owner_name,
      created_at: existingDeck.created_at,
      updated_at: new Date().toISOString(),
      total_cards: req.body.flashcard_ids ? req.body.flashcard_ids.length : existingDeck.total_cards
    };

    decks[deckIndex] = updatedDeck;
    fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2));

    res.json({
      success: true,
      message: 'Arsenal atualizado com sucesso',
      data: updatedDeck
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar arsenal' 
    });
  }
});

// Delete deck
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const deckId = req.params.id;
    const userId = req.user?.id?.toString();
    const deckIndex = decks.findIndex(d => d.id === deckId);

    if (deckIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Arsenal não encontrado' 
      });
      return;
    }

    const deck = decks[deckIndex];
    
    // Check ownership
    if (deck.owner_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Apenas o criador pode excluir este arsenal' 
      });
      return;
    }

    // Remove deck
    decks.splice(deckIndex, 1);
    fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2));

    res.json({
      success: true,
      message: 'Arsenal excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir arsenal' 
    });
  }
});

// Add flashcards to deck
router.post('/:id/flashcards', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const deckId = req.params.id;
    const userId = req.user?.id?.toString();
    const { flashcard_ids } = req.body;

    if (!Array.isArray(flashcard_ids) || flashcard_ids.length === 0) {
      res.status(400).json({ 
        success: false,
        message: 'Lista de flashcards é obrigatória' 
      });
      return;
    }

    const deckIndex = decks.findIndex(d => d.id === deckId);

    if (deckIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Arsenal não encontrado' 
      });
      return;
    }

    const deck = decks[deckIndex];
    
    // Check ownership
    if (deck.owner_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Apenas o criador pode adicionar cartões a este arsenal' 
      });
      return;
    }

    // Add new flashcard IDs (avoiding duplicates)
    const existingIds = new Set(deck.flashcard_ids);
    const newIds = flashcard_ids.filter(id => !existingIds.has(id));
    
    deck.flashcard_ids.push(...newIds);
    deck.total_cards = deck.flashcard_ids.length;
    deck.updated_at = new Date().toISOString();

    decks[deckIndex] = deck;
    fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2));

    res.json({
      success: true,
      message: `${newIds.length} cartões adicionados ao arsenal`,
      data: deck
    });
  } catch (error) {
    console.error('Error adding flashcards to deck:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao adicionar cartões ao arsenal' 
    });
  }
});

// Remove flashcards from deck
router.delete('/:id/flashcards', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const deckId = req.params.id;
    const userId = req.user?.id?.toString();
    const { flashcard_ids } = req.body;

    if (!Array.isArray(flashcard_ids) || flashcard_ids.length === 0) {
      res.status(400).json({ 
        success: false,
        message: 'Lista de flashcards é obrigatória' 
      });
      return;
    }

    const deckIndex = decks.findIndex(d => d.id === deckId);

    if (deckIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Arsenal não encontrado' 
      });
      return;
    }

    const deck = decks[deckIndex];
    
    // Check ownership
    if (deck.owner_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Apenas o criador pode remover cartões deste arsenal' 
      });
      return;
    }

    // Remove flashcard IDs
    const idsToRemove = new Set(flashcard_ids);
    deck.flashcard_ids = deck.flashcard_ids.filter(id => !idsToRemove.has(id));
    deck.total_cards = deck.flashcard_ids.length;
    deck.updated_at = new Date().toISOString();

    decks[deckIndex] = deck;
    fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2));

    res.json({
      success: true,
      message: `${flashcard_ids.length} cartões removidos do arsenal`,
      data: deck
    });
  } catch (error) {
    console.error('Error removing flashcards from deck:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao remover cartões do arsenal' 
    });
  }
});

export default router;