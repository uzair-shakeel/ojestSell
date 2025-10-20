// frontend/app/messages/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaPaperPlane, FaBars, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../../../lib/auth/AuthContext";
import io from "socket.io-client";
import Avatar from "../../../components/both/Avatar";

// Use empty string (same-origin) if NEXT_PUBLIC_API_BASE_URL is not set
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";
const SOCKET_TRANSPORT = (process.env.NEXT_PUBLIC_SOCKET_TRANSPORT || "websocket,polling")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const socket = io(SOCKET_BASE, {
  path: SOCKET_PATH,
  autoConnect: false,
  withCredentials: true,
  transports: SOCKET_TRANSPORT,
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
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
  const { user, token } = useAuth();

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

    const myUserId = user?.id || user?._id;
    socket.auth = { userId: myUserId };
    console.log("[Socket] connecting to:", SOCKET_BASE);
    socket.connect();
    socket.on("connect", () => console.log("[Socket] connected:", socket.id));
    socket.on("connect_error", (err) => console.error("[Socket] connect_error:", err?.message || err));
    socket.on("disconnect", (reason) => console.warn("[Socket] disconnected:", reason));
    // Let backend put this socket into the user's personal room
    if (myUserId) socket.emit("join", myUserId);

    const fetchChats = async () => {
      try {
        const myUserId = user?.id || user?._id;
        console.log("Fetching chats for user ID:", myUserId);

        // Use fetch with explicit error handling
        const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const response = await fetch(`${API_BASE}/api/chat/my-chats`, {
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
        const chatsArray = Array.isArray(data) ? data : data.chats || [];
        setChats(chatsArray);
        // totalUnread may be computed on server or we compute locally
        const initialUnread = chatsArray.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(typeof data.totalUnread === "number" ? data.totalUnread : initialUnread);
        if (chatsArray.length > 0) setSelectedChat(chatsArray[0]);
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

    // Listen for chat updates (if emitted by backend elsewhere)
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
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      clearInterval(unreadInterval);
    };
  }, [user]);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        console.log(`Fetching messages for chat: ${selectedChat._id}`);

        const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const response = await fetch(
          `${API_BASE}/api/chat/${selectedChat._id}/messages`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(`Failed to load messages: ${err.message}`);
      }
    };

    fetchMessages();

    socket.on("newMessage", (payload) => {
      // Backend emits: { chatId, message: { id, content, sender, timestamp } }
      if (!payload || !payload.message) return;
      const { chatId, message } = payload;
      const myUserId = user?.id || user?._id;

      const processedMessage = {
        _id: message.id,
        chatId,
        sender: message.sender,
        content: message.content,
        text: message.content,
        createdAt: message.timestamp,
      };

      // Update chat list: lastMessage and unreadCount
      setChats((prevChats) => {
        const updated = (prevChats || []).map((c) => {
          if (c._id !== chatId) return c;
          const isIncoming = message.sender !== myUserId;
          return {
            ...c,
            lastMessage: {
              content: message.content,
              sender: message.sender,
              timestamp: message.timestamp,
            },
            unreadCount:
              selectedChat && selectedChat._id === chatId
                ? 0
                : (c.unreadCount || 0) + (isIncoming ? 1 : 0),
          };
        });
        return updated;
      });

      // If current chat is open, append/replace in thread
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => {
          // Try to replace optimistic message by matching text and sender
          const idx = prev.findIndex(
            (m) => m.text === processedMessage.text && (m.sender === processedMessage.sender || m.senderId === processedMessage.sender)
          );
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...processedMessage };
            return copy;
          }
          return [...prev, processedMessage];
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
    // Emit payload expected by backend: { chatId, content, senderId }
    const myUserId = user?.id || user?._id;
    socket.emit("sendMessage", {
      chatId: selectedChat._id,
      senderId: myUserId,
      content: newMessage,
    });
    console.log("message sent", { chatId: selectedChat._id, senderId: myUserId, content: newMessage });
    setNewMessage("");
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        sender: myUserId,
        senderId: myUserId,
        createdAt: new Date(),
        seenBy: [user.id],
        senderName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "You",
        content: newMessage,
        text: newMessage,
      },
    ]);
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedChat && user) {
      const myUserId = user?.id || user?._id;
      socket.emit("typing", { chatId: selectedChat._id, userId: myUserId });
    }
  };

  // Get other participant's name
  const getParticipantName = (chat) => {
    if (!chat) return "Unknown";
    // Prefer participantData if present
    if (Array.isArray(chat.participantData) && chat.participantData.length > 0) {
      const other = chat.participantData.find((p) => !p.isCurrentUser);
      if (other?.name) return other.name;
    }
    // Fallback to participants array from backend controller
    if (Array.isArray(chat.participants)) {
      const meId = user?.id;
      const other = chat.participants.find((p) => p.id !== meId);
      if (other) {
        const name = `${other.firstName || ""} ${other.lastName || ""}`.trim();
        return name || other.email || "Unknown";
      }
    }
    return "Unknown";
  };

  // Resolve other participant's image (supports various backend shapes)
  const getParticipantImage = (chat) => {
    if (!chat) return null;
    // Prefer participantData if present
    if (Array.isArray(chat.participantData) && chat.participantData.length > 0) {
      const other = chat.participantData.find((p) => !p.isCurrentUser);
      return other?.image || other?.profilePicture || null;
    }
    // Fallback to participants array
    if (Array.isArray(chat.participants)) {
      const meId = user?.id;
      const other = chat.participants.find((p) => p.id !== meId);
      return other?.image || other?.profilePicture || null;
    }
    return null;
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
                className={`flex items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer ${
                  selectedChat && selectedChat._id === chat._id
                    ? "bg-blue-50 dark:bg-gray-900"
                    : ""
                }`}
                onClick={() => handleSelectChat(chat)}
              >
                <Avatar
                  src={getParticipantImage(chat)}
                  alt={getParticipantName(chat)}
                  size={48}
                />
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
                          ? "bg-blue-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                          : "bg-white border border-gray-300 dark:border-gray-600"
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
