'use client';

import { useState, useTransition } from 'react';
import { sendMessage } from '../actions';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatInputProps {
    conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isPending) return;

        const content = message;
        setMessage(''); // Optimistic clear

        startTransition(async () => {
            await sendMessage(conversationId, content);
            router.refresh();
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '0.75rem'
            }}
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="input"
                style={{ flex: 1 }}
                disabled={isPending}
            />
            <button
                type="submit"
                disabled={!message.trim() || isPending}
                className="btn btn-primary"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: !message.trim() ? 0.5 : 1
                }}
            >
                <Send size={18} />
            </button>
        </form>
    );
}
