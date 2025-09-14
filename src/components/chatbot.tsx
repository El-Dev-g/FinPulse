// src/components/chatbot.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Loader, MessageSquare, Send, User, X, GripVertical, Bot } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { getChatbotResponse } from "@/lib/actions";
import { Avatar, AvatarFallback } from "./ui/avatar";
import faqContent from '@/content/faq.json';

type Message = {
  sender: "user" | "bot";
  text: string;
};

type ChatStage = 'collecting-name' | 'collecting-email' | 'chatting';

const CommandItem = ({ command, description, onSelect }: { command: string, description: string, onSelect: (command: string) => void }) => (
    <button 
        className="w-full text-left p-2 hover:bg-muted rounded-md"
        onClick={() => onSelect(command)}
    >
        <p className="font-semibold text-sm">{command}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
    </button>
)

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(faqContent.faqs);
  
  const [chatStage, setChatStage] = useState<ChatStage>('collecting-name');
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragInfo = useRef({ isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });
  
  const resetChat = useCallback(() => {
    // Check if user info is already collected in this session
    const sessionUserInfo = sessionStorage.getItem('chatbotUserInfo');
    if (sessionUserInfo) {
      const parsedInfo = JSON.parse(sessionUserInfo);
      setUserInfo(parsedInfo);
      setChatStage('chatting');
      setMessages([
          { sender: "bot", text: `Welcome back, ${parsedInfo.name}! How can I help you today? Type \`/\` to see what I can help with.` }
      ]);
    } else {
      setChatStage('collecting-name');
      setMessages([
          { sender: "bot", text: "Hello! Before we start, could I get your name?" }
      ]);
      setUserInfo({ name: "", email: "" });
    }

    setInput("");
    setIsLoading(false);
    setShowCommands(false);
    if (chatWindowRef.current) {
        chatWindowRef.current.style.transform = 'translate(0px, 0px)';
    }
    dragInfo.current = { isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 };
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetChat();
    }
  }, [isOpen, resetChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
        if(scrollAreaRef.current) {
             const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
             if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
             }
        }
    }, 100);
  };
  
  const sendQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;

    const userMessage = { sender: "user" as const, text: query };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowCommands(false);
    scrollToBottom();
    
    try {
        const response = await getChatbotResponse(query);
        setMessages(prev => [...prev, { sender: "bot", text: response.answer }]);
    } catch (error) {
        setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || input.trim() === '/') return;

    if (chatStage === 'chatting') {
        sendQuery(input);
    } else {
        const userMessage = { sender: "user" as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        
        if (chatStage === 'collecting-name') {
            const newInfo = {...userInfo, name: input};
            setUserInfo(newInfo);
            setChatStage('collecting-email');
            setMessages(prev => [...prev, { sender: 'bot', text: `Thanks ${input}! What's your email address?` }]);
        } else if (chatStage === 'collecting-email') {
            const newInfo = {...userInfo, email: input};
            setUserInfo(newInfo);
            setChatStage('chatting');
            // Save to session storage
            sessionStorage.setItem('chatbotUserInfo', JSON.stringify(newInfo));
            setMessages(prev => [...prev, { sender: 'bot', text: `Perfect. Thanks! I'm the FinPulse assistant. Type \`/\` to see what I can help with, or just ask a question.` }]);
        }
        setInput("");
    }
  };
  
  const handleCommandSelect = (question: string) => {
    const faq = faqContent.faqs.find(f => f.question === question);
    if (!faq) return;

    const userMessage: Message = { sender: "user", text: question };
    const botMessage: Message = { sender: "bot", text: faq.answer };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setShowCommands(false);
    setInput("");
    inputRef.current?.focus();
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInput(value);
      if (value.startsWith('/') && chatStage === 'chatting') {
          setShowCommands(true);
          const searchTerm = value.substring(1).toLowerCase();
          setFilteredCommands(faqContent.faqs.filter(faq => 
              faq.question.toLowerCase().includes(searchTerm)
          ));
      } else {
          setShowCommands(false);
      }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return; // Disable drag on mobile
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      dragInfo.current.isDragging = true;
      dragInfo.current.startX = e.clientX;
      dragInfo.current.startY = e.clientY;
    }
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragInfo.current.isDragging && chatWindowRef.current) {
      const deltaX = e.clientX - dragInfo.current.startX;
      const deltaY = e.clientY - dragInfo.current.startY;
      const newX = dragInfo.current.lastX + deltaX;
      const newY = dragInfo.current.lastY + deltaY;
      chatWindowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  }, []);

  const onMouseUp = useCallback((e: MouseEvent) => {
    if (dragInfo.current.isDragging) {
      dragInfo.current.isDragging = false;
      const deltaX = e.clientX - dragInfo.current.startX;
      const deltaY = e.clientY - dragInfo.current.startY;
      dragInfo.current.lastX += deltaX;
      dragInfo.current.lastY += deltaY;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const getPlaceholderText = () => {
    switch(chatStage) {
        case 'collecting-name': return "Your name...";
        case 'collecting-email': return "Your email...";
        case 'chatting': return "Ask a question or type '/'...";
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <MessageSquare />}
        </Button>
      </div>

      {isOpen && (
        <div
            ref={chatWindowRef}
            className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm md:w-full"
        >
          <Card className="shadow-2xl" onMouseDown={onMouseDown}>
            <CardHeader 
                className="flex flex-row items-center justify-between cursor-grab active:cursor-grabbing"
                data-drag-handle
            >
              <CardTitle>FinPulse Assistant</CardTitle>
              <GripVertical className="text-muted-foreground hidden md:block" />
            </CardHeader>
            <CardContent className="relative">
                {showCommands && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-background border rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto">
                        <p className="text-xs font-semibold text-muted-foreground px-2 pb-1">Ask about...</p>
                        {filteredCommands.length > 0 ? filteredCommands.map(faq => (
                            <CommandItem 
                                key={faq.question}
                                command={faq.question}
                                description={faq.answer.substring(0, 70) + "..."}
                                onSelect={() => handleCommandSelect(faq.question)}
                            />
                        )) : <p className="text-sm text-muted-foreground text-center p-4">No commands found.</p>}
                    </div>
                )}
              <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-end gap-2",
                        message.sender === "user" && "justify-end"
                      )}
                    >
                      {message.sender === "bot" && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg p-3 text-sm",
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.text}
                      </div>
                       {message.sender === "user" && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User size={20}/></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                      <div className="flex items-end gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                         <div className="bg-muted p-3 rounded-lg">
                            <Loader className="h-5 w-5 animate-spin"/>
                         </div>
                      </div>
                  )}
                </div>
              </ScrollArea>
              <form onSubmit={handleUserInput} className="mt-4 flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={getPlaceholderText()}
                  disabled={isLoading}
                  autoFocus
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim() || (input.trim() === '/' && chatStage === 'chatting')}>
                  <Send />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
