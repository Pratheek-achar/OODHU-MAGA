import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import path from 'path';

// Create a custom pdf-parse function to avoid the test file issue
async function safePdfParse(buffer) {
  try {
    // Dynamically import pdf-parse to avoid initialization issues
    const pdfParse = (await import('pdf-parse')).default;
    return await pdfParse(buffer);
  } catch (error) {
    // If pdf-parse fails, try alternative approach
    throw new Error('PDF parsing failed: ' + error.message);
  }
}
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Validate environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    console.log('Attempting PDF text extraction...');
    const data = await safePdfParse(buffer);
    console.log(`PDF processed: ${data.numpages} pages, ${data.text.length} characters`);
    return data.text.trim() || 'No readable text found in PDF';
  } catch (error) {
    console.error('PDF extraction failed:', error.message);
    return 'PDF text extraction failed. The PDF might be image-based or corrupted. Please try copying the text manually.';
  }
}

// Extract text from Word documents
async function extractTextFromWord(buffer) {
  try {
    console.log('Extracting text from Word document...');
    const result = await mammoth.extractRawText({ buffer });
    console.log(`Word document processed: ${result.value.length} characters`);
    return result.value.trim() || 'No text found in Word document';
  } catch (error) {
    console.error('Word extraction failed:', error.message);
    throw new Error('Failed to extract text from Word document: ' + error.message);
  }
}

// Extract text from different file types
async function extractTextFromFile(buffer, mimetype, filename) {
  try {
    console.log(`Processing file type: ${mimetype}, filename: ${filename}`);

    // Handle by MIME type
    switch (mimetype) {
      case 'text/plain':
        return buffer.toString('utf-8');

      case 'application/pdf':
        return await extractTextFromPDF(buffer);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await extractTextFromWord(buffer);

      default:
        // Try to handle by file extension if MIME type is not recognized
        const ext = path.extname(filename).toLowerCase();

        switch (ext) {
          case '.txt':
          case '.md':
          case '.csv':
            return buffer.toString('utf-8');

          case '.pdf':
            return await extractTextFromPDF(buffer);

          case '.docx':
          case '.doc':
            return await extractTextFromWord(buffer);

          default:
            // Try to read as text anyway
            try {
              const text = buffer.toString('utf-8');
              if (text.length > 0 && text.length < 1000000) { // Reasonable text file size
                return text;
              }
            } catch (e) {
              // Not a text file
            }

            throw new Error(`Unsupported file type: ${mimetype || 'unknown'} (${ext || 'no extension'}). Supported formats: PDF, Word (.docx, .doc), Text (.txt, .md, .csv)`);
        }
    }
  } catch (error) {
    throw new Error('Failed to extract text from file: ' + error.message);
  }
}

// Simplify notes using Gemini
async function simplifyNotes(text) {
  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for processing');
  }

  // Limit text length to prevent API issues
  const maxLength = 100000; // 100k characters
  const processText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  const prompt = `
Please analyze the following study notes and create a simplified, well-organized summary. Use this exact format with NO markdown symbols (no **, __, ###, etc.):

🎯 MAIN TOPICS
• [List each main topic clearly]

💡 KEY CONCEPTS  
• [Define important concepts simply]

⭐ IMPORTANT POINTS
• [Highlight crucial information]

📝 SUMMARY
[Write a clear paragraph explaining the main ideas]

🔍 STUDY TIPS
• [Provide practical study advice]

Rules:
- Use ONLY plain text with emojis and bullet points (•)
- NO formatting symbols like ** __ ### etc.
- Keep explanations clear and concise
- Make it easy to read and understand

Notes to analyze:
${processText}
  `;

  try {
    const result = await model.generateContent(prompt);
    let response = result.response.text();

    if (!response || response.trim().length === 0) {
      throw new Error('AI returned empty response');
    }

    // Clean up any remaining markdown formatting
    response = response
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // Remove triple asterisks
      .replace(/\*\*(.*?)\*\*/g, '$1')      // Remove double asterisks (bold)
      .replace(/\*(.*?)\*/g, '$1')          // Remove single asterisks (italic)
      .replace(/__(.*?)__/g, '$1')          // Remove underscores (bold)
      .replace(/_(.*?)_/g, '$1')            // Remove single underscores (italic)
      .replace(/###\s*/g, '')               // Remove ### headers
      .replace(/##\s*/g, '')                // Remove ## headers
      .replace(/#\s*/g, '')                 // Remove # headers
      .replace(/`(.*?)`/g, '$1')            // Remove backticks
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');  // Remove markdown links

    return response;
  } catch (error) {
    console.error('Gemini API error:', error);

    // Provide more specific error messages
    if (error.message.includes('API_KEY')) {
      throw new Error('Invalid API key. Please check your Gemini API key configuration.');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later or check your Gemini API limits.');
    } else if (error.message.includes('timeout')) {
      throw new Error('AI processing timed out. Please try with shorter content.');
    } else {
      throw new Error('AI processing failed: ' + error.message);
    }
  }
}

// Generate simple text file instead of PDF for now
function generateTextFile(simplifiedText) {
  return Buffer.from(`SIMPLIFIED NOTES\n\n${simplifiedText} `, 'utf-8');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Notes Simplifier API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    console.log('Upload request received');

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file size
    if (req.file.size === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

    // Extract text from file
    console.log('Extracting text from file...');
    const extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No readable text found in the uploaded file' });
    }

    console.log('Text extracted, length:', extractedText.length);

    // Simplify using Gemini
    console.log('Sending to Gemini AI...');
    const simplifiedNotes = await simplifyNotes(extractedText);
    console.log('AI processing complete, response length:', simplifiedNotes.length);

    res.json({
      success: true,
      simplifiedNotes,
      originalLength: extractedText.length,
      simplifiedLength: simplifiedNotes.length
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a simple text processing endpoint
app.post('/api/process-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'No text provided' });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    if (text.length > 200000) { // 200k character limit
      return res.status(400).json({ error: 'Text is too long. Please limit to 200,000 characters.' });
    }

    // Simplify using Gemini
    console.log('Processing text with Gemini AI, length:', text.length);
    const simplifiedNotes = await simplifyNotes(text);
    console.log('AI processing complete, response length:', simplifiedNotes.length);

    res.json({
      success: true,
      simplifiedNotes,
      originalLength: text.length,
      simplifiedLength: simplifiedNotes.length
    });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-pdf', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const textBuffer = generateTextFile(text);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=simplified-notes.txt');
    res.send(textBuffer);
  } catch (error) {
    console.error('Error generating file:', error);
    res.status(500).json({ error: 'Failed to generate file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});