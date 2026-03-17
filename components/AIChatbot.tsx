"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "สวัสดีครับ! ผมคือ PromoBot 🤖 มีอะไรให้ช่วยหาโปรโมชั่นไหมครับ?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.filter((m) => m.text !== "สวัสดีครับ! ผมคือ PromoBot 🤖 มีอะไรให้ช่วยหาโปรโมชั่นไหมครับ?"),
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "model", text: "ขอโทษครับ ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง 🙏" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* ปุ่มเปิดแชท (มุมขวาล่าง) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 animate-bounce"
          aria-label="Open AI Chatbot"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* หน้าต่างแชท */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-[350px] h-[500px] bg-white dark:bg-dark-surface rounded-2xl shadow-2xl flex flex-col border dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">PromoBot AI</span>
            </div>
            <button 
              onClick={handleClose} 
              className="hover:bg-purple-500 p-1.5 rounded-lg transition"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-bg">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "model" && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-purple-600 dark:text-purple-300" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-body-sm ${
                  msg.role === "user" 
                    ? "bg-purple-600 text-white rounded-tr-none" 
                    : "bg-white dark:bg-dark-surface border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm"
                }`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Loader2 size={16} className="text-purple-600 dark:text-purple-300 animate-spin" />
                </div>
                <div className="bg-white dark:bg-dark-surface border dark:border-gray-700 p-3 rounded-2xl rounded-tl-none text-gray-400 text-caption flex items-center">
                  กำลังพิมพ์...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-dark-surface flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="ถามหาโปรโมชั่น..."
              className="flex-1 bg-gray-100 dark:bg-dark-bg rounded-full px-4 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
