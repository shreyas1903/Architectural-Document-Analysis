import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Ollama } from 'ollama';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Ollama client
const ollama = new Ollama({
  host: 'http://localhost:11434' // Default Ollama host
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are supported.'));
    }
  }
});

// Types
interface AnalysisResult {
  documentType: string;
  projectInfo: any;
  drawings: string[];
  generalNotes: string[];
  keyFeatures: string[];
  materialsList: string[];
  structuralElements: any;
  extractedText: string;
}

// Store analysis results in memory
const analysisCache = new Map<string, AnalysisResult>();

// Check if Ollama is running and model is available
async function checkOllamaStatus(): Promise<boolean> {
  try {
    const models = await ollama.list();
    const hasLlama = models.models.some(model => 
      model.name.toLowerCase().includes('llama3.2') || 
      model.name.toLowerCase().includes('llama') ||
      model.name.toLowerCase().includes('llava') // LLaVA for vision
    );
    return hasLlama;
  } catch (error) {
    console.error('Ollama connection error:', error);
    return false;
  }
}

// Function to encode image to base64
function encodeImageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

// Routes
app.get('/api/health', async (req, res) => {
  const ollamaStatus = await checkOllamaStatus();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    aiProvider: 'Local Llama 3.2',
    ollamaRunning: ollamaStatus
  });
});

