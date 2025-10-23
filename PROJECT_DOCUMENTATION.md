# Intelligent Document Analyzer - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technical Specifications](#technical-specifications)
4. [Project Structure](#project-structure)
5. [Data Flow & Logic](#data-flow--logic)
6. [API Documentation](#api-documentation)
7. [Frontend Implementation](#frontend-implementation)
8. [Backend Implementation](#backend-implementation)
9. [AI Integration](#ai-integration)
10. [Security & Performance](#security--performance)
11. [Setup & Deployment](#setup--deployment)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### **Purpose**
The Intelligent Document Analyzer is an AI-powered system designed to analyze architectural drawings and technical documents. It provides automated document parsing, structured data extraction, and interactive Q&A capabilities for architectural professionals.

### **Key Features**
- **Document Upload**: Drag-and-drop interface for architectural drawings (JPG, PNG, GIF, WebP)
- **AI Analysis**: Local AI processing using Ollama with Llama 3.2 and LLaVA models
- **Structured Extraction**: Automated parsing of document type, materials, features, and structural elements
- **Interactive Q&A**: Chat interface for asking questions about analyzed documents
- **Privacy-First**: All processing happens locally, no cloud dependencies
- **Fallback System**: Graceful degradation when AI models are unavailable

### **Target Users**
- Architects and architectural firms
- Construction project managers
- Building inspectors and code reviewers
- Engineering consultants
- Architecture students and educators

---

## 🏗️ System Architecture

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  React 18 + TypeScript + Tailwind CSS (Port 3000)             │
├─────────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                            │
│  Node.js + Express + TypeScript (Port 5000)                    │
├─────────────────────────────────────────────────────────────────┤
│                    AI PROCESSING LAYER                          │
│  Ollama + Llama 3.2 + LLaVA (Port 11434)                     │
├─────────────────────────────────────────────────────────────────┤
│                    STORAGE LAYER                                │
│  File System + In-Memory Cache                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Component Architecture**
```
Frontend (React)
├── App.tsx (Main Component)
│   ├── File Upload Panel
│   ├── Analysis Results Display
│   └── Chat Q&A Interface
├── App.css (Styling)
└── index.tsx (Entry Point)

Backend (Node.js)
├── app.ts (Express Server)
│   ├── API Routes (/api/*)
│   ├── File Handler (Multer)
│   ├── AI Processor (Ollama)
│   ├── Data Extractors
│   ├── Cache Manager
│   └── Fallback Generator
└── uploads/ (File Storage)

AI Layer (Ollama)
├── LLaVA (Vision Model)
├── Llama 3.2 (Text Model)
└── Gemma3 (Alternative Model)
```

---

## 🔧 Technical Specifications

### **Frontend Stack**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| TypeScript | 4.9.5 | Type Safety |
| Tailwind CSS | 3.2.7 | Styling Framework |
| Axios | 1.3.4 | HTTP Client |
| React Dropzone | 14.2.3 | File Upload |
| Zustand | 4.3.6 | State Management |
| Lucide React | 0.220.0 | Icons |

### **Backend Stack**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime Environment |
| Express | 4.18.2 | Web Framework |
| TypeScript | 4.9.5 | Type Safety |
| Ollama | 0.5.16 | AI Model Interface |
| Multer | 1.4.5-lts.1 | File Upload Handler |
| Sharp | 0.32.0 | Image Processing |
| Helmet | 6.0.1 | Security Headers |
| CORS | 2.8.5 | Cross-Origin Requests |

### **AI Models**
| Model | Type | Purpose | Parameters | Size |
|-------|------|---------|------------|------|
| LLaVA 1.5 (7B) | Vision | Image Analysis | 7 Billion | ~4.5GB |
| LLaVA 1.6 (34B) | Vision | Advanced Image Analysis | 34 Billion | ~20GB |
| Llama 3.2 (3B) | Text | Q&A Processing | 3 Billion | ~2GB |
| Llama 3.2 (1B) | Text | Lightweight Q&A | 1 Billion | ~1.3GB |
| Gemma2 (9B) | Text | Alternative Model | 9 Billion | ~5.4GB |

### **System Requirements**
- **OS**: Windows, macOS, Linux
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for AI models
- **CPU**: Multi-core processor recommended
- **GPU**: Optional, improves AI processing speed

---

## 📁 Project Structure

```
intelligent-document-analyzer/
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html              # HTML Template
│   ├── src/
│   │   ├── App.tsx                 # Main React Component
│   │   ├── App.css                 # Custom Styles
│   │   └── index.tsx               # React Entry Point
│   ├── .env.example                # Environment Template
│   ├── package.json                # Frontend Dependencies
│   ├── tailwind.config.js          # Tailwind Configuration
│   └── tsconfig.json               # TypeScript Config
├── server/                         # Node.js Backend
│   ├── src/
│   │   └── app.ts                  # Express Server
│   ├── uploads/                    # File Storage Directory
│   ├── dist/                       # Compiled JavaScript
│   ├── .env.example                # Environment Template
│   ├── package.json                # Backend Dependencies
│   ├── test-gemini.js              # AI Testing Script
│   └── tsconfig.json               # TypeScript Config
├── .gitignore                      # Git Ignore Rules
├── package.json                    # Root Package Config
└── README.md                       # Project Overview
```

---

## 🔄 Data Flow & Logic

### **1. Document Upload Flow**
```
User Action → File Selection → Validation → Upload → Storage → Analysis
     │              │             │          │         │         │
   Browser    File Picker    MIME Check   FormData   Multer   AI Processing
```

**Detailed Steps:**
1. **User Interaction**: User drags/drops or selects architectural drawing
2. **Client Validation**: Check file type (image/*) and size (<10MB)
3. **FormData Creation**: Package file for multipart upload
4. **Server Reception**: Multer middleware handles file storage
5. **File Validation**: Server-side MIME type and size verification
6. **AI Analysis Trigger**: Pass file to Ollama for processing

### **2. AI Processing Pipeline**
```
Image File → Base64 Encoding → Model Selection → Prompt Generation → AI Analysis → Response Parsing
     │              │               │               │               │              │
  File Path    Buffer.toString()  Priority Logic   Template Build   Ollama API   Text Processing
```

**Model Selection Logic:**
```typescript
// Priority order for model selection
1. LLaVA (Vision Model) - Preferred for image analysis
   - Can process images directly
   - Provides detailed visual analysis
   
2. Llama 3.2/Gemma3 (Text Models) - Fallback
   - Text-only analysis based on filename
   - General architectural knowledge
   
3. Fallback Generator - Last resort
   - Mock analysis when AI unavailable
   - Template-based responses
```

### **3. Data Extraction Logic**
```typescript
AI Response → Text Parsing → Pattern Matching → Structured Data → Cache Storage
     │             │              │               │               │
  Raw Text    Line Splitting   RegEx/Keywords   AnalysisResult   Memory Map
```

**Extraction Functions:**
- `extractDocumentType()`: Identifies drawing type (Floor Plan, Elevation, etc.)
- `extractProjectTitle()`: Finds project name and identification
- `extractMaterials()`: Searches for building materials keywords
- `extractFeatures()`: Identifies architectural elements
- `extractStructuralElements()`: Determines floors, building type
- `extractScale()`: Finds drawing scale information
- `extractDrawings()`: Lists all drawing types present

### **4. Q&A Processing Flow**
```
User Question → Context Retrieval → Prompt Building → AI Processing → Response Generation
     │               │                 │               │                │
   Frontend        Cache Lookup      Template        Ollama           Formatted Answer
```

**Context Building Logic:**
```typescript
const prompt = `
You are an expert architectural analyst.
Based on the following analysis: ${analysis.extractedText}
Key Information:
- Document Type: ${analysis.documentType}
- Materials: ${analysis.materialsList.join(', ')}
- Features: ${analysis.keyFeatures.join(', ')}

User Question: ${question}
Provide a detailed, specific answer based on the analysis.
`;
```

---

## 🔌 API Documentation

### **Base URL**
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### **Endpoints**

#### **GET /api/health**
**Purpose**: Check system status and AI availability
```json
Response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "aiProvider": "Local Llama 3.2",
  "ollamaRunning": true
}
```

#### **GET /api/models**
**Purpose**: List available AI models
```json
Response:
{
  "ollamaRunning": true,
  "models": ["llava:latest", "llama3.2:latest", "gemma3:latest"],
  "preferredVisionModel": "llava:latest",
  "preferredTextModel": "llama3.2:latest"
}
```

#### **POST /api/upload**
**Purpose**: Upload and analyze document
```javascript
Request:
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'document' field

Response:
{
  "success": true,
  "fileName": "document-1234567890-123456789.jpg",
  "analysis": {
    "documentType": "Floor Plan",
    "projectInfo": {
      "title": "Residential Building",
      "fileName": "house_plan.jpg",
      "uploadDate": "2024-01-15T10:30:00.000Z",
      "scale": "1:100",
      "sheetNumber": "A-101"
    },
    "drawings": ["Ground Floor Plan", "First Floor Plan"],
    "generalNotes": ["All dimensions in millimeters"],
    "keyFeatures": ["Living room", "Kitchen", "Bedrooms"],
    "materialsList": ["Concrete", "Steel", "Wood"],
    "structuralElements": {
      "floors": 2,
      "type": "Residential structure",
      "foundation": "Foundation details specified"
    },
    "extractedText": "Full AI analysis text..."
  },
  "aiProvider": "Local Llama 3.2"
}
```

#### **POST /api/chat**
**Purpose**: Ask questions about analyzed document
```javascript
Request:
{
  "question": "How many bedrooms are in this house?",
  "fileName": "document-1234567890-123456789.jpg"
}

Response:
{
  "success": true,
  "answer": "Based on the floor plan analysis, this house has 3 bedrooms located on the first floor...",
  "aiProvider": "Local Llama 3.2"
}
```

---

## 🎨 Frontend Implementation

### **Main Component Structure**
```typescript
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

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
}
```

### **State Management**
```typescript
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
const [fileName, setFileName] = useState<string>('');
const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
const [currentQuestion, setCurrentQuestion] = useState('');
const [isAnswering, setIsAnswering] = useState(false);
```

### **File Upload Logic**
```typescript
const handleFileUpload = useCallback((file: File) => {
  // Reset state for new file
  setUploadedFile(file);
  setAnalysisResult(null);
  setChatHistory([]);
  setFileName('');
}, []);

const analyzeDocument = async () => {
  if (!uploadedFile) return;
  
  setIsAnalyzing(true);
  
  const formData = new FormData();
  formData.append('document', uploadedFile);
  
  try {
    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setAnalysisResult(response.data.analysis);
    setFileName(response.data.fileName);
  } catch (error) {
    console.error('Analysis error:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

### **Chat Implementation**
```typescript
const handleQuestionSubmit = async () => {
  if (!currentQuestion.trim() || !fileName) return;
  
  // Add user message
  const userMessage: ChatMessage = { type: 'user', content: currentQuestion };
  setChatHistory(prev => [...prev, userMessage]);
  setCurrentQuestion('');
  setIsAnswering(true);
  
  try {
    const response = await axios.post(`${API_URL}/api/chat`, {
      question: currentQuestion,
      fileName: fileName
    });
    
    const aiMessage: ChatMessage = { type: 'ai', content: response.data.answer };
    setChatHistory(prev => [...prev, aiMessage]);
  } catch (error) {
    const errorMessage: ChatMessage = { 
      type: 'ai', 
      content: 'Sorry, I encountered an error. Please try again.' 
    };
    setChatHistory(prev => [...prev, errorMessage]);
  } finally {
    setIsAnswering(false);
  }
};
```

### **UI Styling System**
```css
/* Dark theme with glass morphism */
body {
  background: radial-gradient(1100px 600px at 20% -10%, rgba(22, 24, 28, 0.85), rgba(22, 24, 28, 0) 60%),
              radial-gradient(900px 500px at 85% 0%, rgba(29, 31, 36, 0.75), rgba(22, 24, 28, 0) 60%),
              radial-gradient(800px 600px at 50% 100%, rgba(17, 18, 21, 0.8), rgba(22, 24, 28, 0) 60%),
              linear-gradient(180deg, #16181c 0%, #131519 50%, #0f1115 100%);
}

.card-surface {
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.btn-accent {
  background-color: #81a1c1;
  color: #0a0a0b;
}
```

---

## ⚙️ Backend Implementation

### **Express Server Setup**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { Ollama } from 'ollama';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Ollama client
const ollama = new Ollama({
  host: 'http://localhost:11434'
});

// Middleware stack
app.use(helmet());           // Security headers
app.use(cors());            // Cross-origin requests
app.use(morgan('combined')); // Request logging
app.use(express.json());     // JSON parsing
app.use(express.urlencoded({ extended: true })); // URL encoding
```

### **File Upload Configuration**
```typescript
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
  limits: { fileSize: 10485760 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});
```

### **AI Processing Logic**
```typescript
async function processWithAI(filePath: string, originalName: string): Promise<string> {
  const models = await ollama.list();
  
  // Try vision model first
  const visionModel = models.models.find(model => 
    model.name.toLowerCase().includes('llava') ||
    model.name.toLowerCase().includes('vision')
  );
  
  if (visionModel) {
    const imageBase64 = encodeImageToBase64(filePath);
    const response = await ollama.generate({
      model: visionModel.name,
      prompt: ARCHITECTURAL_ANALYSIS_PROMPT,
      images: [imageBase64]
    });
    return response.response;
  }
  
  // Fallback to text model
  const textModel = models.models.find(model => 
    model.name.toLowerCase().includes('llama3.2') ||
    model.name.toLowerCase().includes('gemma3')
  );
  
  if (textModel) {
    const response = await ollama.generate({
      model: textModel.name,
      prompt: `Analyze architectural drawing: ${originalName}`
    });
    return response.response;
  }
  
  throw new Error('No suitable AI model available');
}
```

### **Data Extraction System**
```typescript
function parseAnalysisResult(analysisText: string, file: Express.Multer.File): AnalysisResult {
  return {
    documentType: extractDocumentType(analysisText),
    projectInfo: {
      title: extractProjectTitle(analysisText),
      fileName: file.originalname,
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
}

// Example extraction function
function extractMaterials(text: string): string[] {
  const materials: string[] = [];
  const commonMaterials = [
    'concrete', 'steel', 'wood', 'brick', 'stone', 'glass', 'metal'
  ];
  
  for (const material of commonMaterials) {
    if (text.toLowerCase().includes(material)) {
      materials.push(material.charAt(0).toUpperCase() + material.slice(1));
    }
  }
  
  return materials.length > 0 ? materials : ['Building materials specified'];
}
```

### **Cache Management**
```typescript
// In-memory cache for analysis results
const analysisCache = new Map<string, AnalysisResult>();

// Store analysis result
analysisCache.set(fileName, analysisResult);

// Retrieve for Q&A
const analysis = analysisCache.get(fileName);
if (!analysis) {
  return res.status(404).json({ error: 'Document analysis not found' });
}
```

---

## 🤖 AI Integration

### **Ollama Setup**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull required models (choose based on your hardware)
# LLaVA Models (Vision)
ollama pull llava:7b      # 7B parameters, ~4.5GB (Recommended)
ollama pull llava:13b     # 13B parameters, ~8GB (Better quality)
ollama pull llava:34b     # 34B parameters, ~20GB (Best quality, requires 32GB+ RAM)

# Text Models
ollama pull llama3.2:3b   # 3B parameters, ~2GB (Recommended)
ollama pull llama3.2:1b   # 1B parameters, ~1.3GB (Lightweight)
ollama pull gemma2:9b     # 9B parameters, ~5.4GB (Alternative)

# Start Ollama service
ollama serve
```

### **Model Selection Strategy**
```typescript
async function selectBestModel(task: 'vision' | 'text'): Promise<string | null> {
  const models = await ollama.list();
  
  if (task === 'vision') {
    // Prefer vision-capable models
    return models.models.find(model => 
      model.name.toLowerCase().includes('llava') ||
      model.name.toLowerCase().includes('vision')
    )?.name || null;
  }
  
  if (task === 'text') {
    // Prefer latest text models
    return models.models.find(model => 
      model.name.toLowerCase().includes('llama3.2') ||
      model.name.toLowerCase().includes('gemma3') ||
      model.name.toLowerCase().includes('llama')
    )?.name || null;
  }
  
  return null;
}
```

### **Prompt Engineering**
```typescript
const ARCHITECTURAL_ANALYSIS_PROMPT = `
Analyze this architectural drawing in detail. Please provide a comprehensive analysis including:

1. **Document Type**: What type of architectural drawing is this?
2. **Project Information**: Any visible project details, titles, or identification
3. **Drawings/Plans**: List all elevations, plans, sections, or details shown
4. **General Notes**: Any construction notes, specifications, or requirements
5. **Key Features**: Important architectural elements and design features
6. **Materials**: Building materials mentioned or shown
7. **Structural Elements**: Number of floors, building type, structural system
8. **Readable Text**: Any text, labels, or dimensions you can identify

Please be specific about what you can observe in the drawing and focus on details that would help someone understand this architectural design.
`;

const QA_PROMPT_TEMPLATE = `
You are an expert architectural analyst. Based on the following analysis of an architectural drawing, please answer the user's question accurately and specifically.

Document Analysis:
${analysis.extractedText}

Key Information:
- Document Type: ${analysis.documentType}
- Project: ${analysis.projectInfo.title}
- Floors: ${analysis.structuralElements.floors}
- Materials: ${analysis.materialsList.join(', ')}
- Key Features: ${analysis.keyFeatures.join(', ')}

User Question: ${question}

Please provide a detailed, specific answer based on the architectural drawing analysis above. Reference specific details from the drawing when possible.
`;
```

### **Fallback System**
```typescript
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
    drawings: ["Floor plans and elevations", "Architectural details"],
    generalNotes: ["Construction to comply with local building codes"],
    keyFeatures: ["Architectural structure", "Multiple rooms and spaces"],
    materialsList: ["Concrete", "Steel", "Wood", "Glass"],
    structuralElements: {
      floors: "Multiple levels",
      type: "Building structure"
    },
    extractedText: "Fallback analysis - AI models not available"
  };
}
```

---

## 🛡️ Security & Performance

### **Security Measures**
```typescript
// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// File validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }
  
  cb(null, true);
};
```

### **Performance Optimizations**
```typescript
// Memory cache for fast retrieval
const analysisCache = new Map<string, AnalysisResult>();

// Async processing
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    // Non-blocking file processing
    const analysisPromise = processWithAI(req.file.path, req.file.originalname);
    const result = await analysisPromise;
    
    // Cache result for Q&A
    analysisCache.set(fileName, parsedResult);
    
    res.json({ success: true, analysis: parsedResult });
  } catch (error) {
    // Graceful error handling
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Compression middleware
import compression from 'compression';
app.use(compression());
```

### **Error Handling Strategy**
```typescript
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
```

---

## 🚀 Setup & Deployment

### **Development Setup**
```bash
# 1. Clone repository
git clone <repository-url>
cd intelligent-document-analyzer

# 2. Install all dependencies
npm run install:all

# 3. Setup environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env

# 4. Install and setup Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2
ollama pull llava

# 5. Start development servers
npm run dev
```

### **Environment Configuration**
```bash
# client/.env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development

# server/.env
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
OLLAMA_HOST=http://localhost:11434
```

### **Production Deployment**
```bash
# 1. Build applications
npm run build

# 2. Setup production environment
export NODE_ENV=production
export PORT=5000

# 3. Start production server
npm start

# 4. Setup reverse proxy (Nginx example)
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build applications
RUN npm run build

# Expose ports
EXPOSE 3000 5000

# Start application
CMD ["npm", "run", "dev"]
```

### **Process Management (PM2)**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'document-analyzer-client',
      script: 'npm',
      args: 'run client:start',
      cwd: './client',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'document-analyzer-server',
      script: 'npm',
      args: 'start',
      cwd: './server',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Ollama Connection Issues**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve

# Check available models
ollama list
```

#### **2. File Upload Errors**
```typescript
// Check file size and type
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}

if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
  throw new Error('Invalid file type');
}
```

#### **3. Memory Issues**
```bash
# Monitor memory usage
node --max-old-space-size=4096 server/dist/app.js

# Clear cache periodically
setInterval(() => {
  if (analysisCache.size > 100) {
    analysisCache.clear();
  }
}, 3600000); // Clear every hour
```

#### **4. AI Model Performance**
```bash
# Use GPU acceleration (if available)
ollama run llama3.2 --gpu

# Monitor model performance
ollama ps
```

### **Debug Mode**
```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

### **Health Monitoring**
```typescript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    ollama: await checkOllamaStatus(),
    cache: analysisCache.size
  };
  
  res.json(health);
});
```

---

## 📊 Performance Metrics

### **Expected Performance**
- **File Upload**: < 2 seconds for 10MB files
- **AI Analysis**: 10-30 seconds depending on model and hardware
- **Q&A Response**: 2-10 seconds per question
- **Memory Usage**: 200-500MB base, +100MB per cached analysis
- **Concurrent Users**: 10-50 depending on hardware

### **Optimization Tips**
1. **Use SSD storage** for faster file I/O
2. **Enable GPU acceleration** for AI models
3. **Implement cache cleanup** to manage memory
4. **Use CDN** for static assets in production
5. **Monitor and limit** concurrent AI requests

---

## 🔮 Future Enhancements

### **Planned Features**
- **PDF Support**: Extract text and images from PDF documents
- **Batch Processing**: Analyze multiple documents simultaneously
- **Export Functionality**: Generate reports in PDF/Word format
- **User Authentication**: Multi-user support with document history
- **Cloud Integration**: Optional cloud AI providers
- **Mobile App**: React Native mobile application
- **API Rate Limiting**: Advanced request throttling
- **Database Integration**: Persistent storage for analyses
- **Advanced Search**: Full-text search across analyzed documents
- **Collaboration Tools**: Share analyses with team members

### **Technical Improvements**
- **Microservices Architecture**: Split into smaller services
- **Message Queue**: Async processing with Redis/RabbitMQ
- **Load Balancing**: Handle multiple server instances
- **Monitoring**: Prometheus/Grafana integration
- **Testing**: Comprehensive unit and integration tests
- **CI/CD Pipeline**: Automated deployment workflow

---

## 📝 License & Contributing

### **License**
MIT License - See LICENSE file for details

### **Contributing Guidelines**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Code Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Testing**: Jest for unit tests

---

## 📞 Support & Contact

### **Documentation**
- **GitHub Repository**: [Link to repository]
- **API Documentation**: Available at `/api/docs` when running
- **Video Tutorials**: [Link to tutorials]

### **Community**
- **Discord Server**: [Link to Discord]
- **Stack Overflow**: Tag with `intelligent-document-analyzer`
- **GitHub Issues**: For bug reports and feature requests

### **Professional Support**
- **Email**: support@yourdomain.com
- **Consulting**: Available for custom implementations
- **Training**: Workshops and training sessions available

---

*This documentation is maintained and updated regularly. Last updated: January 2024*