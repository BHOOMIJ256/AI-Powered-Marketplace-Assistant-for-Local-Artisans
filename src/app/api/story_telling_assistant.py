#!/usr/bin/env python3
"""
Smart Speech to Text Converter with AI Response Generator + FastAPI
Uses Google Cloud Speech API + Google Generative AI (Gemini)
Converts audio files to text and generates AI responses
Works with common audio formats without requiring external conversion tools
Provides both CLI and REST API interfaces
Now supports optional image input for multimodal LLM content generation.
"""

import os
import struct
import tempfile
import base64
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from google.cloud import speech
from google.cloud.speech import RecognitionConfig, RecognitionAudio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Speech-to-Text + AI Response Generator API",
    description="Convert audio to text and generate AI responses using Google APIs",
    version="1.1.0"
)

# ---------------- Pydantic models ----------------

class TranscriptionRequest(BaseModel):
    language_code: str = "en-US"

class TranscriptionResponse(BaseModel):
    success: bool
    transcription: Optional[str] = None
    confidence: Optional[float] = None
    word_count: Optional[int] = None
    character_count: Optional[int] = None
    error: Optional[str] = None

class AIResponseRequest(BaseModel):
    text: str
    model_name: str = "gemini-1.5-flash"
    image_base64: Optional[str] = None  # Optional image as base64 string

class AIResponseResponse(BaseModel):
    success: bool
    ai_response: Optional[str] = None
    error: Optional[str] = None

class CombinedRequest(BaseModel):
    language_code: str = "en-US"
    generate_ai_response: bool = True
    model_name: str = "gemini-1.5-flash"

class CombinedResponse(BaseModel):
    success: bool
    transcription: Optional[str] = None
    confidence: Optional[float] = None
    word_count: Optional[int] = None
    character_count: Optional[int] = None
    ai_response: Optional[str] = None
    error: Optional[str] = None

# ---------------- Audio utilities ----------------

def read_wav_header(audio_file_path):
    try:
        with open(audio_file_path, 'rb') as f:
            riff = f.read(4)
            if riff != b'RIFF':
                return None, None
            f.read(4)
            wave = f.read(4)
            if wave != b'WAVE':
                return None, None
            while True:
                chunk_id = f.read(4)
                if not chunk_id:
                    break
                chunk_size = struct.unpack('<I', f.read(4))[0]
                if chunk_id == b'fmt ':
                    audio_format = struct.unpack('<H', f.read(2))[0]
                    num_channels = struct.unpack('<H', f.read(2))[0]
                    sample_rate = struct.unpack('<I', f.read(4))[0]
                    byte_rate = struct.unpack('<I', f.read(4))[0]
                    block_align = struct.unpack('<H', f.read(2))[0]
                    bits_per_sample = struct.unpack('<H', f.read(2))[0]
                    return sample_rate, bits_per_sample
                else:
                    f.seek(chunk_size, 1)
    except Exception as e:
        print(f"⚠️  Could not read WAV header: {e}")
        return None, None

def detect_audio_format(audio_file_path):
    try:
        with open(audio_file_path, 'rb') as f:
            header = f.read(16)
            if header.startswith(b'\x1a\x45\xdf\xa3'):
                return 'webm', speech.RecognitionConfig.AudioEncoding.OGG_OPUS, None
            elif header.startswith(b'OggS'):
                return 'ogg', speech.RecognitionConfig.AudioEncoding.OGG_OPUS, None
            elif header.startswith(b'RIFF') and header[8:12] == b'WAVE':
                sample_rate, bits_per_sample = read_wav_header(audio_file_path)
                if sample_rate:
                    return 'wav', speech.RecognitionConfig.AudioEncoding.LINEAR16, sample_rate
                else:
                    return 'wav', speech.RecognitionConfig.AudioEncoding.LINEAR16, 16000
            elif header.startswith(b'\xff\xfb') or header.startswith(b'ID3'):
                return 'mp3', speech.RecognitionConfig.AudioEncoding.MP3, 16000
            elif header.startswith(b'\x00\x00\x00\x20ftypM4A'):
                return 'm4a', speech.RecognitionConfig.AudioEncoding.MP3, 16000
            elif header.startswith(b'fLaC'):
                return 'flac', speech.RecognitionConfig.AudioEncoding.FLAC, 16000
            else:
                return 'unknown', speech.RecognitionConfig.AudioEncoding.LINEAR16, 16000
    except Exception as e:
        print(f"⚠️  Header detection failed: {e}")
        return None, None, None

