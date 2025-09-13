import React from 'react';
import type { Message as MessageType } from '../types';
import { MessageSender } from '../types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  // Base classes
  const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const commonBubbleClasses = 'rounded-2xl max-w-md md:max-w-lg shadow-md';

  // Render image message from AI
  if (message.imageUrl && !isUser) {
    return (
      <div className={containerClasses}>
        <div className={`p-2 bg-white dark:bg-slate-700 ${commonBubbleClasses} rounded-br-none`}>
          <img src={message.imageUrl} alt={message.text} className="rounded-lg w-full h-auto" />
          <div className="px-2 pt-2 pb-1">
             <p className="text-sm text-slate-700 dark:text-slate-200">{message.text}</p>
             <p className="text-xs mt-1 text-slate-400 dark:text-slate-500 text-left">
               {message.timestamp}
             </p>
          </div>
        </div>
      </div>
    );
  }

  // Classes for text messages
  const bubbleClasses = isUser
    ? 'bg-teal-600 text-white rounded-bl-none'
    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-br-none';

  const timestampClasses = isUser
    ? 'text-teal-100 text-right'
    : 'text-slate-400 dark:text-slate-500 text-left';

  return (
    <div className={containerClasses}>
      <div className={`px-4 py-3 ${commonBubbleClasses} ${bubbleClasses}`}>
        <p className="text-base whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-2 ${timestampClasses}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};

export default Message;