'use client'
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaPaperPlane, FaBars, FaEnvelope } from "react-icons/fa";

const conversations = [
  {
    id: 1,
    name: "Jasmin Trewen",
    messages: [
      { text: "Hello!", sender: "user", time: "9:56 AM" },
      { text: "Hello, Jasmin Trewen! Welcome to the Champion Store WhatsApp! Let me know how I can help you.", sender: "agent", time: "9:57 AM" },
      { text: "Nothing.\nI just want to talk to you.", sender: "user", time: "10:07 AM" },
      { text: "What would you like to talk about? Can I help you?", sender: "agent", time: "10:15 AM" },
      { text: "I bought a book some time ago, but I lost it. What should I do? Should I buy it again here or just try to find it?", sender: "user", time: "10:28 AM" },
    ]
  },
  {
    id: 2,
    name: "Jonas Kahnwald",
    messages: [
      { text: "Hello! Is this the number of the Champion store?", sender: "user", time: "9:56 AM" },
      { text: "Hello, Jonas Kahnwald! Welcome to the dashboard.", sender: "agent", time: "9:57 AM" },
      { text: "I want to add a new car to the website.", sender: "user", time: "10:07 AM" },
      { text: "What would you like to talk about? Can I help you?", sender: "agent", time: "10:15 AM" },
      { text: "I bought a book  What should I do? Should I buy it again here or just try to find it?", sender: "user", time: "10:28 AM" },
    ]
  }
];

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setSelectedConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, { text: newMessage, sender: "agent", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      }));
      setNewMessage("");
    }
  };

  return (
    <div className="flex min-h-[570px] h-auto bg-white font-sans relative">
      <div className={`fixed md:static top-0 z-20 bg-white h-full w-full sm:w-[320px] border-r border-gray-300 flex flex-col transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 border-b border-gray-300">
          <input type="text" placeholder="Search here..." className="w-full px-3 py-2 border rounded-full text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex-1 overflow-auto px-4 space-y-2 py-4">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedConversation(conversation);
                setShowSidebar(false);
              }}
            >
              <div className="w-10 h-10 bg-green-400 rounded-full"></div>
              <div>
                <div className="font-medium text-sm">{conversation.name}</div>
                <div className="text-xs text-gray-500 truncate w-40">{conversation.messages[conversation.messages.length - 1].text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-300 p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-lg">{selectedConversation.name}</div>
          </div>
          <button
  className="md:hidden fixed top-24 right-4 z-10 p-2 px-5 bg-white border rounded-md shadow"
  onClick={() => setShowSidebar(!showSidebar)}
>
  <FaEnvelope className="text-blue-500" size={20} />
</button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50">
          {selectedConversation.messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[60%] px-4 py-2 rounded-lg text-sm whitespace-pre-line ${message.sender === 'user' ? 'bg-white border border-gray-300' : 'bg-blue-100 text-gray-800'}`}>
                {message.text}
                <div className="text-right text-[10px] text-gray-500 mt-1">{message.time}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-300 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-full px-4 text-sm"
            placeholder="Enter message..."
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-500 text-white rounded-full"
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
