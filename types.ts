export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  imageUrl?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Conversation {
    messages: Message[];
    isTyping: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
  status: string;
}