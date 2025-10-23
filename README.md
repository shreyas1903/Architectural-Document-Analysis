# Intelligent Document Analyzer

AI-powered document analysis and Q&A system that can parse architectural drawings, technical documents, and provide intelligent answers to questions about the content.

## Features

- 📄 **Document Upload**: Support for images, PDFs, and various document formats
- 🔍 **AI Analysis**: Powered by OpenAI GPT-4 Vision for intelligent document parsing
- 💬 **Interactive Q&A**: Ask questions about the document content
- 🏗️ **Architectural Support**: Specialized analysis for architectural drawings and technical documents
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Dropzone for file uploads

### Backend
- Node.js with Express
- TypeScript
- OpenAI GPT-4 Vision API
- Tesseract.js for OCR
- Multer for file handling

## Getting Started

1. **Install dependencies**:
   `ash
   npm run install:all
   `

2. **Set up environment variables**:
   - Copy .env.example to .env in both client and server directories
   - Add your OpenAI API key and other required variables

3. **Start development servers**:
   `ash
   npm run dev
   `

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Project Structure

`
intelligent-document-analyzer/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared types and utilities
├── docs/            # Documentation
└── scripts/         # Automation scripts
`

## Development

- 
pm run dev - Start both frontend and backend in development mode
- 
pm run build - Build both applications for production
- 
pm run test - Run tests for both applications

## License

MIT License
