import os
import tempfile
import shutil
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables first
load_dotenv()

# Initialize Vertex AI with project configuration
VERTEXAI_ENABLED = False
try:
    import vertexai
    from langchain_google_vertexai import ChatVertexAI
    
    # Get project ID from environment variable
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
    
    if not project_id:
        logger.warning("GOOGLE_CLOUD_PROJECT environment variable not set")
        raise ValueError("GOOGLE_CLOUD_PROJECT not configured")
    
    # Try multiple locations in order of preference
    locations_to_try = [
        os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1'),  # User preference or default
        'us-east1',
        'us-west1', 
        'europe-west1',
        'asia-southeast1'
    ]
    
    for location in locations_to_try:
        try:
            vertexai.init(project=project_id, location=location)
            VERTEXAI_ENABLED = True
            logger.info(f"✅ Vertex AI initialized for project: {project_id} in {location}")
            break
        except Exception as loc_error:
            logger.warning(f"Failed to initialize Vertex AI in {location}: {loc_error}")
            continue
    
    if not VERTEXAI_ENABLED:
        raise Exception("Failed to initialize Vertex AI in any available region")
    
except ImportError as e:
    VERTEXAI_ENABLED = False
    logger.warning(f"⚠️ Vertex AI not available: {e}")
except Exception as e:
    VERTEXAI_ENABLED = False
    logger.warning(f"⚠️ Failed to initialize Vertex AI: {e}")

# Import LangChain components with error handling
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_core.prompts import PromptTemplate
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
    from langchain_core.output_parsers import StrOutputParser
    logger.info("✅ LangChain components imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import LangChain components: {e}")
    raise

# For speech processing (if needed)
SPEECH_ENABLED = False
try:
    from google.cloud import speech, texttospeech
    
    # Check if credentials are available
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if credentials_path and os.path.exists(credentials_path):
        SPEECH_ENABLED = True
        logger.info("✅ Google Cloud Speech APIs available")
    else:
        logger.warning("⚠️ Google Cloud credentials not found - Speech APIs disabled")
        
except ImportError as e:
    logger.warning("⚠️ Google Cloud Speech APIs not available - install with: pip install google-cloud-speech google-cloud-texttospeech")

# Initialize FastAPI app
app = FastAPI(
    title="Artisan Helper RAG Bot", 
    description="AI-powered assistant for artisans",
    version="1.0.0"
)

# Serve static files (CSS, JS, images)
static_dir = "static"
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)
    logger.info(f"Created static directory: {static_dir}")

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Pydantic models for API requests
class ChatRequest(BaseModel):
    message: str
    
class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

