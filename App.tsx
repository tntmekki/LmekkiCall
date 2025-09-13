import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { Message, ChatContact, Conversation, UserProfile } from './types';
import { MessageSender } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import UserProfilePage from './components/UserProfile';
import ContactProfile from './components/ContactProfile';
import Toast from './components/Toast';

// MOCK DATA
const initialContacts: ChatContact[] = [
  {
    id: 'gemini-1',
    name: 'مساعد لمكي الذكي',
    avatar: `https://i.pravatar.cc/150?u=gemini-1`,
    lastMessage: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
    lastMessageTime: '10:30 ص',
    unreadCount: 0,
  },
  {
    id: 'user-2',
    name: 'علي محمد',
    avatar: `https://i.pravatar.cc/150?u=user-2`,
    lastMessage: 'تمام، سأكون هناك.',
    lastMessageTime: '9:45 ص',
    unreadCount: 0,
  },
  {
    id: 'user-3',
    name: 'فاطمة الزهراء',
    avatar: `https://i.pravatar.cc/150?u=user-3`,
    lastMessage: 'شكراً جزيلاً لك!',
    lastMessageTime: 'أمس',
    unreadCount: 2,
  },
  {
    id: 'user-4',
    name: 'خالد عبد الله',
    avatar: `https://i.pravatar.cc/150?u=user-4`,
    lastMessage: 'لا تنسى اجتماع الغد.',
    lastMessageTime: 'أمس',
    unreadCount: 0,
  },
];

