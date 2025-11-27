import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, FileText, X, Brain, Mic } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'welcome' | 'suggestion' | 'normal';
  citations?: {
    pageNumber: number;
    context: string;
    documentId: string;
  }[];
}

// Add this type for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

// Update the props interface
interface SummaryChatProps {
  donorId: string;
  donorName?: string; // Add donor name prop
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
}

export default function SummaryChat({ donorName, onCitationClick }: SummaryChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const notificationSound = useMemo(() => new Audio('/notification.mp3'), []);
  
  const welcomeMessages: Message[] = useMemo(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: '👋 Hello! I\'m your Donor Record Assistant. I can help you quickly find and analyze information in this donor record.',
      type: 'welcome'
    },
    {
      id: 'welcome-2',
      role: 'assistant',
      content: 'Try asking me questions like:',
      type: 'welcome'
    },
    {
      id: 'suggestion-1',
      role: 'assistant',
      content: '• What are the key contraindications?',
      type: 'suggestion'
    },
    {
      id: 'suggestion-2',
      role: 'assistant',
      content: '• Summarize the medical history',
      type: 'suggestion'
    },
    {
      id: 'suggestion-3',
      role: 'assistant',
      content: '• What are the latest lab results?',
      type: 'suggestion'
    }
  ], []);

  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      // Show welcome messages with a typing effect
      welcomeMessages.forEach((message, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, message]);
          notificationSound.play().catch(() => {}); // Play sound for each message
        }, index * 1000); // Show each message with a 1-second delay
      });
      setHasShownWelcome(true);
    }
  }, [isOpen, hasShownWelcome, notificationSound, welcomeMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  const handleSend = async (overrideInput?: string) => {
    const messageContent = overrideInput || input;
    if (!messageContent.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      type: 'normal'
    }]);

    setInput('');
    notificationSound.play().catch(() => {});

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Based on the donor records, I found relevant information:',
        type: 'normal',
        citations: [{
          pageNumber: 4,
          context: "Patient's medical history shows...",
          documentId: 'doc123'
        }]
      };
      setMessages(prev => [...prev, aiResponse]);
      notificationSound.play().catch(() => {});
    }, 1000);
  };

  // Check if browser supports speech recognition
  useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = () => {
    if (!voiceSupported) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* Floating Button with Pulse Effect */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 z-50 group"
      >
        <MessageSquare className="w-6 h-6" />
        {!isOpen && !hasShownWelcome && (
          <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b flex flex-col bg-blue-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Brain className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-medium">Donor Record Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {donorName && (
              <div className="text-sm text-gray-600 mt-1 ml-7">
                Donor: {donorName}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'suggestion'
                      ? 'bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                  onClick={() => message.type === 'suggestion' && handleSuggestionClick(message.content.replace('• ', ''))}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Citations */}
                  {message.citations && (
                    <div className="mt-2 space-y-2">
                      {message.citations.map((citation, index) => {
                        const documentId = typeof citation.documentId === 'string' 
                          ? parseInt(citation.documentId, 10) 
                          : citation.documentId;
                        return (
                          <button
                            key={index}
                            className="flex items-center text-xs bg-white bg-opacity-10 rounded p-2 hover:bg-opacity-20"
                            onClick={() => {
                              if (onCitationClick) {
                                onCitationClick('Chat Citation', citation.pageNumber, documentId);
                              }
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            <span>Page {citation.pageNumber}: {citation.context}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about this donor record..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              {voiceSupported && (
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 text-white ring-4 ring-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  title={isListening ? 'Listening...' : 'Start voice input'}
                >
                  {isListening ? (
                    <div className="relative">
                      <Mic className="w-5 h-5 animate-pulse" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-400 rounded-full" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-400 rounded-full animate-ping" />
                    </div>
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={() => handleSend()}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700"
              >
                Send
              </button>
            </div>
            {isListening && (
              <div className="mt-2 text-xs text-center text-gray-500 flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Listening... Speak your question</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 