# Enhanced fallback responses
def get_fallback_response(message: str) -> str:
    """Provide comprehensive fallback responses when AI models are not available"""
    message_lower = message.lower()
    
    # Pricing and business advice
    if any(word in message_lower for word in ['price', 'pricing', 'cost', 'sell', 'money', 'profit']):
        return """**Pricing Your Handmade Products:**

📊 **Cost Calculation:**
1. **Materials**: Track every material used (wood, clay, thread, etc.)
2. **Time**: Log hours spent creating + finishing each piece
3. **Overhead**: Studio rent, utilities, tools, insurance
4. **Skill Premium**: Years of experience and complexity

💰 **Pricing Formula:**
- Basic: (Materials + Labor Hours × Hourly Rate + Overhead) × 2
- Market Position: Research competitor prices
- Value-based: What customers perceive as worth

🎯 **Pro Tips:**
- Don't undervalue your time (minimum $15-25/hour)
- Test pricing with small batches
- Bundle items for higher perceived value"""

    # Tools and equipment
    elif any(word in message_lower for word in ['tool', 'equipment', 'pottery', 'clay', 'wheel']):
        return """**Essential Pottery Tools:**

🔨 **Beginner Tools ($50-100):**
- Wire clay cutter and needle tools
- Wooden ribs and metal scrapers  
- Natural sponges (various sizes)
- Canvas-covered work board

⚙️ **Intermediate Setup ($200-500):**
- Basic pottery wheel (electric or kick wheel)
- Clay wedging board
- Calipers for measuring
- Trimming tools set

🏭 **Advanced Equipment:**
- Kiln access (rental or purchase $800+)
- Glazes and firing supplies
- Proper ventilation system
- Storage and drying racks

Start small and upgrade as your skills develop!"""

    # Marketing and online presence
    elif any(word in message_lower for word in ['market', 'online', 'sell', 'etsy', 'social', 'instagram']):
        return """**Marketing Your Crafts Online:**

📸 **Photography (Most Important):**
- Natural lighting (near windows)
- Multiple angles and detail shots
- Show scale with props
- Consistent style/background

🌐 **Platform Strategy:**
- **Etsy**: Best for handmade discovery
- **Instagram**: Visual storytelling & process videos  
- **Facebook**: Local community engagement
- **Pinterest**: Inspiration and long-term traffic

📱 **Content Ideas:**
- Behind-the-scenes creation videos
- Before/after transformations
- Customer testimonials and usage
- Educational content about your craft

🎯 **SEO Tips:**
- Use relevant keywords in titles
- Tell the story behind each piece
- Respond to messages within 24 hours"""

    # Materials and woodworking
    elif any(word in message_lower for word in ['wood', 'woodwork', 'material', 'lumber']):
        return """**Best Materials for Woodworking:**

🌲 **Beginner-Friendly Woods:**
- **Pine**: Soft, affordable, forgiving for mistakes
- **Poplar**: Stable, takes paint well, minimal grain
- **Cedar**: Aromatic, naturally rot-resistant
- **Basswood**: Perfect for carving, very soft

💪 **Intermediate Woods:**
- **Oak**: Strong grain, traditional furniture wood
- **Maple**: Hard, durable, light color
- **Walnut**: Beautiful dark grain, premium choice

🔧 **Essential Tools ($100-300 start):**
- Quality hand saw or circular saw
- Sharp chisels (1/4", 1/2", 3/4")
- Block plane for smoothing
- Wood glue and clamps
- Safety gear (glasses, dust mask)

⚠️ Always use properly kiln-dried wood to prevent warping!"""

    # Business and legal
    elif any(word in message_lower for word in ['business', 'legal', 'tax', 'license', 'permit']):
        return """**Starting Your Artisan Business:**

📋 **Legal Requirements:**
- Business license (check local requirements)
- Sales tax permit (if selling products)
- Liability insurance for craft fairs
- Trademark for unique brand names

💼 **Business Structure:**
- **Sole Proprietorship**: Simplest for beginners
- **LLC**: Protection for personal assets
- **Corporation**: For larger operations

📊 **Record Keeping:**
- Track all material purchases
- Log time spent on each project
- Save receipts for business expenses
- Quarterly tax payments if needed

🎪 **Selling Venues:**
- Local craft fairs and farmers markets
- Online marketplaces (Etsy, Amazon Handmade)
- Your own website with e-commerce
- Consignment in local shops"""

    # General craft techniques
    elif any(word in message_lower for word in ['technique', 'learn', 'skill', 'improve', 'beginner']):
        return """**Improving Your Craft Skills:**

📚 **Learning Resources:**
- YouTube tutorials (free, visual learning)
- Local community college classes
- Craft guilds and maker spaces
- Online courses (Skillshare, Udemy)

🎯 **Skill Development:**
1. **Master Basics First**: Perfect fundamental techniques
2. **Practice Consistently**: Even 30 minutes daily helps
3. **Document Progress**: Photos show improvement over time
4. **Seek Feedback**: Join online communities or local groups

🔄 **Common Beginner Mistakes:**
- Rushing through projects
- Skipping safety equipment
- Not planning material needs
- Underestimating time requirements

Remember: Every expert was once a beginner! Focus on steady improvement rather than perfection."""

    else:
        return """**Welcome to Artisan Helper! 🎨**

I'm here to help with your creative journey. I can provide guidance on:

🎨 **Craft Techniques**: Pottery, woodworking, jewelry making, weaving, metalwork
💰 **Business Guidance**: Pricing strategies, market research, profit planning  
🔧 **Tools & Materials**: Equipment recommendations, sourcing, safety tips
📱 **Online Marketing**: Social media, photography, e-commerce platforms
🤝 **Community**: Finding markets, craft fairs, networking opportunities
📋 **Business Setup**: Licensing, taxes, legal considerations

**Quick Start Questions:**
- "How do I price my pottery?"
- "What tools do I need for woodworking?"
- "Best platforms to sell handmade jewelry?"
- "Photography tips for craft products?"

What specific aspect of your craft would you like help with today?"""

