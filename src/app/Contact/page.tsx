"use client";

import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import { useEffect, useState } from "react";

export default function AboutPage() {
    const [currentMode, setCurrentMode] = useState('text');
    const [isRecording, setIsRecording] = useState(false);
    const [voiceModeAvailable, setVoiceModeAvailable] = useState(true);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm your RAG-powered AI assistant. You can chat with me using text or voice. In text mode, I'll respond with text. In voice mode, I'll respond with audio! 🎤",
            sender: 'bot'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check if voice mode is available
    const checkVoiceModeAvailability = async () => {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            const available = data.google_cloud === 'available';
            setVoiceModeAvailable(available);
        } catch (error) {
            console.log('Could not check voice mode availability');
        }
    };

    useEffect(() => {
        checkVoiceModeAvailability();
    }, []);

    const handleModeChange = (mode: string) => {
        if (mode === 'voice' && !voiceModeAvailable) {
            alert('Voice mode is not available. Google Cloud Speech services are not configured.');
            return;
        }
        setCurrentMode(mode);
    };

    const addMessage = (message: string, sender: 'user' | 'bot') => {
        setMessages(prev => [...prev, { text: message, sender }]);
    };

    const sendMessage = async () => {
        const message = inputMessage.trim();

        if (!message && currentMode === 'text') return;

        if (currentMode === 'text') {
            // Add user message to chat
            addMessage(message, 'user');
            setInputMessage('');

            // Show loading
            setIsLoading(true);

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
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
                setIsLoading(false);
            }
        }
    };

    const toggleRecording = async () => {
        if (!voiceModeAvailable) {
            alert('Voice mode is not available. Google Cloud Speech services are not configured.');
            return;
        }

        if (!isRecording) {
            await startRecording();
        } else {
            stopRecording();
        }
    };

    const startRecording = async () => {
        try {
            // Request high-quality audio
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,  // Match Google Cloud Speech API preference
                    channelCount: 1,    // Mono audio
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Try to use the best available audio format
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                mimeType = 'audio/ogg;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            console.log('Using audio format:', mimeType);
            const recorder = new MediaRecorder(stream, { mimeType: mimeType });
            const chunks: Blob[] = [];

            recorder.ondataavailable = event => {
                chunks.push(event.data);
            };

            recorder.onstop = async () => {
                // Use the actual MIME type from the MediaRecorder
                const mimeType = recorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(chunks, { type: mimeType });
                await processVoiceInput(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
            setMediaRecorder(recorder);
            setAudioChunks(chunks);

            addMessage('🎤 Recording... Click Stop when done', 'user');
        } catch (error) {
            addMessage('❌ Microphone access denied. Please allow microphone access and try again.', 'bot');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const processVoiceInput = async (audioBlob: Blob) => {
        setIsLoading(true);

        try {
            console.log('Audio blob type:', audioBlob.type);
            console.log('Audio blob size:', audioBlob.size);

            const formData = new FormData();
            // Use appropriate file extension based on MIME type
            const fileExtension = audioBlob.type.includes('webm') ? 'webm' :
                audioBlob.type.includes('ogg') ? 'ogg' : 'wav';
            formData.append('audio', audioBlob, `recording.${fileExtension}`);
            formData.append('language', 'auto');  // Let the server auto-detect language

            const response = await fetch('/voice-chat', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                addMessage(`🎤 You said: "${data.transcription}"`, 'user');
                addMessage(data.response, 'bot');

                // Play the audio response
                if (data.audio_file) {
                    const audio = new Audio(`/audio/${data.audio_file}`);
                    audio.play();
                }
            } else {
                addMessage(`❌ Error: ${data.error}`, 'bot');
            }
        } catch (error) {
            addMessage('❌ Voice processing error. Please try again.', 'bot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && currentMode === 'text') {
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #f5f1e8 0%, #e8dcc6 50%, #d4c5a9 100%)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c9a876' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}>
            {/* Fixed Navbar */}
            <nav className="sticky top-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85 
        backdrop-blur-md shadow-md border-b border-amber-950/40">

                {/* Brand / Logo */}
                <div
                    className="text-4xl font-extrabold tracking-wider text-amber-100 drop-shadow-md 
                     hover:scale-[1.05] transition-transform duration-500 ease-out"
                    style={{ fontFamily: 'Cinzel Decorative, Cormorant Garamond, serif' }}
                >
                    ARTISAN
                </div>

                {/* Nav Links */}
                <div className="hidden gap-4 md:flex items-center">
                    {[
                        { href: "/", label: "HOME" },
                        { href: "/about", label: "ABOUT" },
                        { href: "#contact", label: "CONTACT" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-amber-100 tracking-wide font-medium 
                         transition-all duration-300 hover:text-amber-300"
                        >
                            {item.label}
                        </Link>
                    ))}

                    {/* Login & Signup */}
                    <Link
                        href="/login"
                        className="px-4 py-2 border border-[#c9a86a] text-[#f0e68c] 
                       rounded-md font-medium shadow-sm transition-all duration-300 
                       hover:bg-[#f0e68c] hover:text-[#5c3317] hover:scale-105"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="px-4 py-2 border border-[#c9a86a] text-[#f0e68c] 
                       rounded-md font-medium shadow-sm transition-all duration-300 
                       hover:bg-[#f0e68c] hover:text-[#5c3317] hover:scale-105"
                    >
                        Sign Up
                    </Link>

                    {/* Language Selector on extreme right */}
                    <div className="ml-4">
                        <LanguageSelector />
                    </div>
                </div>
            </nav>

            <main className="pt-24">
                {/* Push content below fixed navbar */}
                <section>
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `url("/bg1.jpg")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(2px)",
                            transform: "scale(1.50)"
                        }}
                    />

                    {/* Gradient overlay */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `linear-gradient(135deg, rgba(252, 252, 252, 0.1) 0%, rgba(216, 196, 196, 0.15) 100%)`
                        }}
                    />



                    {/* RAG Chatbot Section */}
                    <section className="relative mx-auto max-w-4xl px-10 py-0.1">
                        {/* Decorative elephants around chatbot */}
                        <div className="absolute -left-4 top-12 hidden lg:block opacity-40">
                            <svg width="80" height="120" viewBox="0 0 100 150" className="fill-amber-600/30">
                                <circle cx="50" cy="30" r="20" />
                                <ellipse cx="50" cy="60" rx="18" ry="25" />
                                <ellipse cx="50" cy="95" rx="15" ry="20" />
                                <circle cx="45" cy="25" r="2" />
                                <circle cx="55" cy="25" r="2" />
                                <path d="M35 35 Q25 45 35 50" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </div>

                        <div className="absolute -right-4 top-12 hidden lg:block opacity-40">
                            <svg width="80" height="120" viewBox="0 0 100 150" className="fill-amber-600/30">
                                <circle cx="50" cy="30" r="20" />
                                <ellipse cx="50" cy="60" rx="18" ry="25" />
                                <ellipse cx="50" cy="95" rx="15" ry="20" />
                                <circle cx="45" cy="25" r="2" />
                                <circle cx="55" cy="25" r="2" />
                                <path d="M65 35 Q75 45 65 50" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </div>

                        <div className="absolute -left-8 bottom-12 hidden lg:block opacity-40">
                            <svg width="60" height="90" viewBox="0 0 100 150" className="fill-amber-600/30">
                                <circle cx="50" cy="30" r="15" />
                                <ellipse cx="50" cy="55" rx="12" ry="18" />
                                <ellipse cx="50" cy="80" rx="10" ry="15" />
                            </svg>
                        </div>

                        <div className="absolute -right-8 bottom-12 hidden lg:block opacity-40">
                            <svg width="60" height="90" viewBox="0 0 100 150" className="fill-amber-600/30">
                                <circle cx="50" cy="30" r="15" />
                                <ellipse cx="50" cy="55" rx="12" ry="18" />
                                <ellipse cx="50" cy="80" rx="10" ry="15" />
                            </svg>
                        </div>

                        {/* Chatbot Container */}
                        <div className="relative bg-gradient-to-br from-amber-50/95 to-orange-50/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-800/30">
                            {/* Header */}
                            <div className="text-center py-6 bg-gradient-to-r from-amber-800 to-amber-700">
                                <div className="flex justify-center items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white tracking-wide" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                        RAG Chatbot
                                    </h2>
                                </div>
                            </div>

                            {/* Mode Selector */}
                            <div className="p-6 bg-gradient-to-r from-amber-100 to-orange-100">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-amber-800 mb-4">Chat with your AI Assistant</h3>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => handleModeChange('text')}
                                            className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-medium ${currentMode === 'text'
                                                    ? 'bg-amber-700 text-white border-amber-700 shadow-lg'
                                                    : 'bg-white text-amber-700 border-amber-700 hover:bg-amber-50'
                                                }`}
                                        >
                                            📝 Text Mode
                                        </button>
                                        <button
                                            onClick={() => handleModeChange('voice')}
                                            disabled={!voiceModeAvailable}
                                            className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-medium ${currentMode === 'voice'
                                                    ? 'bg-amber-700 text-white border-amber-700 shadow-lg'
                                                    : 'bg-white text-amber-700 border-amber-700 hover:bg-amber-50'
                                                } ${!voiceModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            🎤 Voice Mode {!voiceModeAvailable && '(Not Available)'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="h-80 overflow-y-auto p-6 bg-gradient-to-b from-amber-50/50 to-orange-50/50">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.sender === 'bot' && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                    🤖
                                                </div>
                                                <div className="bg-white/90 backdrop-blur-sm text-amber-900 px-6 py-4 rounded-3xl rounded-bl-none max-w-md shadow-lg border-2 border-amber-200/50">
                                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                                </div>
                                            </div>
                                        )}
                                        {message.sender === 'user' && (
                                            <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white px-6 py-4 rounded-3xl rounded-br-none max-w-md shadow-lg">
                                                <p className="whitespace-pre-wrap">{message.text}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                🤖
                                            </div>
                                            <div className="bg-white/90 backdrop-blur-sm text-amber-900 px-6 py-4 rounded-3xl rounded-bl-none shadow-lg border-2 border-amber-200/50">
                                                <p className="italic text-amber-600">🤖 Processing...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Container */}
                            <div className="p-6 bg-gradient-to-r from-amber-100 to-orange-100 border-t-2 border-amber-200/50">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={currentMode === 'text' ? "Ask me anything......" : "Click Record to start voice input..."}
                                        className="flex-1 px-6 py-4 border-2 border-amber-300 rounded-full text-amber-900 placeholder-amber-600/60 focus:outline-none focus:border-amber-500 bg-white/90 backdrop-blur-sm shadow-inner text-lg"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={isLoading}
                                        className="px-8 py-4 bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-full hover:from-amber-800 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                                    >
                                        send
                                    </button>
                                    {currentMode === 'voice' && (
                                        <button
                                            onClick={toggleRecording}
                                            disabled={isLoading}
                                            className={`px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isRecording
                                                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                                    : 'bg-gradient-to-r from-red-500 to-red-400 text-white hover:from-red-600 hover:to-red-500'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isRecording ? '⏹ Stop' : 'Record'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}