from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import whisper
import torch
from transformers import AutoProcessor, AutoModelForCausalLM
from PIL import Image
import io
import os
from typing import Optional
import json

app = FastAPI(title="Artisan Story Generator API")

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models (load once)
whisper_model = None
qwen_processor = None
qwen_model = None

@app.on_event("startup")
async def load_models():
    global whisper_model, qwen_processor, qwen_model
    
    print("Loading Whisper model...")
    whisper_model = whisper.load_model("base")  # base model for speed
    
    print("Loading Qwen-VL model...")
    model_name = "Qwen/Qwen-VL-Chat"
    qwen_processor = AutoProcessor.from_pretrained(model_name)
    qwen_model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="auto" if torch.cuda.is_available() else "cpu"
    )
    print("Models loaded successfully!")

@app.post("/generate-story")
async def generate_story(
    image: UploadFile = File(...),
    audio: Optional[UploadFile] = File(None),
    note: Optional[str] = Form(None)
):
    try:
        # 1. Process image
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # 2. Process audio/voice note
        transcript = ""
        if audio:
            print("Transcribing audio with Whisper...")
            audio_data = await audio.read()
            temp_audio_path = f"temp_audio_{audio.filename}"
            with open(temp_audio_path, "wb") as f:
                f.write(audio_data)
            
            result = whisper_model.transcribe(temp_audio_path)
            transcript = result["text"].strip()
            
            # Clean up temp file
            os.remove(temp_audio_path)
        
        # Use note if no audio transcript
        if not transcript and note:
            transcript = note.strip()
        
        # 3. Generate with Qwen-VL
        print("Generating content with Qwen-VL...")
        
        # Prepare prompt for Qwen-VL
        if transcript:
            prompt = f"<image>\nUser: This is a photo of my handmade product. I want to describe it as: {transcript}\n\nPlease generate:\n1. A detailed product description (2-3 sentences)\n2. An engaging Instagram caption (1-2 sentences)\n3. 5-7 relevant hashtags\n\nAssistant: I'll help you create engaging content for your handmade product. Let me analyze the image and your description."
        else:
            prompt = f"<image>\nUser: This is a photo of my handmade product. Please generate:\n1. A detailed product description (2-3 sentences)\n2. An engaging Instagram caption (1-2 sentences)\n3. 5-7 relevant hashtags\n\nAssistant: I'll help you create engaging content for your handmade product. Let me analyze the image."
        
        # Process with Qwen-VL
        inputs = qwen_processor(
            prompt,
            pil_image,
            return_tensors="pt"
        )
        
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}
        
        # Generate response
        with torch.no_grad():
            generated_ids = qwen_model.generate(
                **inputs,
                max_new_tokens=512,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                pad_token_id=qwen_processor.tokenizer.eos_token_id
            )
        
        response = qwen_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        # Parse response to extract description, caption, and hashtags
        content = parse_qwen_response(response)
        
        # Fallback if parsing fails
        if not content:
            content = {
                "description": f"This beautiful handmade product showcases traditional craftsmanship. {transcript if transcript else 'The artisan has poured their heart into creating this unique piece.'}",
                "caption": f"Handcrafted with love and tradition! {transcript if transcript else 'Every stitch tells a story.'}",
                "hashtags": ["Handmade", "LocalArtisan", "MadeInIndia", "Sustainable", "CraftCulture", "TraditionalCraft"]
            }
        
        return JSONResponse({
            "success": True,
            "data": {
                "description": content["description"],
                "caption": content["caption"],
                "hashtags": content["hashtags"],
                "title": image.filename.replace("_", " ").replace("-", " ").replace(".", " ").strip()
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Generation failed: {str(e)}"}
        )

def parse_qwen_response(response: str) -> dict:
    """Parse Qwen-VL response to extract structured content"""
    try:
        # Look for numbered sections
        lines = response.split('\n')
        description = ""
        caption = ""
        hashtags = []
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect sections
            if "1." in line or "description" in line.lower():
                current_section = "description"
                description = line.replace("1.", "").replace("Description:", "").strip()
            elif "2." in line or "caption" in line.lower():
                current_section = "caption"
                caption = line.replace("2.", "").replace("Caption:", "").strip()
            elif "3." in line or "hashtag" in line.lower():
                current_section = "hashtags"
                hashtag_line = line.replace("3.", "").replace("Hashtags:", "").strip()
                # Extract hashtags
                hashtags = [h.strip() for h in hashtag_line.split() if h.startswith("#")]
                if not hashtags:
                    # If no # found, split by common separators
                    hashtags = [h.strip() for h in hashtag_line.replace(",", " ").replace(";", " ").split() if h.strip()]
            elif current_section == "description" and description:
                description += " " + line
            elif current_section == "caption" and caption:
                caption += " " + line
            elif current_section == "hashtags" and hashtags:
                # Continue collecting hashtags
                new_tags = [h.strip() for h in line.replace(",", " ").replace(";", " ").split() if h.strip()]
                hashtags.extend(new_tags)
        
        # Clean up and validate
        if description and caption and hashtags:
            # Ensure hashtags don't have # prefix
            hashtags = [h.replace("#", "") for h in hashtags if h.replace("#", "").strip()]
            # Limit hashtags
            hashtags = hashtags[:7]
            
            return {
                "description": description.strip(),
                "caption": caption.strip(),
                "hashtags": hashtags
            }
        
    except Exception as e:
        print(f"Error parsing response: {e}")
    
    return {}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": {
        "whisper": whisper_model is not None,
        "qwen_vl": qwen_model is not None
    }}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
