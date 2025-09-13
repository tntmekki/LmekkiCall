import React, { useRef, useEffect } from 'react';
import type { ChatContact, Conversation } from '../types';
import Message from './Message';
import MessageInput from './MessageInput';
import Avatar from './Avatar';
import { VideoIcon, PhoneIcon, MenuIcon } from './icons/Icons';

interface ChatWindowProps {
  contact: ChatContact;
  conversation: Conversation;
  onSendMessage: (text: string) => void;
  onStartCall: () => void;
  onOpenContactProfile: (contactId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, conversation, onSendMessage, onStartCall, onOpenContactProfile }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, conversation.isTyping]);

  const isAiContact = contact.id === 'gemini-1';

  return (
    <div className="flex-1 flex flex-col bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?blur=2&grayscale')" }}>
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
            <button 
              onClick={() => onOpenContactProfile(contact.id)}
              className="flex items-center gap-4 text-left rounded-lg p-2 -m-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label={`View profile for ${contact.name}`}
            >
                <Avatar src={contact.avatar} alt={contact.name} size="md" />
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-50">{contact.name}</h2>
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">{isAiContact ? 'متصل الآن' : 'آخر ظهور قريبًا'}</p>
                </div>
            </button>
            <div className="flex items-center gap-4">
                <button 
                  onClick={onStartCall} 
                  disabled={isAiContact}
                  className="text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Start video call"
                >
                  <VideoIcon className="w-6 h-6" />
                </button>
                <button 
                  disabled={isAiContact}
                  className="text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Start audio call"
                >
                  <PhoneIcon className="w-6 h-6" />
                </button>
                <button className="text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"><MenuIcon className="w-6 h-6" /></button>
            </div>
        </header>
      </div>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
         {conversation.isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 rounded-lg rounded-br-none p-3 max-w-md shadow-sm">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="block w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="block w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="block w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <footer className="p-4">
            <MessageInput onSendMessage={onSendMessage} />
        </footer>
      </div>
    </div>
  );
};

export default ChatWindow;