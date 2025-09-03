# Python Services Setup Guide

This guide explains how to set up and run the AI Storytelling and AR Try-On Python services that integrate with your Next.js application.

## 🎤 AI Storytelling Service

### Features
- **Speech-to-Text**: Converts audio files to text using Google Cloud Speech API
- **AI Response Generation**: Generates product stories using Google Gemini AI
- **Multimodal Support**: Processes both images and audio for enhanced storytelling
- **Multiple Audio Formats**: Supports WAV, MP3, M4A, FLAC, OGG, WebM

### Setup Instructions

1. **Install Python Dependencies**
   ```bash
   pip install fastapi uvicorn google-cloud-speech google-generativeai python-dotenv python-multipart
   ```

2. **Set up Google Cloud Credentials**
   - Create a Google Cloud project
   - Enable Speech-to-Text API and Vertex AI API
   - Download service account credentials JSON file
   - Set environment variable:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/credentials.json"
     ```

3. **Get Google AI API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Set environment variable:
     ```bash
     export GOOGLE_API_KEY="your_gemini_api_key"
     ```

4. **Run the Service**
   ```bash
   cd src/app/api
   python story_telling_assistant.py --api
   ```
   The service will run on `http://localhost:8000`

### API Endpoints
- `GET /` - Service information
- `GET /health` - Health check
- `POST /transcribe` - Convert audio to text
- `POST /generate-ai-response` - Generate AI response from text + image
- `POST /transcribe-and-respond` - Combined transcription + AI response

## 📱 AR Try-On Service

### Features
- **Real-time AR Overlay**: Overlays product images on webcam feed
- **Interactive Controls**: Resize with +/- keys, save snapshots
- **Multiple Product Support**: Works with any product image
- **Cross-platform**: Works on Windows, macOS, Linux

### Setup Instructions

1. **Install Python Dependencies**
   ```bash
   pip install opencv-python numpy
   ```

2. **Prepare Product Images**
   - Place product images in the same directory as the script
   - Supported formats: PNG (with transparency), JPG, JPEG
   - For best results, use PNG with transparent background

3. **Run the Service**
   ```bash
   cd src/app/api
   python 2_D_AR.py --product "your_product_image.png"
   ```

### Controls
- `+` or `=` - Increase product size
- `-` or `_` - Decrease product size
- `p` - Save snapshot
- `q` or `ESC` - Quit application

## 🔧 Integration with Next.js

### Environment Variables
Add these to your `.env.local` file:
```env
STORYTELLING_API_URL=http://localhost:8000
AR_API_URL=http://localhost:8001
```

### Service Status
The Next.js application will automatically detect if the Python services are running:
- **AI Backend Available**: Full AI-powered story generation
- **Template Mode**: Fallback to template-based story generation
- **AR Service**: Provides instructions for starting AR sessions

## 🚀 Production Deployment

### For AI Storytelling Service
1. **Deploy to Cloud Run or similar service**
2. **Set up proper authentication**
3. **Update environment variables in production**

### For AR Try-On Service
1. **Package as desktop application** (using PyInstaller)
2. **Distribute to users** or run on local machines
3. **Provide installation instructions**

## 🛠️ Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Ensure browser has microphone access
   - Check browser settings for microphone permissions
   - Use HTTPS in production (required for microphone access)

2. **Google Cloud API Errors**
   - Verify credentials file path
   - Check API quotas and billing
   - Ensure required APIs are enabled

3. **AR Service Not Starting**
   - Check camera permissions
   - Verify OpenCV installation
   - Ensure product image exists

4. **Audio Format Issues**
   - Try different audio formats
   - Check file size (should be under 10MB)
   - Ensure audio has clear speech

### Debug Mode
Run services with debug output:
```bash
# AI Service
python story_telling_assistant.py --api --debug

# AR Service
python 2_D_AR.py --product "image.png" --debug
```

## 📝 Usage Examples

### AI Storytelling
1. Upload a product image
2. Record voice note or type description
3. Click "Generate Story"
4. Get AI-generated description, caption, and hashtags
5. Download as poster or copy text

### AR Try-On
1. Click "Try in AR" on any product
2. Allow camera access
3. Use controls to resize and position product
4. Save snapshots of your try-on experience
5. Share or use for purchase decisions

## 🔒 Security Notes

- Keep API keys secure and never commit them to version control
- Use environment variables for all sensitive configuration
- Implement proper authentication for production deployments
- Consider rate limiting for API endpoints

## 📞 Support

For issues with the Python services:
1. Check the troubleshooting section above
2. Verify all dependencies are installed correctly
3. Check service logs for error messages
4. Ensure all environment variables are set properly
