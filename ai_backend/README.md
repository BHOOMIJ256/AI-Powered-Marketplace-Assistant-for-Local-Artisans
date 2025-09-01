# AI Backend for Artisan Story Generator

This FastAPI backend provides AI-powered content generation using:
- **Whisper**: Speech-to-text transcription
- **Qwen-VL**: Multimodal AI for image + text understanding and content generation

## Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run the backend:**
```bash
cd ai_backend
python main.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST `/generate-story`
Accepts multipart form data:
- `image`: Product photo (required)
- `audio`: Voice note (optional)
- `note`: Text note (optional)

Returns generated:
- Product description
- Instagram caption  
- Relevant hashtags

### GET `/health`
Health check endpoint showing model loading status.

## Model Details

- **Whisper**: Uses "base" model for speed (can upgrade to "small" or "medium" for better accuracy)
- **Qwen-VL**: Multimodal model that understands both images and text
- **Device**: Automatically uses GPU if available, falls back to CPU

## First Run

On first startup, the backend will download:
- Whisper model (~244MB)
- Qwen-VL model (~7GB)

This may take several minutes depending on your internet connection.

## Performance Notes

- **CPU**: Generation takes 10-30 seconds
- **GPU**: Generation takes 2-8 seconds
- **Memory**: Requires ~8GB RAM minimum

## Troubleshooting

1. **CUDA out of memory**: Reduce batch size or use CPU
2. **Model download fails**: Check internet connection, retry
3. **Slow generation**: Consider using smaller Whisper model or CPU-only mode

## Integration with Next.js

The frontend calls this backend at `http://localhost:8000/generate-story` when the AI backend is running.
