# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Failed to process content. Please try again"

**Possible Causes:**
1. **API Key Issues** - Invalid or missing Gemini API key
2. **Network Problems** - Connection issues between frontend and backend
3. **Server Not Running** - Backend server is not started
4. **Content Too Large** - Input text is too long for processing
5. **API Quota Exceeded** - Gemini API limits reached

**Solutions:**

#### 1. Check API Key
```bash
# Verify your .env file
cat backend/.env
# Should show: GEMINI_API_KEY=your_actual_key_here
```

#### 2. Verify Server is Running
```bash
# Check if backend is running
curl http://localhost:5000/api/health
# Should return: {"status":"OK",...}
```

#### 3. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run backend    # Terminal 1
npm run frontend   # Terminal 2
```

#### 4. Test Backend Directly
```bash
cd backend
node test-simple.js
# Should show successful response
```

#### 5. Check Browser Console
- Open browser Developer Tools (F12)
- Look for error messages in Console tab
- Check Network tab for failed requests

### ❌ "Request timed out"

**Solutions:**
- Try with shorter text (under 10,000 characters)
- Check internet connection
- Restart the backend server

### ❌ "Server error: Internal server error"

**Solutions:**
- Check backend console for error details
- Verify Gemini API key is valid
- Restart the backend server

### ❌ "Network error"

**Solutions:**
- Ensure backend is running on port 5000
- Check if another application is using port 5000
- Try restarting both frontend and backend

## 🧪 Testing Steps

### 1. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### 2. Test Text Processing
```bash
cd backend
node test-simple.js
```

### 3. Test Frontend Build
```bash
cd frontend
npm run build
```

### 4. Check Logs
- Backend: Check terminal running `npm run backend`
- Frontend: Check browser console (F12)

## 🔍 Debug Mode

### Enable Detailed Logging
The app now includes detailed console logging. Check:
- Browser console for frontend errors
- Backend terminal for server errors
- Network tab in browser for API call details

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Invalid API key" | Gemini API key is wrong | Update `.env` file |
| "API quota exceeded" | Too many requests | Wait or upgrade API plan |
| "No text provided" | Empty input | Enter some text |
| "Text is too long" | Input exceeds limit | Reduce text length |

## 📞 Still Having Issues?

1. **Check all files are saved**
2. **Restart both servers**
3. **Clear browser cache**
4. **Try a different browser**
5. **Check your Gemini API key is active**

## ✅ Working Configuration

When everything works correctly, you should see:
- Backend: "Server running on port 5000"
- Frontend: App loads at http://localhost:3000
- Test: `node test-simple.js` shows success
- Health: `curl localhost:5000/api/health` returns OK