import React, { useState, useEffect, useRef } from 'react';
import * as api from '@shared/api';
import type { ChatMessage } from '@shared/types';
import { CloseIcon, SendIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface ChatWindowProps {
    onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const fetchMessages = () => {
        if (!currentUser) return;
        api.getChatHistory(currentUser.email).then(history => {
            setMessages(history);
            if(isLoading) setIsLoading(false);
        });
    }

    useEffect(() => {
        fetchMessages(); // Initial fetch
        const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(intervalId); // Cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        setIsSending(true);
        const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            text: newMessage,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        try {
            await api.sendChatMessage(newMessage.trim(), currentUser.email);
            // The polling will fetch the confirmed message and the support reply
        } catch (error) {
            console.error("Failed to send message", error);
            // Optionally remove optimistic message or show error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-0 right-0 sm:bottom-8 sm:right-8 z-50 w-full h-full sm:w-96 sm:h-[600px] bg-white rounded-lg shadow-2xl flex flex-col animate-fade-in-up">
            {/* Header */}
            <header className="bg-red-500 text-white p-4 flex justify-between items-center rounded-t-lg flex-shrink-0">
                <h3 className="font-bold text-lg">Customer Support</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-red-600">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>

            {/* Messages */}
            <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {isLoading ? (
                    <div className="text-center text-gray-500">Loading chat...</div>
                ) : (
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Input */}
            <footer className="p-4 border-t bg-white rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-600 disabled:bg-red-300 transition-colors"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatWindow;