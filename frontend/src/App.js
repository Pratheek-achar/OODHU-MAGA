import React, { useState } from 'react';
import axios from 'axios';

// Simple component to display clean, formatted notes
const FormattedNotesDisplay = ({ content }) => {
  // Clean up any markdown formatting
  const cleanContent = content
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/###\s*/g, '')
    .replace(/##\s*/g, '')
    .replace(/#\s*/g, '');

  // Split into lines and format each line
  const lines = cleanContent.split('\n');
  
  return (
    <div className="formatted-notes">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          return <div key={index} className="line-break"></div>;
        }
        
        // Check if it's a header with emoji
        if (trimmedLine.match(/^[🎯💡⭐📝🔍]/)) {
          return (
            <div key={index} className="note-header">
              {trimmedLine}
            </div>
          );
        }
        
        // Check if it's a bullet point
        if (trimmedLine.startsWith('•')) {
          return (
            <div key={index} className="note-bullet">
              <span className="bullet-icon">•</span>
              <span className="bullet-content">{trimmedLine.substring(1).trim()}</span>
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <div key={index} className="note-paragraph">
            {trimmedLine}
          </div>
        );
      })}
    </div>
  );
};

function App() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      // Accept most common document types
      const supportedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/markdown',
        'text/csv'
      ];
      
      const supportedExtensions = ['.txt', '.pdf', '.docx', '.doc', '.md', '.csv'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (supportedTypes.includes(selectedFile.type) || supportedExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setError('');
      } else {
        // Still allow the file but warn user
        setFile(selectedFile);
        setError('File type not fully supported, but we\'ll try to extract text from it.');
      }
    } else {
      setError('Please select a file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleProcess = async () => {
    if (inputMode === 'file' && !file) {
      setError('Please select a file first');
      return;
    }
    
    if (inputMode === 'text' && !textInput.trim()) {
      setError('Please enter some text to process');
      return;
    }

    // Additional validation for text length
    if (inputMode === 'text' && textInput.length > 200000) {
      setError('Text is too long. Please limit to 200,000 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      console.log('Starting processing...', inputMode);
      let response;
      
      if (inputMode === 'text') {
        console.log('Processing text, length:', textInput.length);
        response = await axios.post('/api/process-text', {
          text: textInput
        }, {
          timeout: 90000 // 90 second timeout
        });
      } else {
        console.log('Processing file:', file.name, 'size:', file.size);
        const formData = new FormData();
        formData.append('pdf', file);
        response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 90000 // 90 second timeout
        });
      }
      
      console.log('Response received:', response.status);
      
      if (response.data && response.data.success) {
        console.log('Processing successful');
        setResults(response.data);
      } else {
        console.error('Unexpected response:', response.data);
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      console.error('Processing error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The AI is taking too long to process. Please try with shorter content.');
      } else if (err.response?.status === 500) {
        setError('Server error: ' + (err.response?.data?.error || 'Internal server error. Please try again.'));
      } else if (err.response?.status === 400) {
        setError('Input error: ' + (err.response?.data?.error || 'Invalid input. Please check your content.'));
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the server is running and try again.');
      } else {
        setError(err.response?.data?.error || 'Failed to process content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post('/api/generate-pdf', 
        { text: results.simplifiedNotes },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'simplified-notes.txt';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate PDF');
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>📚 Notes Simplifier</h1>
        <p>Upload any document (PDF, Word, Text) or paste content directly for AI-powered summaries</p>
      </div>
      
      <div className="container">

      <div className="upload-section">
        <div className="input-mode-selector">
          <button 
            className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
            onClick={() => setInputMode('file')}
          >
            📄 Upload File
          </button>
          <button 
            className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => setInputMode('text')}
          >
            ✏️ Paste Text
          </button>
        </div>

        {inputMode === 'file' ? (
          <div 
            className={`upload-area ${dragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div>
              <h3>📄 Drop your file here or click to browse</h3>
              <p>Supports: PDF, Word (.docx, .doc), Text (.txt, .md, .csv) • Max: 10MB</p>
              <p><small>💡 Most document formats supported - we'll try to extract text from any file!</small></p>
              {file && <p><strong>Selected:</strong> {file.name}</p>}
            </div>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.csv,*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="file-input"
            />
          </div>
        ) : (
          <div className="text-input-area">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your notes here..."
              className="text-input"
              rows={10}
            />
            <div className="character-count">
              {textInput.length.toLocaleString()} / 200,000 characters
              {textInput.length > 200000 && <span className="over-limit"> (Over limit!)</span>}
            </div>
          </div>
        )}
        
        <button 
          onClick={handleProcess} 
          disabled={(inputMode === 'file' && !file) || (inputMode === 'text' && !textInput.trim()) || loading}
          className="upload-btn"
        >
          {loading ? 'Processing...' : 'Simplify Notes'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Processing your notes with AI...</p>
        </div>
      )}

      {results && (
        <div className="results-section">
          <div className="results-header">
            <h2>✨ Simplified Notes</h2>
            <button onClick={handleDownload} className="download-btn">
              📥 Download Notes
            </button>
          </div>
          
          <div className="stats">
            <span>Original: {results.originalLength} characters</span>
            <span>Simplified: {results.simplifiedLength} characters</span>
          </div>
          
          <div className="simplified-content">
            <FormattedNotesDisplay content={results.simplifiedNotes} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;