import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, PaperclipIcon, MicIcon } from './icons/Icons';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

// Allow TypeScript to recognize prefixed SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

/**
 * A simple sanitization function to prevent XSS attacks by stripping all HTML tags,
 * ensuring only plain text is processed.
 * For a production-grade application, a more robust library like DOMPurify is recommended.
 * @param input The raw string input which may contain HTML.
 * @returns The sanitized plain text string.
 */
const sanitizeInput = (input: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = input;
  return tempDiv.textContent || tempDiv.innerText || '';
};

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // Set language to Arabic

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'network') {
        alert('حدث خطأ في الشبكة أثناء محاولة التعرف على الصوت. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
      } else if (event.error !== 'aborted') { // Don't show an alert if the user manually stops it
         alert(`حدث خطأ في التعرف على الصوت: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setText(transcript);
    };

    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      recognitionRef.current?.abort();
    }
    
    const trimmedText = text.trim();
    if (trimmedText) {
      // Sanitize the input to strip any potential HTML, preventing XSS.
      const sanitizedText = sanitizeInput(trimmedText);
      onSendMessage(sanitizedText);
      setText('');
    }
  };
  
  const handleMicButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!text.trim()) {
      e.preventDefault(); // Prevent submitting empty form
      const recognition = recognitionRef.current;
      if (!recognition) return;
      
      if (isRecording) {
        recognition.stop();
      } else {
        setText(''); // Clear text for new recording
        try {
            recognition.start();
        } catch(err) {
            // This can happen if start() is called too soon after stop()
            console.error("Error starting speech recognition:", err);
            setIsRecording(false);
        }
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Stop recording if user starts typing
    if (isRecording) {
      recognitionRef.current?.abort();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <button type="button" className="text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
        <PaperclipIcon className="w-6 h-6" />
      </button>
      <div className="flex-1">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder="اكتب رسالة أو استخدم /imagine لإنشاء صورة..."
          className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-full py-3 px-5 transition resize-none"
          rows={1}
        />
      </div>
      <button
        type="submit"
        onClick={handleMicButtonClick}
        className={`text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-teal-600 hover:bg-teal-700'}`}
        disabled={!text.trim() && !recognitionRef.current}
        aria-label={text ? "Send message" : (isRecording ? "Stop recording" : "Start recording")}
      >
        {text ? <SendIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
      </button>
    </form>
  );
};

export default MessageInput;