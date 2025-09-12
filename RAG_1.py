
import os


from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings , ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain_google_vertexai import ChatVertexAI, VertexAIEmbeddings




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

load_dotenv()
#-------------------------------------------RAG-----------------------------------------------------------
doc = {
    "sahil is the best student in RA Podar college of commerence and economics",
    "Pradnya is the worst teacher in RA Podar college of commerence and economics",
    "TYBSC has the better classrooms in RA Podar college of commerence and economics",
    "RA Podar college of commerence and economics offer the courses such as BSC in  data science and computer science",
    "RA Podar college of commerence and economics was established in 1942 by Dr. P. S. Podar",
    "divya lalwani is the co-ordinator of RA Podar college of commerence and economics"
}

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.create_documents(doc)


embedding_model = HuggingFaceEmbeddings(model_name = 'sentence-transformers/all-MiniLM-L6-v2')
vector_store = FAISS.from_documents(chunks, embedding_model)

retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4})
#retriever.invoke('What is deepmind')


chat_model= ChatVertexAI(
    model="gemini-2.5-pro",   # You can swap model names easily
    temperature=0.2,
    max_tokens=None
           
)


prompt = PromptTemplate(
    template="""
      You are a helpful assistant.
      Answer ONLY from the provided  context.
      If the context is insufficient, just say you don't know.

      {context}
      Question: {question}
    """,
    input_variables = ['context', 'question']
)

def format_docs(retrieved_docs):
  context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
  return context_text


parallel_chain = RunnableParallel({
    'context': retriever | RunnableLambda(format_docs),
    'question': RunnablePassthrough()
})


parser = StrOutputParser()
main_chain = parallel_chain | prompt | chat_model | parser




#----------------------------------------------------speech-to-text---------------------------------------------

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
    if result["success"]:
        print("\n🔍 Speech Recognition Result:")
        print(f"Transcription: {result['transcription']}")
        print(f"Confidence: {result['confidence']:.2f}")
        print(f"Word Count: {result['word_count']}")
        print(f"Character Count: {result['character_count']}")
    else:
        print("\n❌ Error occurred:")
        print(result["error"])
    print("\n🤖 AI Response:")
    print(main_chain.invoke(result['transcription']))
if __name__ == "__main__":
    main()


































