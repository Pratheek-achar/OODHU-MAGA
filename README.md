# 📚 Notes Simplifier

AI-powered document simplification app using Google's Gemini 1.5 Flash model. Transform complex documents into clear, structured study notes.

## ✨ Features

### 📄 Multi-Format Support
- **PDF files** (.pdf) - Advanced text extraction
- **Word documents** (.docx, .doc) - Full content processing  
- **Text files** (.txt, .md, .csv) - Direct processing
- **Flexible input** - Drag & drop or paste text directly

### 🤖 AI-Powered Processing
- **Smart summarization** using Gemini 1.5 Flash
- **Structured output** with main topics, key concepts, and summaries
- **Large document handling** (up to 200k characters)
- **Robust error handling** with detailed feedback

### 🎨 Modern Interface
- **Dual input modes** - File upload or text paste
- **Real-time validation** with character counting
- **Progress indicators** and loading states
- **Responsive design** for all devices

## 🚀 Quick Start

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for the next step

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Configure Environment
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
```

### 4. Run the App
```bash
npm run dev
```

This starts both:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📖 Usage

### Method 1: Text Input (Recommended)
1. Open http://localhost:3000
2. Click **"Paste Text"** tab
3. Copy and paste your notes
4. Click **"Simplify Notes"**
5. Download the simplified version

### Method 2: File Upload
1. Click **"Upload File"** tab
2. Upload a `.txt` file
3. Click **"Simplify Notes"**
4. Download the simplified version

## 🔧 Tech Stack

- **Frontend**: React 18, CSS3, Axios
- **Backend**: Node.js, Express
- **AI**: Google Gemini 1.5 Flash
- **File Upload**: Multer
- **Styling**: Custom CSS with modern design

## 📡 API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Upload and process files
- `POST /api/process-text` - Process text directly
- `POST /api/generate-pdf` - Generate downloadable file

## 🎯 AI Output Format

The AI provides structured output with:
- **Main Topics** - Key subjects covered
- **Key Concepts** - Important definitions
- **Important Points** - Crucial information to remember
- **Summary** - Concise overview of the material

## 🛠️ Recent Code Improvements

### ✅ Code Quality Fixes
- Removed unused imports (`fs` module)
- Added comprehensive input validation
- Enhanced error handling with specific messages
- Added environment variable validation
- Improved API response consistency

### ✅ User Experience Enhancements  
- Character counter for text input (200k limit)
- Better file type detection and validation
- Request timeout handling (60 seconds)
- Clear error messages and user guidance
- Loading states and progress indicators

### ✅ Reliability Improvements
- Robust PDF parsing with fallback handling
- Memory-efficient file processing
- API rate limiting considerations
- Graceful error recovery

## 🔍 Supported File Types

| Format | Extensions | Notes |
|--------|------------|-------|
| PDF | `.pdf` | Text extraction (not image-based PDFs) |
| Word | `.docx`, `.doc` | Full document processing |
| Text | `.txt`, `.md`, `.csv` | Direct text processing |
| Other | Any | Attempts text extraction |

## 🚨 Troubleshooting

### Common Issues

**"No readable text found"**
- PDF might be image-based or corrupted
- Try copying text manually

**"Request timed out"**  
- File too large or complex
- Try smaller sections

**"API key error"**
- Verify your Gemini API key in `.env`
- Check API permissions and quotas

## 🧪 Testing

Test the API endpoints:
```bash
cd backend
node test-api.js
```

## 🔮 Future Enhancements

- [ ] OCR support for image-based PDFs
- [ ] Multiple export formats (PDF, Word, Markdown)
- [ ] Study question generation
- [ ] Flashcard creation
- [ ] Multiple language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own learning!