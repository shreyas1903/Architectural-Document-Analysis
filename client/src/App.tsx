import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';

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

const App: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // File upload handler
  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    setAnalysisResult(null);
    setChatHistory([]);
    setFileName('');
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Analyze document
  const analyzeDocument = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('document', uploadedFile);

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult(response.data.analysis);
      setFileName(response.data.fileName);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle question submission
  const handleQuestionSubmit = async () => {
    if (!currentQuestion.trim() || !fileName) return;

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
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { 
        type: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Architecture Document Analysis
          </h1>
          <p className="text-slate-300 text-lg">
            Upload your architectural drawings and get instant analysis with AI-powered Q&A
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Upload & Analysis */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="card-surface rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Upload Document
              </h2>
              
              {!uploadedFile ? (
                <div
                  className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">📄</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-lg font-medium">
                        Drop files here or click to browse
                      </p>
                      <p className="text-slate-300 text-sm mt-2">
                        Supports images (JPG, PNG, GIF, WebP)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between card-surface rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-slate-300 text-sm">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {uploadedFile.type.startsWith('image/') && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(uploadedFile)} 
                        alt="Uploaded document" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <button
                    onClick={analyzeDocument}
                    disabled={isAnalyzing}
                    className="w-full btn-accent py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Analyzing Document...
                      </>
                    ) : (
                      <>
                        <span></span>
                        Analyze Document
                      </>
                    )}
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="card-surface rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Analysis Results
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Document Type</h3>
                    <p className="text-slate-300 bg-white/5 rounded-lg p-3">
                      {analysisResult.documentType}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Key Features</h3>
                    <div className="bg-white/5 rounded-lg p-3">
                      {analysisResult.keyFeatures.map((feature, index) => (
                        <p key={index} className="text-slate-300 text-sm">• {feature}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Materials</h3>
                    <div className="bg-white/5 rounded-lg p-3">
                      {analysisResult.materialsList.map((material, index) => (
                        <p key={index} className="text-slate-300 text-sm">• {material}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Structural Elements</h3>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-slate-300 text-sm">
                        <strong>Floors:</strong> {analysisResult.structuralElements.floors}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Type:</strong> {analysisResult.structuralElements.type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="card-surface rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Ask Questions
            </h2>

            {!analysisResult ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">💬</span>
                </div>
                <p className="text-slate-300">
                  Upload and analyze a document to start asking questions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chat History */}
                <div className="h-96 overflow-y-auto space-y-3 input-surface rounded-lg p-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-300">
                        Ask me anything about the document!
                      </p>
                      <p className="text-slate-400 text-sm mt-2">
                        Try: "How many floors are in this design?" or "What materials are used?"
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">AI</div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                            message.type === 'user'
                              ? 'bubble-accent rounded-br-sm'
                              : 'input-surface text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          {message.content}
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-full avatar-accent flex items-center justify-center text-sm">You</div>
                        )}
                      </div>
                    ))
                  )}
                  
                  {isAnswering && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-slate-200 rounded-lg p-3 flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask a question about the document..."
                    className="flex-1 input-surface rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                    disabled={isAnswering}
                  />
                  <button
                    onClick={handleQuestionSubmit}
                    disabled={isAnswering || !currentQuestion.trim()}
                    className="btn-accent px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ➤
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;