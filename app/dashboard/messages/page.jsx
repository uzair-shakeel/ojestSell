// frontend/app/messages/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaPaperPlane, FaBars, FaEnvelope } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
});

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useUser();

  // Generate temporary ID for optimistic updates
  const generateTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Connect to Socket.IO and fetch chats
  useEffect(() => {
    if (!user) return;

    socket.auth = { userId: user.id };
    socket.connect();

    const fetchChats = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/chat/my-chats",
          {
            headers: {
              "x-clerk-user-id": user.id,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        console.log("all chats ", data);
        setChats(data);
        if (data.length > 0) setSelectedChat(data[0]);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Failed to load chats.");
      }
    };

    fetchChats();

    // Listen for errors
    socket.on("error", (message) => {
      console.error("Socket error:", message);
      setError(
        typeof message === "string"
          ? message
          : message.message || "An error occurred"
      );
    });

    return () => {
      socket.disconnect();
      socket.off("error");
    };
  }, [user]);

  // Fetch messages and join chat when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/chat/${selectedChat._id}/messages`,
          {
            headers: {
              "x-clerk-user-id": user.id,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();

        // Ensure messages have text field for display consistency
        const processedData = data.map((msg) => ({
          ...msg,
          text: msg.text || msg.content, // Use text if available, otherwise use content
        }));

        setMessages(processedData);
        socket.emit("joinChat", { chatId: selectedChat._id });
        socket.emit("markMessagesSeen", {
          chatId: selectedChat._id,
          userId: user.id,
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages.");
      }
    };

    fetchMessages();

    socket.on("chatHistory", (chatMessages) => {
      // Ensure all messages have text field
      const processedMessages = chatMessages.map((msg) => ({
        ...msg,
        text: msg.text || msg.content,
      }));
      setMessages(processedMessages);
    });

    socket.on("newMessage", (message) => {
      console.log("Received new message:", message);
      // Ensure message has text field
      const processedMessage = {
        ...message,
        text: message.text || message.content,
      };

      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (m) => m.tempId === processedMessage.tempId
        );
        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = processedMessage;
          return newMessages;
        }
        return [...prev, processedMessage];
      });

      setChats((prev) =>
        prev.map((chat) =>
          chat._id === processedMessage.chatId
            ? {
                ...chat,
                lastMessage: {
                  text: processedMessage.text,
                  createdAt: processedMessage.createdAt,
                },
              }
            : chat
        )
      );

      if (selectedChat._id === processedMessage.chatId) {
        socket.emit("markMessagesSeen", {
          chatId: selectedChat._id,
          userId: user.id,
        });
      }
    });

    socket.on("messagesSeen", (updatedMessages) => {
      // Ensure all messages have text field
      const processedMessages = updatedMessages.map((msg) => ({
        ...msg,
        text: msg.text || msg.content,
      }));

      setMessages((prev) =>
        prev.map((msg) => {
          const updatedMsg = processedMessages.find((m) => m._id === msg._id);
          return updatedMsg
            ? { ...updatedMsg, text: updatedMsg.text || updatedMsg.content }
            : msg;
        })
      );
    });

    socket.on("typing", ({ userId, chatId }) => {
      if (chatId === selectedChat._id && userId !== user.id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    return () => {
      socket.off("chatHistory");
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("typing");
    };
  }, [selectedChat, user]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const tempId = generateTempId();
    const message = {
      chatId: selectedChat._id,
      senderId: user.id,
      text: newMessage,
      tempId,
    };

    socket.emit("sendMessage", message);
    console.log("message sent", message);
    setNewMessage("");
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        _id: tempId,
        sender: user.id, // Match the field name from backend
        createdAt: new Date(),
        seenBy: [user.id],
      },
    ]);
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedChat && user) {
      socket.emit("typing", { chatId: selectedChat._id, userId: user.id });
    }
  };

  // Get other participant's name
  const getParticipantName = (chat) => {
    const otherParticipant = chat.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.name || "Unknown";
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Please log in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[570px] h-auto bg-white font-sans relative">
      <div
        className={`fixed md:static top-0 z-20 bg-white h-full md:h-auto w-full sm:w-[320px] border-r border-gray-300 flex flex-col transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex-1 overflow-auto px-4 space-y-2 py-20">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat._id}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  setSelectedChat(chat);
                  setShowSidebar(false);
                }}
              >
                <div className="w-10 h-10 bg-green-400 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">
                    {getParticipantName(chat)}
                  </div>
                  <div className="text-xs text-gray-500 truncate w-40">
                    {chat.lastMessage?.text || "No messages yet"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm mt-4">
              No chats yet
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-300 p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-lg">
              {selectedChat
                ? getParticipantName(selectedChat)
                : "Select a chat"}
            </div>
          </div>
          <button
            className="md:hidden fixed top-24 right-4 z-10 p-2 px-5 bg-white border rounded-md shadow flex items-center gap-2"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <FaEnvelope className="text-blue-500" size={20} />
            <span className="font-medium">Inbox</span>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50">
          {selectedChat ? (
            messages.length > 0 ? (
              <>
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender === user.id || message.senderId === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[60%] px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
                        message.sender === user.id ||
                        message.senderId === user.id
                          ? "bg-blue-100 text-gray-800"
                          : "bg-white border border-gray-300"
                      }`}
                    >
                      {message.text || message.content}
                      <div className="text-right text-[10px] text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {(message.sender === user.id ||
                          message.senderId === user.id) && (
                          <span className="ml-2">
                            {message.seenBy && message.seenBy.length > 1
                              ? "Seen"
                              : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="text-sm text-gray-500 italic">
                    {getParticipantName(selectedChat)} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <p className="text-center text-gray-500">No messages yet</p>
            )
          ) : (
            <p className="text-center text-gray-500">
              Select a chat to start messaging
            </p>
          )}
        </div>
        {selectedChat && (
          <div className="p-4 border-t border-gray-300 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              className="flex-1 p-2 border border-gray-300 rounded-full px-4 text-sm"
              placeholder="Enter message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-full"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