# Initialize RAG system with enhanced error handling
def initialize_rag_system():
    """Initialize RAG system with comprehensive error handling"""
    try:
        # Enhanced knowledge base for artisans
        artisan_knowledge = [
            "Artisans create unique handmade products using traditional and modern techniques, combining creativity with skilled craftsmanship",
            "Common artisan crafts include pottery and ceramics, weaving and textiles, woodworking and furniture making, metalworking and jewelry, glassblowing and stained glass, leather crafting, and fiber arts",
            "Artisan marketplaces include Etsy for global reach, local farmers markets for direct sales, craft fairs and art shows, consignment shops, and custom order websites",
            "Essential business tools for artisans include high-quality cameras for product photography, reliable internet for online sales, accounting software for expense tracking, and social media management tools",
            "Pricing strategies should account for material costs, labor time at fair wages, overhead expenses, market positioning, and profit margins of 50-100% for sustainable business",
            "Photography best practices include natural lighting near windows, multiple angles showing detail and scale, consistent backgrounds and styling, and process shots showing creation steps",
            "Social media marketing works through Instagram for visual storytelling, Pinterest for long-term traffic, Facebook for local community building, and TikTok for behind-the-scenes content",
            "Quality materials are fundamental to artisan work - research suppliers, test small quantities first, build relationships with reliable vendors, and factor material costs into pricing",
            "Time management techniques include batching similar tasks, setting realistic project timelines, tracking actual time spent vs estimates, and scheduling dedicated creation time",
            "Customer service excellence involves responding to inquiries within 24 hours, clear communication about timelines and processes, professional packaging and shipping, and following up after delivery",
            "Seasonal planning helps maximize sales through holiday-themed products, craft fair schedules, inventory management, and marketing campaign timing",
            "Skill development continues through online tutorials, local workshops, craft guild membership, mentorship programs, and regular practice of fundamental techniques",
            "Sustainable practices include using eco-friendly materials, minimizing waste through efficient cutting patterns, recycling scraps creatively, and educating customers about sustainability",
            "Legal considerations cover business licenses, sales tax permits, liability insurance, copyright and trademark protection, and contracts for custom work",
            "Inventory management involves tracking raw materials, work-in-progress items, finished goods, seasonal demand patterns, and reorder points for supplies",
            "Craft fair success requires attractive booth displays, engaging with customers personally, accepting multiple payment methods, collecting email addresses, and following up with interested buyers",
            "Online store optimization includes clear product titles with keywords, detailed descriptions telling the story, multiple high-quality photos, competitive pricing, and excellent customer reviews",
            "Collaborative opportunities exist through artisan cooperatives, shared studio spaces, joint marketing efforts, skill-sharing workshops, and group participation in larger events",
            "Financial planning involves separating business and personal finances, setting aside money for taxes, planning for seasonal income variations, and reinvesting in tools and materials",
            "Brand development includes consistent visual identity, authentic storytelling about your process, clear value propositions, professional business cards and packaging, and memorable customer experiences"
        ]
        
        logger.info(f"Initialized knowledge base with {len(artisan_knowledge)} entries")
        
        # Create document chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = splitter.create_documents(artisan_knowledge)
        logger.info(f"Created {len(chunks)} document chunks")
        
        # Initialize embeddings
        try:
            embedding_model = HuggingFaceEmbeddings(
                model_name='sentence-transformers/all-MiniLM-L6-v2',
                model_kwargs={'device': 'cpu'},  # Explicitly use CPU to avoid GPU issues
                encode_kwargs={'normalize_embeddings': True}
            )
            logger.info("✅ HuggingFace embeddings initialized")
        except Exception as e:
            logger.error(f"Failed to initialize embeddings: {e}")
            raise
        
        # Create vector store
        try:
            vector_store = FAISS.from_documents(chunks, embedding_model)
            retriever = vector_store.as_retriever(
                search_type="similarity", 
                search_kwargs={"k": 4}
            )
            logger.info("✅ FAISS vector store initialized")
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise
        
        # Initialize chat model
        if VERTEXAI_ENABLED:
            # Try multiple models in order of preference
            models_to_try = [
                "gemini-1.0-pro",
                "gemini-pro", 
                "gemini-1.5-flash",
                "text-bison"
            ]
            
            chat_model = None
            for model_name in models_to_try:
                try:
                    chat_model = ChatVertexAI(
                        model=model_name,
                        temperature=0.3,
                        max_tokens=1000,
                        max_retries=2
                    )
                    logger.info(f"✅ Vertex AI chat model initialized with {model_name}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to initialize {model_name}: {e}")
                    continue
            
            if not chat_model:
                logger.error("Failed to initialize any Vertex AI model")
                return None
        else:
            logger.warning("Vertex AI not available, using fallback responses")
            return None
        
        # Create prompt template
        prompt = PromptTemplate(
            template="""You are a knowledgeable AI assistant specializing in helping artisans and craftspeople succeed in their creative businesses.

Context: {context}

Question: {question}

Instructions:
- Provide practical, actionable advice based on the context
- If the context doesn't fully address the question, supplement with general artisan knowledge
- Focus on helping the artisan solve real problems and grow their business
- Keep responses helpful, encouraging, and professional
- Include specific examples or steps when possible

Response:""",
            input_variables=['context', 'question']
        )
        
        def format_docs(retrieved_docs):
            if not retrieved_docs:
                return "No specific context available."
            context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
            return context_text
        
        # Build the chain
        parallel_chain = RunnableParallel({
            'context': retriever | RunnableLambda(format_docs),
            'question': RunnablePassthrough()
        })
        
        parser = StrOutputParser()
        main_chain = parallel_chain | prompt | chat_model | parser
        
        logger.info("✅ RAG chain assembled successfully")
        return main_chain
        
    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        return None

