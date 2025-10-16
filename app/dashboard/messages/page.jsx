// frontend/app/messages/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaPaperPlane, FaBars, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../../../lib/auth/AuthContext";
import io from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const socket = io(API_BASE || undefined, {
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
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

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

    console.log("Current user:", user);
    console.log("Using Clerk user ID:", user.id);

    socket.auth = { userId: user.id };
    socket.connect();

    const fetchChats = async () => {
      try {
        console.log("Fetching chats for user ID:", user.id);

        // Use fetch with explicit error handling
        const response = await fetch(`${API_BASE}/api/chat/my-chats`, {
          headers: {
            "x-clerk-user-id": user.id,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch chats: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Initial chats data:", data);
        setChats(data.chats || []);
        setTotalUnread(data.totalUnread || 0);
        if (data.chats && data.chats.length > 0) setSelectedChat(data.chats[0]);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(`Failed to load chats: ${err.message}`);
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

    // Listen for chat updates (new messages, read status changes)
    socket.on("updatedChats", (updatedChats) => {
      console.log("Received updated chats:", updatedChats);
      setChats(updatedChats || []);

      // Calculate total unread manually from chat data
      const newTotalUnread = (updatedChats || []).reduce((sum, chat) => {
        const unreadCount = chat.unreadCount || 0;
        return sum + unreadCount;
      }, 0);
      console.log("Calculated new total unread:", newTotalUnread);
      setTotalUnread(newTotalUnread);

      // If we have a selected chat, update it with the latest data
      if (selectedChat) {
        const updatedSelectedChat = updatedChats.find(
          (chat) => chat._id === selectedChat._id
        );
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      }
    });

    // Listen for total unread count updates
    socket.on("totalUnreadCount", (count) => {
      console.log("Received total unread count:", count);
      setTotalUnread(count || 0);
    });

    // Request total unread count periodically
    const unreadInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("getTotalUnreadCount");
      }
    }, 30000); // Check every 30 seconds

    return () => {
      socket.disconnect();
      socket.off("error");
      socket.off("updatedChats");
      socket.off("totalUnreadCount");
      clearInterval(unreadInterval);
    };
  }, [user]);

  // Fetch messages and join chat when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        console.log(`Fetching messages for chat: ${selectedChat._id}`);

        const response = await fetch(
          `${API_BASE}/api/chat/${selectedChat._id}/messages`,
          {
            headers: {
              "x-clerk-user-id": user.id,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Messages response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch messages: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Received messages:", data);

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
        setError(`Failed to load messages: ${err.message}`);
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

      // If this is the current chat, mark as seen
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
        senderName: `${user.firstName} ${user.lastName}` || "You",
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
    if (!chat || !chat.participantData) return "Unknown";

    const otherParticipant = chat.participantData.find((p) => !p.isCurrentUser);

    return otherParticipant?.name || "Unknown";
  };

  // Select a chat and mark as read
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowSidebar(false);

    // Mark messages as seen when selecting a chat
    if (chat && chat._id) {
      socket.emit("markMessagesSeen", {
        chatId: chat._id,
        userId: user.id,
      });

      // Update local unread count immediately for better UX
      const updatedChats = chats.map((c) => {
        if (c._id === chat._id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });

      setChats(updatedChats);

      // Recalculate total unread count
      const newTotalUnread = updatedChats.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
      setTotalUnread(newTotalUnread);
    }
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

  // Calculate the chat count
  const chatCount = chats.length;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white font-sans relative">
      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 z-20 bg-white h-full md:h-full w-full sm:w-[320px] border-r border-gray-300 flex flex-col transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-300 flex justify-between items-center shrink-0">
          <h2 className="font-semibold text-lg">Messages</h2>
          {chatCount > 0 && (
            <div className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
              {chatCount}
            </div>
          )}
        </div>

        {/* Chat List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 py-4">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`flex items-center gap-2 p-3 hover:bg-gray-100 rounded-lg cursor-pointer ${
                  selectedChat && selectedChat._id === chat._id
                    ? "bg-blue-50"
                    : ""
                }`}
                onClick={() => handleSelectChat(chat)}
              >
                <div className="w-12 h-12 bg-green-400 rounded-full flex-shrink-0"></div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm truncate">
                      {getParticipantName(chat)}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs ml-2">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate w-full">
                    {chat.lastMessage ? (
                      <>
                        <span className="font-medium">
                          {chat.lastMessage.sender === user.id ? "You: " : ""}
                        </span>
                        {chat.lastMessage.content || "No message content"}
                      </>
                    ) : (
                      "No messages yet"
                    )}
                  </div>
                  {chat.lastMessage && (
                    <div className="text-xs text-gray-400">
                      {new Date(chat.lastMessage.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header - Fixed */}
        <div className="border-b border-gray-300 p-4 flex items-center justify-between shrink-0">
          <div>
            <div className="font-medium text-lg">
              {selectedChat
                ? getParticipantName(selectedChat)
                : "Select a chat"}
            </div>
            {selectedChat && selectedChat.carId && (
              <div className="text-xs text-gray-500">
                Car: {selectedChat.carId.title || "Unknown Car"}
              </div>
            )}
          </div>
          <button
            className="md:hidden fixed top-24 right-4 z-10 p-2 px-5 bg-white border rounded-md shadow flex items-center gap-2"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <div className="relative">
              <FaEnvelope className="text-blue-500" size={20} />
              {chatCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {chatCount}
                </div>
              )}
            </div>
            <span className="font-medium">Inbox</span>
          </button>
        </div>

        {/* Messages Container - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
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
                      {!message.sender === user.id &&
                        !message.senderId === user.id && (
                          <div className="font-medium text-xs text-gray-600 mb-1">
                            {message.senderName || "Unknown"}
                          </div>
                        )}
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

        {/* Message Input - Fixed at bottom */}
        {selectedChat && (
          <div className="p-4 border-t border-gray-300 flex items-center gap-2 shrink-0 bg-white">
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