def get_audio_encoding_and_config(audio_file_path):
    actual_format, encoding, sample_rate = detect_audio_format(audio_file_path)
    if actual_format and encoding:
        print(f"🔍 Actual file format detected: {actual_format.upper()}")
        if sample_rate:
            print(f"🔍 Sample rate: {sample_rate} Hz")
        return encoding, sample_rate
    file_extension = audio_file_path.lower().split('.')[-1]
    print(f"⚠️  Using extension-based detection: {file_extension.upper()}")
    if file_extension == 'wav':
        sample_rate, bits_per_sample = read_wav_header(audio_file_path)
        if sample_rate:
            print(f"🔍 WAV file sample rate: {sample_rate} Hz")
            return speech.RecognitionConfig.AudioEncoding.LINEAR16, sample_rate
        else:
            return speech.RecognitionConfig.AudioEncoding.LINEAR16, 16000
    elif file_extension == 'mp3':
        return speech.RecognitionConfig.AudioEncoding.MP3, 16000
    elif file_extension == 'm4a':
        return speech.RecognitionConfig.AudioEncoding.MP3, 16000
    elif file_extension == 'flac':
        return speech.RecognitionConfig.AudioEncoding.FLAC, 16000
    elif file_extension in ['ogg', 'webm']:
        return speech.RecognitionConfig.AudioEncoding.OGG_OPUS, None
    else:
        return speech.RecognitionConfig.AudioEncoding.LINEAR16, 16000

# ---------------- Core Functions ----------------

def convert_speech_to_text(audio_file_path, language_code="en-US"):
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if not credentials_path:
        return {"success": False, "error": "GOOGLE_APPLICATION_CREDENTIALS not found in .env file"}
    if not os.path.exists(credentials_path):
        return {"success": False, "error": f"Credentials file not found at: {credentials_path}"}
    if not os.path.exists(audio_file_path):
        return {"success": False, "error": f"Audio file not found: {audio_file_path}"}
    try:
        client = speech.SpeechClient()
        with open(audio_file_path, "rb") as audio_file:
            content = audio_file.read()
        encoding, sample_rate = get_audio_encoding_and_config(audio_file_path)
        audio = RecognitionAudio(content=content)
        if encoding == speech.RecognitionConfig.AudioEncoding.OGG_OPUS:
            config = RecognitionConfig(
                encoding=encoding,
                language_code=language_code,
                enable_automatic_punctuation=True,
                enable_word_confidence=True,
            )
        else:
            config = RecognitionConfig(
                encoding=encoding,
                sample_rate_hertz=sample_rate,
                language_code=language_code,
                enable_automatic_punctuation=True,
                enable_word_confidence=True,
            )
        response = client.recognize(config=config, audio=audio)
        if response.results:
            transcription = ""
            confidence_scores = []
            for result in response.results:
                if result.alternatives:
                    transcription += result.alternatives[0].transcript + " "
                    confidence_scores.append(result.alternatives[0].confidence)
            avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
            return {
                "success": True,
                "transcription": transcription.strip(),
                "confidence": avg_confidence,
                "word_count": len(transcription.split()),
                "character_count": len(transcription)
            }
        else:
            return {
                "success": True,
                "transcription": "No speech detected in the audio file.",
                "confidence": 0.0,
                "word_count": 0,
                "character_count": 0
            }
    except Exception as e:
        return {"success": False, "error": f"Error during transcription: {e}"}

def generate_ai_response(text_input, model_name="gemini-1.5-flash", image_base64: Optional[str] = None):
    try:
        import google.generativeai as genai
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            return {"success": False, "error": "GOOGLE_API_KEY not found in .env file"}
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        prompt_parts = [text_input]
        if image_base64:
            prompt_parts.append({
                "mime_type": "image/png",
                "data": base64.b64decode(image_base64)
            })
        response = model.generate_content(prompt_parts)
        if response.text:
            return {"success": True, "ai_response": response.text.strip()}
        else:
            return {"success": False, "error": "Could not generate response"}
    except Exception as e:
        return {"success": False, "error": f"Error generating AI response: {e}"}

# ---------------- FastAPI Endpoints ----------------

@app.get("/")
async def root():
    return {
        "message": "Speech-to-Text + AI Response Generator API",
        "version": "1.1.0",
        "endpoints": {
            "POST /transcribe": "Convert audio file to text",
            "POST /generate-ai-response": "Generate AI response from text + optional image",
            "POST /transcribe-and-respond": "Combined transcription + AI response (with optional image)",
            "GET /health": "Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...), language_code: str = Form("en-US")):
    try:
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        try:
            result = convert_speech_to_text(temp_file_path, language_code)
            if result["success"]:
                return TranscriptionResponse(
                    success=True,
                    transcription=result.get("transcription"),
                    confidence=result.get("confidence"),
                    word_count=result.get("word_count"),
                    character_count=result.get("character_count")
                )
            else:
                return TranscriptionResponse(success=False, error=result.get("error"))
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/generate-ai-response", response_model=AIResponseResponse)
async def generate_ai_response_endpoint(
    text: str = Form(...),
    model_name: str = Form("gemini-1.5-flash"),
    image: Optional[UploadFile] = File(None)
):
    try:
        image_base64 = None
        if image:
            image_bytes = await image.read()
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        result = generate_ai_response(text, model_name, image_base64)
        if result["success"]:
            return AIResponseResponse(success=True, ai_response=result.get("ai_response"))
        else:
            return AIResponseResponse(success=False, error=result.get("error"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation error: {str(e)}")

@app.post("/transcribe-and-respond", response_model=CombinedResponse)
async def transcribe_and_respond(
    file: UploadFile = File(...),
    language_code: str = Form("en-US"),
    generate_ai_response: bool = Form(True),
    model_name: str = Form("gemini-1.5-flash"),
    image: Optional[UploadFile] = File(None)
):
    try:
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        try:
            transcription_result = convert_speech_to_text(temp_file_path, language_code)
            if not transcription_result["success"]:
                return CombinedResponse(success=False, error=transcription_result.get("error"))
            ai_response_result = None
            if generate_ai_response and transcription_result.get("transcription") != "No speech detected in the audio file.":
                image_base64 = None
                if image:
                    image_bytes = await image.read()
                    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                ai_response_result = generate_ai_response(
                    transcription_result["transcription"], model_name, image_base64
                )
            return CombinedResponse(
                success=True,
                transcription=transcription_result.get("transcription"),
                confidence=transcription_result.get("confidence"),
                word_count=transcription_result.get("word_count"),
                character_count=transcription_result.get("character_count"),
                ai_response=ai_response_result.get("ai_response") if ai_response_result and ai_response_result["success"] else None
            )
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

# ---------------- CLI ----------------

def main():
    print("🎤 Smart Speech to Text + AI Response Generator")
    print("=" * 60)
    audio_file = input("Enter the path to your audio file: ").strip()
    if not audio_file:
        print("❌ No file path provided. Exiting.")
        return
    language = input("Enter language code (default: en-US): ").strip()
    if not language:
        language = "en-US"
    result = convert_speech_to_text(audio_file, language)
    if result["success"] and result.get("transcription") != "No speech detected in the audio file.":
        print("\n📝 TRANSCRIPTION RESULT:")
        print(result["transcription"])
        print(f"📊 Words: {result.get('word_count', 0)}")
        print(f"📊 Characters: {result.get('character_count', 0)}")
        print(f"🎯 Confidence: {result.get('confidence', 0):.2%}")
        generate_ai = input("🤖 Generate AI response? (y/n): ").strip().lower()
        if generate_ai in ['y', 'yes', '1']:
            image_path = input("📷 Optional: Enter path to an image (or press Enter to skip): ").strip()
            image_base64 = None
            if image_path and os.path.exists(image_path):
                with open(image_path, "rb") as img_file:
                    image_base64 = base64.b64encode(img_file.read()).decode("utf-8")
            ai_response = generate_ai_response(result["transcription"], image_base64=image_base64)
            if ai_response["success"]:
                print("\n🤖 AI RESPONSE:")
                print(ai_response["ai_response"])
            else:
                print(f"❌ Failed: {ai_response.get('error')}")
    elif result.get("transcription") == "No speech detected in the audio file.":
        print("❌ No speech detected in the audio file.")
    else:
        print(f"❌ Failed: {result.get('error')}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--api":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        main()