# Initialize the RAG system
rag_chain = None
try:
    rag_chain = initialize_rag_system()
    if rag_chain:
        logger.info("✅ RAG system initialized successfully")
    else:
        logger.warning("⚠️ RAG system using fallback mode")
except Exception as e:
    logger.error(f"❌ Failed to initialize RAG system: {e}")
    rag_chain = None

# Routes
@app.get("/", response_class=HTMLResponse)
async def get_homepage():
    """Serve the main chat interface"""
    # Your existing HTML content here - keeping it the same as it's working well
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Artisan Helper Bot</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; display: flex; flex-direction: column;
            }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; flex: 1; display: flex; flex-direction: column; }
            .header { text-align: center; color: white; margin-bottom: 30px; }
            .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
            .header p { font-size: 1.2rem; opacity: 0.9; }
            .chat-container {
                background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                flex: 1; display: flex; flex-direction: column; overflow: hidden;
            }
            .chat-header { background: linear-gradient(90deg, #4CAF50, #45a049); color: white; padding: 20px; text-align: center; font-size: 1.2rem; font-weight: 600; }
            .chat-messages { flex: 1; padding: 20px; overflow-y: auto; max-height: 400px; background-color: #f8f9fa; }
            .message { margin-bottom: 15px; padding: 12px 18px; border-radius: 18px; max-width: 80%; word-wrap: break-word; white-space: pre-wrap; }
            .user-message { background: linear-gradient(135deg, #667eea, #764ba2); color: white; margin-left: auto; }
            .bot-message { background: #e9ecef; color: #333; border-left: 4px solid #4CAF50; }
            .input-container { display: flex; padding: 20px; background: white; border-top: 1px solid #eee; }
            .message-input { flex: 1; padding: 12px 18px; border: 2px solid #ddd; border-radius: 25px; font-size: 16px; outline: none; transition: border-color 0.3s; }
            .message-input:focus { border-color: #4CAF50; }
            .send-btn { margin-left: 10px; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px; font-weight: 600; transition: transform 0.2s; }
            .send-btn:hover { transform: translateY(-2px); }
            .send-btn:disabled { opacity: 0.6; transform: none; cursor: not-allowed; }
            .loading { display: none; text-align: center; padding: 10px; color: #666; font-style: italic; }
            .loading.show { display: block; }
            .suggestions { display: flex; flex-wrap: wrap; gap: 10px; padding: 0 20px 20px; background: white; }
            .suggestion-btn { padding: 8px 16px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
            .suggestion-btn:hover { background: #4CAF50; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 Artisan Helper Bot</h1>
                <p>Your AI assistant for craft, business, and artisan guidance</p>
            </div>
            <div class="chat-container">
                <div class="chat-header">💬 Chat with your Artisan Assistant</div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot-message">Hello! I'm here to help you with your artisan work. Ask me about crafts, business advice, techniques, or anything related to your creative journey! 🎨</div>
                </div>
                <div class="suggestions">
                    <div class="suggestion-btn" onclick="sendSuggestion('How do I price my handmade products?')">💰 Pricing advice</div>
                    <div class="suggestion-btn" onclick="sendSuggestion('What tools do I need for pottery?')">🔧 Tool recommendations</div>
                    <div class="suggestion-btn" onclick="sendSuggestion('How to market my crafts online?')">📱 Online marketing</div>
                    <div class="suggestion-btn" onclick="sendSuggestion('Best materials for woodworking?')">🪵 Material guidance</div>
                </div>
                <div class="loading" id="loading">🤖 Thinking...</div>
                <div class="input-container">
                    <input type="text" id="message-input" class="message-input" placeholder="Ask me anything about your craft or business..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()" id="send-btn" class="send-btn">Send</button>
                </div>
            </div>
        </div>
        <script>
            async function sendMessage() {
                const input = document.getElementById('message-input');
                const message = input.value.trim();
                if (!message) return;
                addMessage(message, 'user');
                input.value = '';
                const loading = document.getElementById('loading');
                loading.classList.add('show');
                const sendBtn = document.getElementById('send-btn');
                sendBtn.disabled = true;
                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message })
                    });
                    const data = await response.json();
                    if (data.success) {
                        addMessage(data.response, 'bot');
                    } else {
                        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                    }
                } catch (error) {
                    addMessage('Connection error. Please check your internet and try again.', 'bot');
                } finally {
                    loading.classList.remove('show');
                    sendBtn.disabled = false;
                }
            }
            function addMessage(message, sender) {
                const chatMessages = document.getElementById('chat-messages');
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}-message`;
                messageDiv.textContent = message;
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            function handleKeyPress(event) {
                if (event.key === 'Enter') { sendMessage(); }
            }
            function sendSuggestion(message) {
                document.getElementById('message-input').value = message;
                sendMessage();
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Handle chat messages with improved error handling"""
    try:
        # Validate input
        if not request.message or len(request.message.strip()) == 0:
            return ChatResponse(
                response="Please provide a message.",
                success=False,
                error="Empty message"
            )
            
        # Limit message length to prevent abuse
        if len(request.message) > 1000:
            return ChatResponse(
                response="Message too long. Please keep messages under 1000 characters.",
                success=False,
                error="Message too long"
            )
        
        message = request.message.strip()
        logger.info(f"Processing chat message: {message[:50]}...")
        
        if rag_chain:
            try:
                # Get response from RAG chain with timeout handling
                response = rag_chain.invoke(message)
                logger.info("RAG chain response generated successfully")
            except Exception as e:
                logger.error(f"RAG chain error: {e}")
                # Fall back to manual response
                response = get_fallback_response(message)
                logger.info("Using fallback response due to RAG chain error")
        else:
            # Use fallback response system
            response = get_fallback_response(message)
            logger.info("Using fallback response (RAG chain not available)")
        
        return ChatResponse(
            response=response,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        # Even if there's an error, provide a fallback response
        try:
            fallback_response = get_fallback_response(request.message)
            return ChatResponse(
                response=fallback_response,
                success=True
            )
        except Exception as fallback_error:
            logger.error(f"Fallback response error: {fallback_error}")
            return ChatResponse(
                response="I'm having trouble right now. Please try again in a moment.",
                success=False,
                error="System temporarily unavailable"
            )

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": logger.handlers[0].formatter.converter(None),
        "components": {
            "rag_system": "initialized" if rag_chain else "fallback_mode",
            "speech_services": "available" if SPEECH_ENABLED else "not_available",
            "vertex_ai": "available" if VERTEXAI_ENABLED else "not_available",
            "environment": {
                "google_cloud_project": "configured" if os.getenv('GOOGLE_CLOUD_PROJECT') else "missing",
                "credentials": "found" if os.getenv('GOOGLE_APPLICATION_CREDENTIALS') else "missing"
            }
        }
    }

# Add error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "Resource not found", "success": False}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "success": False}
    )

if __name__ == "__main__":
    logger.info("🚀 Starting Artisan Helper Bot server...")
    logger.info("📝 Environment status:")
    logger.info(f"   - Google Cloud Project: {os.getenv('GOOGLE_CLOUD_PROJECT', 'Not set')}")
    logger.info(f"   - Credentials: {'✅ Found' if os.getenv('GOOGLE_APPLICATION_CREDENTIALS') else '❌ Not found'}")
    logger.info(f"   - Vertex AI: {'✅ Available' if VERTEXAI_ENABLED else '❌ Not available'}")
    logger.info(f"   - Speech API: {'✅ Available' if SPEECH_ENABLED else '❌ Not available'}")
    logger.info("🌐 Server will be available at: http://localhost:8001")
    
    uvicorn.run(
        app,  # Use the app object directly instead of string reference
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )