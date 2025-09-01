import os
import requests
from typing import Optional, Literal
from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from langchain_huggingface import HuggingFaceEmbeddings, ChatHuggingFace, HuggingFaceEndpoint
from langchain.vectorstores.faiss import FAISS
from langchain.docstore.document import Document
from langchain_core.messages import HumanMessage, SystemMessage
from pathlib import Path
from dotenv import load_dotenv


# ------------------------------------------------------
# 1. Config
# Read Hugging Face token from environment. Set it before running the server.

load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN", "")
if not HF_TOKEN:
    raise RuntimeError("Missing HUGGINGFACEHUB_API_TOKEN environment variable. Set your HF token before starting the API.")

# Directory to persist the FAISS vectorstore
VECTORSTORE_DIR = Path(_file_).parent / "vectorstore"
VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------
# 2. Build/Load FAISS DB (Persistent)
# Seed documents for demo. Replace with your corpus as needed.
documents = [
    "Mumbai is the financial capital of India.",
    "Mumbai is the capital of Maharashtra state.",
    "The city was originally a group of seven islands.",
    "The name Mumbai comes from Mumbā Devī, the local goddess.",
    "Earlier, the British called it Bombay.",
    "Mumbai is the most populous city in India (20+ million in metro).",
    "Mumbai contributes over 6% to India’s GDP.",
    "The city lies on the Konkan coast along the Arabian Sea.",
    "It has the deepest natural harbor in India.",
    "Mumbai has the second busiest airport in India — Chhatrapati Shivaji Maharaj International Airport.",
    "The islands were given to the British as dowry in 1661 when Catherine of Braganza married Charles II of England.",
    "The Gateway of India was built in 1924 to welcome King George V and Queen Mary.",
    "Chhatrapati Shivaji Maharaj Terminus (CST) is a UNESCO World Heritage Site.",
    "Mumbai was once home to the world’s largest textile industry.",
    "Bollywood, the Hindi film industry, is based in Mumbai.",
    "Mumbai’s Dabbawalas deliver 200,000+ tiffin boxes daily with incredible accuracy.",
    "The city celebrates the Ganesh Chaturthi festival with unmatched grandeur.",
    "Mumbai has Asia’s largest slum, Dharavi, a hub for small-scale industries.",
    "The Elephanta Caves near Mumbai are a UNESCO World Heritage Site.",
    "Mumbai has one of the oldest stock exchanges in Asia — BSE (est. 1875).",
    "Mumbai has India’s most expensive house — Antilia (Mukesh Ambani’s residence).",
    "Marine Drive is called the Queen’s Necklace when lit at night.",
    "Mumbai is India’s wealthiest city, housing the highest number of billionaires.",
    "The Mumbai Suburban Railway carries over 7 million passengers daily.",
    "The Bandra-Worli Sea Link is an engineering marvel of the city.",
    "Mumbai is India’s largest port city for commercial shipping.",
    "Mumbai is known for heavy monsoons that can cause flooding.",
    "Mumbai has India’s most expensive real estate market.",
    "The Mumbai Police is one of the largest city police forces in the world.",
    "Mumbai is called the City of Dreams because millions come here for opportunities."
]

docs = [Document(page_content=text) for text in documents]

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Try to load an existing vectorstore; if not found, create and persist it.
faiss_db: FAISS
if (VECTORSTORE_DIR / "index.faiss").exists():
    faiss_db = FAISS.load_local(
        str(VECTORSTORE_DIR),
        embeddings=embedding_model,
        allow_dangerous_deserialization=True,
    )
else:
    faiss_db = FAISS.from_documents(docs, embedding_model)
    faiss_db.save_local(str(VECTORSTORE_DIR))


def retrieve_docs(query: str, k: int = 5):
    return faiss_db.similarity_search(query, k=k)

# ------------------------------------------------------
# 3. Setup LLM (Qwen via HF API)
llm = HuggingFaceEndpoint(
    repo_id="Qwen/Qwen3-4B-Instruct-2507",
    task="text-generation",
    huggingfacehub_api_token=HF_TOKEN,
)
chat_model = ChatHuggingFace(llm=llm)


def get_system_prompt(mode: Literal["content", "guide"]) -> str:
    if mode == "content":
        return (
            "You are a creative content generator for social media posts. "
            "Use the provided context when relevant. Keep it concise, engaging, and helpful."
        )
    # default to guide
    return (
        "You are a helpful website assistant that guides users through features and answers questions. "
        "Use the provided context as authoritative when applicable."
    )


def rag_answer(query: str, k: int = 5, mode: Literal["content", "guide"] = "guide") -> str:
    context_docs = retrieve_docs(query, k=k)
    context = "\n---\n".join([d.page_content for d in context_docs])
    messages = [
        SystemMessage(content=get_system_prompt(mode)),
        HumanMessage(content=f"Context:\n{context}\n\nQuestion: {query}")
    ]
    response = chat_model.invoke(messages)
    return response.content.strip()

# ------------------------------------------------------
# 4. HuggingFace STT (Whisper) + TTS (Kokoro)

def speech_to_text(audio_bytes: bytes, hf_model: str = "openai/whisper-small") -> str:
    url = f"https://api-inference.huggingface.co/models/{hf_model}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    resp = requests.post(url, headers=headers, data=audio_bytes, timeout=120)
    resp.raise_for_status()
    result = resp.json()
    return result.get("text", str(result))


def text_to_speech(text: str, out_path: str = "rag_response.wav", hf_model: str = "hexgrad/Kokoro-82M") -> str:
    url = f"https://api-inference.huggingface.co/models/{hf_model}"
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Accept": "audio/wav",
        "Content-Type": "application/json"
    }
    resp = requests.post(url, headers=headers, json={"inputs": text}, timeout=120)
    resp.raise_for_status()
    if "audio" in resp.headers.get("content-type", ""):
        with open(out_path, "wb") as f:
            f.write(resp.content)
        return out_path
    return resp.text

# ------------------------------------------------------
# 5. FastAPI app
app = FastAPI()


class TextQuery(BaseModel):
    query: str
    k: Optional[int] = 5
    mode: Literal["content", "guide"] = "guide"

    @validator("k")
    def validate_k(cls, v):
        if v is not None and (v <= 0 or v > 50):
            raise ValueError("k must be between 1 and 50")
        return v


@app.post("/rag/text")
def rag_text(payload: TextQuery):
    answer = rag_answer(payload.query, k=payload.k or 5, mode=payload.mode)
    return {"text": answer}


@app.post("/rag/speech")
async def rag_speech(
    file: UploadFile,
    k: int = Form(5),
    mode: Literal["content", "guide"] = Form("guide"),
    return_audio: bool = Form(True),
):
    audio_bytes = await file.read()
    transcript = speech_to_text(audio_bytes)
    answer = rag_answer(transcript, k=k, mode=mode)
    if return_audio:
        out_path = "rag_response.wav"
        tts_file = text_to_speech(answer, out_path)
        return JSONResponse({"transcript": transcript, "text": answer, "audio_file": tts_file})
    return {"transcript": transcript, "text": answer}