// List available Ollama models and indicate preferred selections
app.get('/api/models', async (req, res) => {
  try {
    const ollamaStatus = await checkOllamaStatus();
    if (!ollamaStatus) {
      return res.json({
        ollamaRunning: false,
        models: [],
        preferredVisionModel: null,
        preferredTextModel: null
      });
    }

    const models = await ollama.list();
    const allModels = models.models.map(m => m.name);

    const preferredVision = models.models.find(model =>
      model.name.toLowerCase().includes('llava') ||
      model.name.toLowerCase().includes('vision')
    )?.name || null;

    const preferredText = models.models.find(model =>
      model.name.toLowerCase().includes('gemma3') ||
      model.name.toLowerCase().includes('llama3.2') ||
      model.name.toLowerCase().includes('llama')
    )?.name || null;

    return res.json({
      ollamaRunning: true,
      models: allModels,
      preferredVisionModel: preferredVision,
      preferredTextModel: preferredText
    });
  } catch (error) {
    console.error('Models endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to list models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload and analyze document with local Llama
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = req.file.filename;
    
    // Check if Ollama is running
    const ollamaStatus = await checkOllamaStatus();
    if (!ollamaStatus) {
      return res.status(500).json({ 
        error: 'Ollama is not running or no suitable model found',
        suggestion: 'Please start Ollama and ensure you have llama3.2 or llava model installed'
      });
    }

    // For images, try to use LLaVA for vision or fallback to text analysis
    if (req.file.mimetype.startsWith('image/')) {
      let analysisText = '';
      
      try {
        // First try with LLaVA (vision model) if available
        const models = await ollama.list();
        const visionModel = models.models.find(model => 
          model.name.toLowerCase().includes('llava') ||
          model.name.toLowerCase().includes('vision')
        );
        
        if (visionModel) {
          console.log(`Using vision model: ${visionModel.name}`);
          const imageBase64 = encodeImageToBase64(req.file.path);
          
          const response = await ollama.generate({
            model: visionModel.name,
            prompt: `Analyze this architectural drawing in detail. Please provide a comprehensive analysis including:

1. **Document Type**: What type of architectural drawing is this?
2. **Project Information**: Any visible project details, titles, or identification
3. **Drawings/Plans**: List all elevations, plans, sections, or details shown
4. **General Notes**: Any construction notes, specifications, or requirements
5. **Key Features**: Important architectural elements and design features
6. **Materials**: Building materials mentioned or shown
7. **Structural Elements**: Number of floors, building type, structural system
8. **Readable Text**: Any text, labels, or dimensions you can identify

Please be specific about what you can observe in the drawing and focus on details that would help someone understand this architectural design.`,
            images: [imageBase64]
          });
          
          analysisText = response.response;
        } else {
          // Fallback: Use text-based analysis with Gemma3 or other available models
          const textModel = models.models.find(model => 
            model.name.toLowerCase().includes('gemma3') ||
            model.name.toLowerCase().includes('llama3.2') ||
            model.name.toLowerCase().includes('llama')
          );
          
          if (textModel) {
            console.log(`Using text model: ${textModel.name} (limited analysis without vision)`);
            const response = await ollama.generate({
              model: textModel.name,
              prompt: `I have an architectural drawing file named "${req.file.originalname}". Based on typical architectural drawings, please provide a general analysis that includes:

1. Common elements found in architectural drawings
2. Typical project information structure
3. Standard drawing types (elevations, plans, sections)
4. Common construction notes and specifications
5. Typical building materials
6. Standard structural elements

Please provide a comprehensive template analysis that would be typical for an architectural drawing.`
            });
            
            analysisText = response.response + '\n\nNote: This is a general analysis. For detailed image analysis, please install LLaVA model with: ollama pull llava';
          } else {
            throw new Error('No suitable model found');
          }
        }

      } catch (error) {
        console.error('Local Llama analysis error:', error);
        
        // Fallback to mock analysis
        const fallbackAnalysis = generateFallbackAnalysis(req.file.originalname);
        analysisCache.set(fileName, fallbackAnalysis);
        
        return res.json({
          success: true,
          fileName: fileName,
          analysis: fallbackAnalysis,
          note: 'Using fallback analysis - please ensure Ollama is running with llava model for image analysis'
        });
      }

      // Parse the analysis into structured format
      const analysisResult: AnalysisResult = {
        documentType: extractDocumentType(analysisText),
        projectInfo: {
          title: extractProjectTitle(analysisText),
          fileName: req.file.originalname,
          uploadDate: new Date().toISOString(),
          scale: extractScale(analysisText),
          sheetNumber: extractSheetNumber(analysisText)
        },
        drawings: extractDrawings(analysisText),
        generalNotes: extractNotes(analysisText),
        keyFeatures: extractFeatures(analysisText),
        materialsList: extractMaterials(analysisText),
        structuralElements: extractStructuralElements(analysisText),
        extractedText: analysisText
      };

      // Store in cache
      analysisCache.set(fileName, analysisResult);

      return res.json({
        success: true,
        fileName: fileName,
        analysis: analysisResult,
        aiProvider: 'Local Llama 3.2'
      });

    } else {
      return res.status(400).json({ error: 'Only image files are supported' });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Chat endpoint for questions with local Llama
app.post('/api/chat', async (req, res) => {
  try {
    const { question, fileName } = req.body;
    
    if (!question || !fileName) {
      return res.status(400).json({ error: 'Question and fileName are required' });
    }

    const analysis = analysisCache.get(fileName);
    if (!analysis) {
      return res.status(404).json({ error: 'Document analysis not found' });
    }

    // Check if Ollama is running
    const ollamaStatus = await checkOllamaStatus();
    if (!ollamaStatus) {
      const fallbackAnswer = generateFallbackAnswer(question, analysis);
      return res.json({
        success: true,
        answer: fallbackAnswer,
        note: 'Using fallback response - Ollama not available'
      });
    }

    try {
      const models = await ollama.list();
      const model = models.models.find(model => 
        model.name.toLowerCase().includes('gemma3') ||
        model.name.toLowerCase().includes('llama3.2') ||
        model.name.toLowerCase().includes('llama')
      );

      if (!model) {
        throw new Error('No suitable model found');
      }

      const prompt = `You are an expert architectural analyst. Based on the following analysis of an architectural drawing, please answer the user's question accurately and specifically.

Document Analysis:
${analysis.extractedText}

Key Information:
- Document Type: ${analysis.documentType}
- Project: ${analysis.projectInfo.title}
- Floors: ${analysis.structuralElements.floors}
- Materials: ${analysis.materialsList.join(', ')}
- Key Features: ${analysis.keyFeatures.join(', ')}

User Question: ${question}

Please provide a detailed, specific answer based on the architectural drawing analysis above. Reference specific details from the drawing when possible.`;

      const response = await ollama.generate({
        model: model.name,
        prompt: prompt
      });

      return res.json({
        success: true,
        answer: response.response,
        aiProvider: 'Local Llama 3.2'
      });

    } catch (error) {
      console.error('Local Llama chat error:', error);
      
      // Fallback to mock response
      const fallbackAnswer = generateFallbackAnswer(question, analysis);
      
      return res.json({
        success: true,
        answer: fallbackAnswer,
        note: 'Using fallback response due to local AI limitations'
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: 'Failed to process question',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions (same as before)
function extractDocumentType(text: string): string {
  const lines = text.toLowerCase().split('\n');
  for (const line of lines) {
    if (line.includes('document type') || line.includes('type of drawing')) {
      return line.split(':')[1]?.trim() || 'Architectural Drawing';
    }
  }
  if (text.toLowerCase().includes('floor plan')) return 'Floor Plan';
  if (text.toLowerCase().includes('elevation')) return 'Building Elevation';
  if (text.toLowerCase().includes('section')) return 'Building Section';
  return 'Architectural Drawing';
}

function extractProjectTitle(text: string): string {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('project') || line.toLowerCase().includes('title')) {
      return line.split(':')[1]?.trim() || 'Architectural Project';
    }
  }
  return 'Architectural Project';
}

function extractScale(text: string): string {
  const scaleMatch = text.match(/scale[:\s]*([0-9\/"\s='-]+)/i);
  return scaleMatch ? scaleMatch[1].trim() : 'Not specified';
}

function extractSheetNumber(text: string): string {
  const sheetMatch = text.match(/sheet[:\s]*([A-Z0-9\-\.]+)/i);
  return sheetMatch ? sheetMatch[1].trim() : 'Not specified';
}

function extractDrawings(text: string): string[] {
  const drawings: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('elevation') || lowerLine.includes('plan') || 
        lowerLine.includes('section') || lowerLine.includes('detail') ||
        lowerLine.includes('view') || lowerLine.includes('drawing')) {
      drawings.push(line.trim());
    }
  }
  
  return drawings.length > 0 ? drawings : ['Architectural drawings present'];
}

function extractNotes(text: string): string[] {
  const notes: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('note') || lowerLine.includes('specification') || 
        lowerLine.includes('requirement') || lowerLine.includes('code') ||
        lowerLine.includes('standard')) {
      notes.push(line.trim());
    }
  }
  
  return notes.length > 0 ? notes : ['Construction notes may be present'];
}

function extractFeatures(text: string): string[] {
  const features: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('feature') || lowerLine.includes('element') || 
        lowerLine.includes('room') || lowerLine.includes('space') ||
        lowerLine.includes('area') || lowerLine.includes('design')) {
      features.push(line.trim());
    }
  }
  
  return features.length > 0 ? features : ['Architectural features identified'];
}

function extractMaterials(text: string): string[] {
  const materials: string[] = [];
  const commonMaterials = [
    'concrete', 'steel', 'wood', 'brick', 'stone', 'glass', 'metal', 
    'granite', 'copper', 'aluminum', 'vinyl', 'ceramic', 'tile',
    'drywall', 'insulation', 'roofing', 'flooring', 'siding'
  ];
  
  for (const material of commonMaterials) {
    if (text.toLowerCase().includes(material)) {
      materials.push(material.charAt(0).toUpperCase() + material.slice(1));
    }
  }
  
  return materials.length > 0 ? materials : ['Building materials specified'];
}

function extractStructuralElements(text: string): { floors: number | string; type: string; foundation?: string } {
  const floorMatch = text.match(/(\d+)\s*(?:floor|story|level|storey)/i);
  const floors = floorMatch ? parseInt(floorMatch[1]) : 'Not specified';
  
  let type = 'Building structure';
  if (text.toLowerCase().includes('residential')) type = 'Residential structure';
  if (text.toLowerCase().includes('commercial')) type = 'Commercial structure';
  if (text.toLowerCase().includes('office')) type = 'Office building';
  if (text.toLowerCase().includes('house')) type = 'House';
  
  return {
    floors: floors,
    type: type,
    foundation: text.toLowerCase().includes('foundation') ? 'Foundation details specified' : undefined
  };
}

// Fallback functions
function generateFallbackAnalysis(fileName: string): AnalysisResult {
  return {
    documentType: "Architectural Drawing",
    projectInfo: {
      title: "Architectural Project",
      fileName: fileName,
      uploadDate: new Date().toISOString(),
      scale: "Various scales",
      sheetNumber: "Not specified"
    },
    drawings: [
      "Floor plans and elevations",
      "Architectural details",
      "Construction drawings"
    ],
    generalNotes: [
      "Construction to comply with local building codes",
      "All dimensions to be verified on site",
      "Materials subject to approval"
    ],
    keyFeatures: [
      "Architectural structure",
      "Multiple rooms and spaces",
      "Standard construction details",
      "Building systems integration"
    ],
    materialsList: [
      "Concrete",
      "Steel",
      "Wood",
      "Glass",
      "Brick"
    ],
    structuralElements: {
      floors: "Multiple levels",
      type: "Building structure",
      foundation: "Foundation system"
    },
    extractedText: "This architectural drawing shows a building design with multiple floors and standard construction details. The drawing includes floor plans, elevations, and construction specifications typical of architectural projects."
  };
}

function generateFallbackAnswer(question: string, analysis: AnalysisResult): string {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('floor') || questionLower.includes('story') || questionLower.includes('level')) {
    return `Based on the architectural drawing analysis, this building has ${analysis.structuralElements.floors} floors. The structure is designed as a ${analysis.structuralElements.type}.`;
  } else if (questionLower.includes('material') || questionLower.includes('construction')) {
    return `The materials specified in this project include: ${analysis.materialsList.join(', ')}. The construction uses ${analysis.structuralElements.type} methods.`;
  } else if (questionLower.includes('room') || questionLower.includes('space') || questionLower.includes('layout')) {
    return `The building layout includes: ${analysis.keyFeatures.join(', ')}. The design shows ${analysis.documentType} with various architectural spaces.`;
  } else if (questionLower.includes('drawing') || questionLower.includes('plan')) {
    return `This document contains: ${analysis.drawings.join(', ')}. The main drawing type is ${analysis.documentType}.`;
  } else {
    return `Based on the architectural drawing analysis, this is a ${analysis.documentType}. Key features include: ${analysis.keyFeatures.slice(0, 3).join(', ')}. The structure has ${analysis.structuralElements.floors} floors and uses materials like ${analysis.materialsList.slice(0, 3).join(', ')}.`;
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🤖 AI Provider: Local Llama 3.2`);
  
  const ollamaStatus = await checkOllamaStatus();
  console.log(`🔄 Ollama Status: ${ollamaStatus ? 'Running' : 'Not available'}`);
  
  if (ollamaStatus) {
    const models = await ollama.list();
    console.log(`📋 Available models: ${models.models.map(m => m.name).join(', ')}`);
  } else {
    console.log(`⚠️  To use local AI, please start Ollama and install a model:`);
    console.log(`   ollama pull llama3.2`);
    console.log(`   ollama pull llava  # For image analysis`);
  }
  
  console.log(`🌐 Ready to analyze documents at http://localhost:${PORT}/api/upload`);
});

export default app;