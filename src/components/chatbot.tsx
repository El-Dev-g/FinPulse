// src/components/chatbot.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Loader, MessageSquare, Send, User, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { getChatbotResponse } from "@/lib/actions";
import { Avatar, AvatarFallback } from "./ui/avatar";

type Message = {
  sender: "user" | "bot";
  text: string;
};

enum ChatState {
  Initial,
  AskName,
  AskEmail,
  Ready,
  Loading,
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatState, setChatState] = useState(ChatState.Initial);
  
  const [userInfo, setUserInfo] = useState({ name: "", email: ""});

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        setChatState(ChatState.AskName);
        setMessages([
            { sender: "bot", text: "Hello! I'm the FinPulse assistant. What's your name?" }
        ]);
    } else {
        // Reset on close
        setMessages([]);
        setInput("");
        setChatState(ChatState.Initial);
        setUserInfo({ name: "", email: "" });
    }
  }, [isOpen]);

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


  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user" as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    switch(chatState) {
        case ChatState.AskName:
            setUserInfo(prev => ({...prev, name: input}));
            setChatState(ChatState.AskEmail);
            setMessages(prev => [...prev, { sender: "bot", text: `Nice to meet you, ${input}! What's your email address?` }]);
            break;
        case ChatState.AskEmail:
             setUserInfo(prev => ({...prev, email: input}));
             setChatState(ChatState.Ready);
             setMessages(prev => [...prev, { sender: "bot", text: "Great! What can I help you with today? Feel free to ask me anything about FinPulse." }]);
             break;
        case ChatState.Ready:
            setChatState(ChatState.Loading);
            try {
                const response = await getChatbotResponse(input);
                setMessages(prev => [...prev, { sender: "bot", text: response.answer }]);
            } catch (error) {
                setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I'm having trouble connecting. Please try again later." }]);
            } finally {
                setChatState(ChatState.Ready);
            }
            break;
    }
    scrollToBottom();
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  

  const getPlaceholderText = () => {
    switch (chatState) {
      case ChatState.AskName:
        return "Type your name...";
      case ChatState.AskEmail:
        return "Type your email...";
      case ChatState.Ready:
        return "Ask about FinPulse...";
      case ChatState.Loading:
        return "Waiting for response...";
      default:
        return "";
    }
  };

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
        <div className="fixed bottom-20 right-4 z-50 w-full max-w-sm">
          <Card className="shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>FinPulse Assistant</CardTitle>
            </CardHeader>
            <CardContent>
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
                            <AvatarFallback>FP</AvatarFallback>
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
                            <AvatarFallback><User/></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {chatState === ChatState.Loading && (
                      <div className="flex items-end gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>FP</AvatarFallback>
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholderText()}
                  disabled={chatState === ChatState.Initial || chatState === ChatState.Loading}
                />
                <Button type="submit" size="icon" disabled={chatState === ChatState.Initial || chatState === ChatState.Loading}>
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
