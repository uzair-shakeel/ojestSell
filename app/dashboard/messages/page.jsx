'use client'
import React, { useState, useEffect, useRef } from "react";

const conversations = [
  { id: 1, name: "John Doe", messages: [
    { text: "Hello!", sender: "other" },
    { text: "How are you?", sender: "other" },
    { text: "What's up?", sender: "other" }
  ]},
  { id: 2, name: "Jane Smith", messages: [
    { text: "Hey!", sender: "other" },
    { text: "Let's meet up.", sender: "other" },
    { text: "See you soon!", sender: "other" }
  ]},
  { id: 3, name: "Alice Johnson", messages: [
    { text: "Good morning!", sender: "other" },
    { text: "Hope you have a great day.", sender: "other" }
  ]},
];

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      setSelectedConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, { text: newMessage, sender: "user" }],
      }));
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-screen border border-gray-300 relative">
      <button
        className="md:hidden absolute top-4 right-4 bg-blue-500 text-white p-2 rounded"
        onClick={() => setIsMobileView(!isMobileView)}
      >
        {isMobileView ? "Hide" : "Show Conversations"}
      </button>
      {/* Left side - Conversations list */}
      <div
        className={`w-1/3 border-r border-gray-300 p-4 bg-gray-100 md:block ${
          isMobileView ? "absolute top-0 left-0 w-full h-full bg-white z-10" : "hidden"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">Conversations</h2>
        <ul>
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                setIsMobileView(false);
              }}
              className="p-2 cursor-pointer hover:bg-gray-200 rounded-lg"
            >
              {conversation.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Right side - Messages display */}
      <div className="w-full md:w-2/3 p-4 flex flex-col">
        {selectedConversation ? (
          <div className="flex flex-col flex-grow">
            <h2 className="text-lg font-bold mb-4">{selectedConversation.name}</h2>
            <div className="space-y-2 flex-grow overflow-auto">
              {selectedConversation.messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg w-fit max-w-xs ${
                    message.sender === "user" 
                      ? "bg-blue-500 text-white ml-auto" 
                      : "bg-gray-200 text-gray-700 mr-auto"
                  }`}
                >
                  {message.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-l-lg"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-500 text-white rounded-r-lg"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center flex-grow flex items-center justify-center">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;