const App: React.FC = () => {
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [activeChatId, setActiveChatId] = useState<string>('gemini-1');
  const [conversations, setConversations] = useState<Record<string, Conversation>>({
    'gemini-1': {
      messages: [
        { id: '1', text: 'مرحباً! أنا مساعد لمكي الذكي. كيف يمكنني مساعدتك اليوم؟', sender: MessageSender.AI, timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }
      ],
      isTyping: false,
    },
     'user-2': { messages: [], isTyping: false },
     'user-3': { messages: [], isTyping: false },
     'user-4': { messages: [], isTyping: false },
  });
  const [geminiChat, setGeminiChat] = useState<Chat | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'لمكي',
    avatar: 'https://i.pravatar.cc/150?u=current-user',
    status: 'متاح',
  });
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isContactProfileOpen, setIsContactProfileOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{ contactName: string; message: string; avatar: string } | null>(null);


  useEffect(() => {
    try {
      if(process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'أنت مساعد ودود ومفيد اسمك لمكي. أجب باللغة العربية بأسلوب محادثة غير رسمي، كأنك صديق يرسل رسائل نصية.',
            },
        });
        setGeminiChat(chat);
      }
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
    }
  }, []);

  // Effect to simulate receiving messages in inactive chats
  useEffect(() => {
    const messageInterval = setInterval(() => {
      const availableContacts = contacts.filter(
        c => c.id !== 'gemini-1' && c.id !== activeChatId
      );
      if (availableContacts.length > 0) {
        const randomContact =
          availableContacts[Math.floor(Math.random() * availableContacts.length)];
        
        const possibleMessages = [
            "أهلاً، كيف حالك؟",
            "هل أنت متاح للحديث الآن؟",
            "لدي سؤال سريع لك.",
            "فقط أردت أن أطمئن عليك.",
            "ما رأيك في فكرة المشروع الجديدة؟"
        ];
        const randomMessageText = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];

        const newMessage: Message = {
          id: Date.now().toString(),
          text: randomMessageText,
          sender: MessageSender.AI, // Simulating message from them
          timestamp: new Date().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setConversations(prev => ({
          ...prev,
          [randomContact.id]: {
            ...prev[randomContact.id],
            messages: [...(prev[randomContact.id]?.messages || []), newMessage],
          },
        }));

        setContacts(prev =>
          prev.map(c =>
            c.id === randomContact.id
              ? {
                  ...c,
                  lastMessage: newMessage.text,
                  lastMessageTime: newMessage.timestamp,
                  unreadCount: (c.unreadCount || 0) + 1,
                }
              : c
          )
        );
        
        setToastNotification({
            contactName: randomContact.name,
            message: newMessage.text,
            avatar: randomContact.avatar
        });
      }
    }, 15000); 

    return () => clearInterval(messageInterval);
  }, [contacts, activeChatId]);

  // Effect to hide toast notification after a delay
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };
  
  const handleGenerateImage = async (prompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `/imagine ${prompt}`,
      sender: MessageSender.USER,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...(prev[activeChatId]?.messages || []), userMessage],
      }
    }));
    setContacts(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: `توليد صورة...`, lastMessageTime: userMessage.timestamp } : c));

    const aiMessageId = (Date.now() + 1).toString();
    const placeholderMessage: Message = {
      id: aiMessageId,
      text: `...جاري إنشاء صورة لـ "${prompt}"`,
      sender: MessageSender.AI,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

     setConversations(prev => ({
        ...prev,
        [activeChatId]: {
            ...prev[activeChatId],
            messages: [...(prev[activeChatId]?.messages || []), placeholderMessage],
        }
    }));

    try {
      if (!process.env.API_KEY) throw new Error("API key not found");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
      });

      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
      
      const imageMessage: Message = {
        id: aiMessageId,
        text: prompt,
        imageUrl: imageUrl,
        sender: MessageSender.AI,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      
      setConversations(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: (prev[activeChatId]?.messages || []).map(m =>
            m.id === aiMessageId ? imageMessage : m
          ),
        }
      }));

      setContacts(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: 'تم إنشاء صورة بنجاح.', lastMessageTime: imageMessage.timestamp } : c));
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMessage: Message = {
        id: aiMessageId,
        text: 'عذراً، حدث خطأ أثناء إنشاء الصورة. قد يكون السبب محتوى غير ملائم.',
        sender: MessageSender.AI,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: (prev[activeChatId]?.messages || []).map(m =>
            m.id === aiMessageId ? errorMessage : m
          ),
        }
      }));
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (activeChatId === 'gemini-1' && text.trim().toLowerCase().startsWith('/imagine ')) {
      const prompt = text.trim().substring(8).trim();
      if (prompt) {
        handleGenerateImage(prompt);
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: MessageSender.USER,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...(prev[activeChatId]?.messages || []), userMessage],
        isTyping: activeChatId === 'gemini-1', 
      }
    }));
    
    setContacts(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: text, lastMessageTime: userMessage.timestamp } : c));

    if (activeChatId === 'gemini-1' && geminiChat) {
      try {
        const stream = await geminiChat.sendMessageStream({ message: text });
        
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
          id: aiMessageId,
          text: '',
          sender: MessageSender.AI,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };

        setConversations(prev => ({
            ...prev,
            [activeChatId]: {
                ...prev[activeChatId],
                messages: [...(prev[activeChatId]?.messages || []), aiMessage],
            }
        }));

        let fullResponse = '';
        for await (const chunk of stream) {
          fullResponse += chunk.text;
          setConversations(prev => ({
            ...prev,
            [activeChatId]: {
              ...prev[activeChatId],
              messages: (prev[activeChatId]?.messages || []).map(m => 
                m.id === aiMessageId ? { ...m, text: fullResponse } : m
              ),
            }
          }));
        }
        
        setContacts(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: fullResponse.substring(0, 30) + '...', lastMessageTime: aiMessage.timestamp } : c));


      } catch (error) {
        console.error("Error sending message to Gemini:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد.',
          sender: MessageSender.AI,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setConversations(prev => ({
          ...prev,
          [activeChatId]: {
            ...prev[activeChatId],
            messages: [...(prev[activeChatId]?.messages || []), errorMessage],
          }
        }));
      } finally {
         setConversations(prev => ({
            ...prev,
            [activeChatId]: {
                ...prev[activeChatId],
                isTyping: false,
            }
        }));
      }
    }
  }, [activeChatId, geminiChat]);
  
  const handleStartCall = () => {
    if (activeChatId !== 'gemini-1') {
      setIsCallActive(true);
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleOpenProfile = () => setIsProfilePageOpen(true);
  const handleCloseProfile = () => setIsProfilePageOpen(false);

  const handleUpdateProfile = (newProfile: UserProfile) => {
      setCurrentUser(newProfile);
      handleCloseProfile();
  };
  
  const handleOpenContactProfile = (contactId: string) => {
    setEditingContactId(contactId);
    setIsContactProfileOpen(true);
  };

  const handleCloseContactProfile = () => {
    setIsContactProfileOpen(false);
    setEditingContactId(null);
  };

  const handleUpdateContactProfile = (updatedContact: ChatContact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    handleCloseContactProfile();
  };

  const activeConversation = conversations[activeChatId];
  const activeContact = contacts.find(c => c.id === activeChatId);
  const editingContact = contacts.find(c => c.id === editingContactId);
  
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex antialiased" dir="rtl">
      {toastNotification && (
        <Toast 
            contactName={toastNotification.contactName}
            message={toastNotification.message}
            avatar={toastNotification.avatar}
            onClose={() => setToastNotification(null)}
        />
      )}
      <Sidebar 
        contacts={filteredContacts} 
        onSelectChat={handleSelectChat} 
        activeChatId={activeChatId}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        userAvatar={currentUser.avatar}
        onOpenProfile={handleOpenProfile}
      />
      {activeContact && activeConversation ? (
        <ChatWindow
          contact={activeContact}
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          onStartCall={handleStartCall}
          onOpenContactProfile={handleOpenContactProfile}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
            <p>الرجاء تحديد محادثة</p>
        </div>
      )}
      {isCallActive && activeContact && (
        <VideoCall 
          contact={activeContact}
          onEndCall={handleEndCall}
        />
      )}
      {isProfilePageOpen && (
        <UserProfilePage
          user={currentUser}
          onClose={handleCloseProfile}
          onSave={handleUpdateProfile}
        />
      )}
      {isContactProfileOpen && editingContact && (
        <ContactProfile
          contact={editingContact}
          onClose={handleCloseContactProfile}
          onSave={handleUpdateContactProfile}
        />
      )}
    </div>
  );
};

export default App;