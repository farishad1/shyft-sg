'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
    options?: string[];
}

const GREETING = "Hi there! I'm ShyftHelper. 🤖 I can help with your shifts, pay, or profile. What's on your mind?";

const QUICK_OPTIONS = [
    "Where is my pay?",
    "I can't find shifts",
    "Talk to a Human",
];

function getBotResponse(userMessage: string): { text: string; options?: string[] } {
    const lower = userMessage.toLowerCase();

    if (lower.includes('pay') || lower.includes('earn') || lower.includes('money') || lower.includes('salary') || lower.includes('where is my')) {
        return {
            text: "Earnings are typically processed within 3-5 business days after a shift is completed. You can check your 'Financials' tab for the status of specific payments! 💰",
            options: ["I can't find shifts", "Talk to a Human"],
        };
    }

    if (lower.includes('shift') || lower.includes('find') || lower.includes('job') || lower.includes('work') || lower.includes("can't find")) {
        return {
            text: "New shifts are posted daily! Make sure your profile is 100% complete and your location settings are accurate to see more opportunities. 📍",
            options: ["Where is my pay?", "Talk to a Human"],
        };
    }

    if (lower.includes('human') || lower.includes('admin') || lower.includes('agent') || lower.includes('person') || lower.includes('talk to')) {
        return {
            text: "I'm still learning! 🧠 If I can't solve this, please email our Admin team directly at abeerfaris@shyft.sg. They usually reply within 24 hours.",
            options: ["Where is my pay?", "I can't find shifts"],
        };
    }

    if (lower.includes('profile') || lower.includes('account') || lower.includes('settings')) {
        return {
            text: "You can update your profile anytime from the 'Profile' tab in your dashboard sidebar. Make sure all fields are filled out to get matched with more shifts! ✏️",
            options: ["Where is my pay?", "Talk to a Human"],
        };
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
        return {
            text: GREETING,
            options: QUICK_OPTIONS,
        };
    }

    // Default fallback
    return {
        text: "I'm still learning! 🧠 I didn't quite understand that. You can try one of the options below, or email our Admin team directly at abeerfaris@shyft.sg for personalized help.",
        options: QUICK_OPTIONS,
    };
}

export function ShyftHelper() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Restore state from sessionStorage
    useEffect(() => {
        const saved = sessionStorage.getItem('shyfthelper_open');
        const savedMessages = sessionStorage.getItem('shyfthelper_messages');
        if (saved === 'true') setIsOpen(true);
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
                setHasGreeted(true);
            } catch { /* ignore */ }
        }
    }, []);

    // Save state to sessionStorage
    useEffect(() => {
        sessionStorage.setItem('shyfthelper_open', String(isOpen));
    }, [isOpen]);

    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('shyfthelper_messages', JSON.stringify(messages));
        }
    }, [messages]);

    // Initial greeting when opening for the first time
    useEffect(() => {
        if (isOpen && !hasGreeted) {
            setHasGreeted(true);
            setTimeout(() => {
                setMessages([{
                    id: 'greeting',
                    text: GREETING,
                    isBot: true,
                    options: QUICK_OPTIONS,
                }]);
            }, 400);
        }
    }, [isOpen, hasGreeted]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            text: messageText,
            isBot: false,
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Bot response after a short delay
        setTimeout(() => {
            const response = getBotResponse(messageText);
            const botMsg: ChatMessage = {
                id: `bot-${Date.now()}`,
                text: response.text,
                isBot: true,
                options: response.options,
            };
            setMessages(prev => [...prev, botMsg]);
        }, 600);
    };

    return (
        <>
            {/* CSS Animations */}
            <style>{`
                @keyframes shyfthelper-pop-in {
                    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes shyfthelper-pop-out {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.8) translateY(20px); }
                }
                @keyframes shyfthelper-bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes shyfthelper-msg-in {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .shyfthelper-fab:hover {
                    transform: scale(1.1) !important;
                    box-shadow: 0 8px 30px rgba(0, 255, 157, 0.4) !important;
                }
                .shyfthelper-option:hover {
                    background: var(--accent) !important;
                    color: #000 !important;
                }
                .shyfthelper-send:hover {
                    background: var(--accent) !important;
                    color: #000 !important;
                }
            `}</style>

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="shyfthelper-fab"
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--accent, #00ff9d)',
                        color: '#000',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(0, 255, 157, 0.3)',
                        zIndex: 10000,
                        transition: 'all 0.3s ease',
                        animation: 'shyfthelper-bounce 2s ease-in-out infinite',
                    }}
                    title="Need Help? Chat with ShyftHelper"
                >
                    <MessageSquare size={26} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '380px',
                    maxWidth: 'calc(100vw - 2rem)',
                    height: '520px',
                    maxHeight: 'calc(100vh - 4rem)',
                    borderRadius: '1rem',
                    background: '#111',
                    border: '1px solid #333',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 10000,
                    animation: 'shyfthelper-pop-in 0.3s ease-out forwards',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: 'linear-gradient(135deg, #111, #1a1a1a)',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                            }}>
                                🤖
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9375rem' }}>ShyftHelper</div>
                                <div style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff9d', display: 'inline-block' }} />
                                    Online
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#888'; }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ animation: 'shyfthelper-msg-in 0.3s ease-out' }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: msg.isBot
                                        ? '1rem 1rem 1rem 0.25rem'
                                        : '1rem 1rem 0.25rem 1rem',
                                    background: msg.isBot ? '#1a1a2e' : 'var(--accent)',
                                    color: msg.isBot ? '#e0e0e0' : '#000',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    marginLeft: msg.isBot ? 0 : 'auto',
                                    marginRight: msg.isBot ? 'auto' : 0,
                                    wordBreak: 'break-word',
                                }}>
                                    {msg.text}
                                </div>

                                {/* Quick reply options */}
                                {msg.isBot && msg.options && (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        marginTop: '0.5rem',
                                    }}>
                                        {msg.options.map((option) => (
                                            <button
                                                key={option}
                                                className="shyfthelper-option"
                                                onClick={() => handleSend(option)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid #333',
                                                    color: '#ccc',
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.8125rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '0.75rem 1rem',
                        borderTop: '1px solid #333',
                        display: 'flex',
                        gap: '0.5rem',
                        background: '#0a0a0a',
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '0.5rem',
                                padding: '0.625rem 0.875rem',
                                color: '#fff',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={() => handleSend()}
                            className="shyfthelper-send"
                            disabled={!input.trim()}
                            style={{
                                background: input.trim() ? 'var(--accent)' : '#333',
                                color: input.trim() ? '#000' : '#666',
                                border: 'none',
                                borderRadius: '0.5rem',
                                padding: '0.625rem',
                                cursor: input.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
