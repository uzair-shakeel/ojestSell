// frontend/app/messages/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FaSearch, FaPaperPlane, FaBars, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../../../lib/auth/AuthContext";
import io from "socket.io-client";
import Avatar from "../../../components/both/Avatar";

// Use empty string (same-origin) if NEXT_PUBLIC_API_BASE_URL is not set
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io/";
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
  const { user, token, userId: authUserId } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (authUserId) {
      socket.emit("join", authUserId);
    }

    // return () => {
    //   socket.disconnect();
    // };
  }, [authUserId]);

  // Helper: current user ID across backends (_id or id)
  // Try multiple sources to get the user ID
  const myUserId = user?.id || user?._id || authUserId;

  // Date/Time formatters: DD/MM/YY and 24-hour HH:mm
  const fmtDateTime = (d) => {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
  };
  const fmtTime = (d) => {
    const date = new Date(d);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  };

  // Generate temporary ID for optimistic updates
  const generateTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Connect to Socket.IO and fetch chats
  useEffect(() => {
    if (!user) {
      console.warn("⚠️ No user, skipping socket connection");
      return;
    }

    console.log("👤 Current user:", user);
    console.log("🆔 Resolved user ID:", myUserId);
    console.log("🔑 User ID type:", typeof myUserId, "Value:", myUserId);

    if (!myUserId) {
      console.error("❌ No valid user ID found! Cannot connect socket.");
      return;
    }



    // Remove all old listeners to prevent duplicates
    socket.removeAllListeners();

    // Set new auth for this user
    socket.auth = { userId: myUserId };
    console.log("[Socket] connecting to:", SOCKET_BASE, "with auth:", socket.auth);
    console.log("🔧 Socket options:", {
      path: SOCKET_PATH,
      transports: SOCKET_TRANSPORT,
      withCredentials: true,
      timeout: 20000
    });

    socket.connect();

    // Add timeout to detect if connection is hanging
    const connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        console.error("⏰ Socket connection TIMEOUT after 5 seconds!");
        console.error("Socket is still trying to connect but hasn't succeeded");
        console.error("This usually means:");
        console.error("1. Server is not running");
        console.error("2. Wrong URL/port");
        console.error("3. CORS blocking the connection");
        console.error("4. Firewall blocking the connection");
      }
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(connectionTimeout);
      console.log("✅✅✅ [Socket] CONNECTED SUCCESSFULLY! ✅✅✅");
      console.log("Socket ID:", socket.id);
      console.log("🔌 Transport:", socket.io.engine.transport.name);
      console.log("⚡ Socket.connected:", socket.connected);
      console.log("🔐 Auth used:", socket.auth);

      // Join room after connection is established
      if (myUserId) {
        socket.emit("join", myUserId);
        console.log("🚪 Emitted join event for room:", myUserId);
      } else {
        console.error("❌ Cannot join room - myUserId is undefined!");
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌❌❌ [Socket] CONNECT ERROR! ❌❌❌");
      console.error("Error:", err);
      console.error("Error message:", err?.message);
      console.error("🔍 Auth being used:", socket.auth);
      console.error("🔍 Socket URL:", SOCKET_BASE);
      console.error("🔍 Socket path:", SOCKET_PATH);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️⚠️⚠️ [Socket] DISCONNECTED! ⚠️⚠️⚠️");
      console.warn("Reason:", reason);
      console.warn("Socket.connected:", socket.connected);
    });

    const fetchChats = async () => {
      try {
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
        const sortedChats = [...chatsArray].sort((a, b) => {
          const ta = new Date(a?.lastMessage?.timestamp || a?.updatedAt || 0).getTime();
          const tb = new Date(b?.lastMessage?.timestamp || b?.updatedAt || 0).getTime();
          return tb - ta;
        });
        setChats(sortedChats);
        // totalUnread may be computed on server or we compute locally
        const initialUnread = sortedChats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(typeof data.totalUnread === "number" ? data.totalUnread : initialUnread);
        if (sortedChats.length > 0) {
          const targetId = searchParams?.get("chatId");
          if (targetId) {
            const match = sortedChats.find((c) => String(c._id) === String(targetId));
            setSelectedChat(match || sortedChats[0]);
          } else {
            setSelectedChat(sortedChats[0]);
          }
        }
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
      const sorted = [...(updatedChats || [])].sort((a, b) => {
        const ta = new Date(a?.lastMessage?.timestamp || a?.updatedAt || 0).getTime();
        const tb = new Date(b?.lastMessage?.timestamp || b?.updatedAt || 0).getTime();
        return tb - ta;
      });
      setChats(sorted);

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
        // Only update if something meaningful changed to avoid effect re-runs
        if (updatedSelectedChat && JSON.stringify(updatedSelectedChat) !== JSON.stringify(selectedChat)) {
          setSelectedChat((prev) => (prev && prev._id === updatedSelectedChat._id ? { ...prev, ...updatedSelectedChat } : prev));
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
      clearTimeout(connectionTimeout);
      // socket.disconnect();
      socket.off("error");
      socket.off("updatedChats");
      socket.off("totalUnreadCount");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      clearInterval(unreadInterval);
    };
  }, [user, searchParams]);

  // Fetch messages when selected chat ID changes
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {
        console.log(`🔄 Fetching messages for chat: ${selectedChat._id}`);

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

        // Preserve any pending messages when loading chat history
        setMessages((prev) => {
          const pendingMessages = prev.filter((m) => m.pending && m.chatId === selectedChat._id);
          return [...processedData, ...pendingMessages];
        });
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

      console.log("🔔 Raw socket payload:", { chatId, message, myUserId });

      const processedMessage = {
        _id: message.id,
        chatId,
        sender: message.sender,
        content: message.content,
        text: message.content,
        createdAt: message.timestamp,
      };

      console.log("📦 Processed message:", processedMessage);

      // Emit notification if message is from someone else
      if (String(message.sender) !== String(myUserId)) {
        try {
          window.dispatchEvent(
            new CustomEvent("ojest:notify", {
              detail: {
                type: "message",
                title: "New message",
                body: message.content || "You have a new message",
                meta: { chatId, messageId: message.id },
              },
            })
          );
        } catch (e) {
          console.error("Failed to dispatch notification:", e);
        }
      }

      // Add a readable senderName for display
      try {
        if (String(message.sender) === String(myUserId)) {
          processedMessage.senderName = "You";
        } else if (selectedChat) {
          // Try to resolve other participant name from selectedChat
          let name = null;
          if (Array.isArray(selectedChat.participantData) && selectedChat.participantData.length > 0) {
            const other = selectedChat.participantData.find((p) => !p.isCurrentUser);
            name = other?.name || `${other?.firstName || ""} ${other?.lastName || ""}`.trim();
          }
          if (!name && Array.isArray(selectedChat.participants)) {
            const meId = myUserId;
            const other = selectedChat.participants.find((p) => String(p.id) !== String(meId));
            name = `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || other?.email;
          }
          processedMessage.senderName = name || "Unknown";
        }
      } catch (_) {
        processedMessage.senderName = processedMessage.senderName || "Unknown";
      }

      // Update chat list: lastMessage and unreadCount
      setChats((prevChats) => {
        const updated = (prevChats || []).map((c) => {
          if (c._id !== chatId) return c;
          const isIncoming = String(message.sender) !== String(myUserId);
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
        // Recompute total unread from updated list
        const total = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(total);
        return updated;
      });

      // If current chat is open, append/replace in thread
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => {
          console.log("📨 Received newMessage event", { chatId, message, currentMessages: prev.length });

          // Check if this is our own message by matching sender
          const isOwnMessage = String(message.sender) === String(myUserId);

          if (isOwnMessage) {
            // Find the most recent pending message with matching content
            // Search from end to start to get the latest one
            let pendingIdx = -1;
            const searchText = (processedMessage.text || "").trim();

            for (let i = prev.length - 1; i >= 0; i--) {
              const pendingText = (prev[i].text || "").trim();
              if (prev[i].pending && pendingText === searchText) {
                pendingIdx = i;
                break;
              }
            }

            if (pendingIdx !== -1) {
              // Replace the optimistic message with the real one
              console.log("✅ Replacing pending message", {
                index: pendingIdx,
                tempId: prev[pendingIdx]._id,
                realId: processedMessage._id,
                content: processedMessage.text
              });
              const copy = [...prev];
              copy[pendingIdx] = { ...processedMessage, pending: false };
              return copy;
            } else {
              console.log("⚠️ No pending message found", {
                pendingCount: prev.filter(m => m.pending).length,
                searchingFor: processedMessage.text,
                allPending: prev.filter(m => m.pending).map(m => ({ id: m._id, text: m.text }))
              });
            }
          }

          // Check if message already exists (avoid duplicates)
          const exists = prev.some((m) => m._id === processedMessage._id);
          if (exists) {
            console.log("ℹ️ Message already exists, skipping", processedMessage._id);
            return prev;
          }

          // Add new message
          console.log("➕ Adding new message", { id: processedMessage._id, text: processedMessage.text });
          return [...prev, processedMessage];
        });

        // If an incoming message arrives while chat is open, mark it read now
        if (String(message.sender) !== String(myUserId)) {
          socket.emit("markAsRead", { chatId, userId: myUserId });
          // Also ensure its unreadCount is 0 locally
          setChats((prev) =>
            (prev || []).map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c))
          );
          // Recompute total unread
          setTotalUnread((prev) => {
            const list = (chats || []).map((c) =>
              c._id === chatId ? { ...c, unreadCount: 0 } : c
            );
            return list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          });
        }
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
      if (chatId === selectedChat._id && String(userId) !== String(myUserId)) {
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
  }, [selectedChat?._id, user]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const tempId = generateTempId();
    const messageContent = newMessage;
    const timestamp = new Date();

    // Add optimistic message immediately
    const optimisticMessage = {
      _id: tempId,
      chatId: selectedChat._id, // Add chatId for filtering
      sender: myUserId,
      senderId: myUserId,
      createdAt: timestamp,
      seenBy: [myUserId],
      senderName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "You",
      content: messageContent,
      text: messageContent,
      pending: true, // Mark as pending
      tempId: tempId, // Store temp ID for matching
    };

    setMessages((prev) => {
      console.log("📤 Adding optimistic message", optimisticMessage);
      return [...prev, optimisticMessage];
    });
    setNewMessage("");

    // Check socket connection before sending
    console.log("🔍 Socket state before sending:", {
      connected: socket.connected,
      disconnected: socket.disconnected,
      id: socket.id,
      auth: socket.auth
    });

    if (!socket.connected) {
      console.error("❌❌❌ Socket NOT connected! Attempting to reconnect...");
      console.error("Socket state:", {
        connected: socket.connected,
        disconnected: socket.disconnected,
        id: socket.id
      });
      socket.connect();

      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!socket.connected) {
        console.error("❌ Still not connected after reconnect attempt!");
        alert("Cannot send message - socket connection failed. Please refresh the page.");
        return;
      }
    }

    // Emit to backend
    console.log("🚀 Emitting message to server...", {
      socketConnected: socket.connected,
      chatId: selectedChat._id,
      senderId: myUserId,
      content: messageContent,
      tempId
    });

    socket.emit("sendMessage", {
      chatId: selectedChat._id,
      senderId: myUserId,
      content: messageContent,
      tempId: tempId, // Send temp ID to backend for matching
    });
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedChat && user) {
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
      const meId = myUserId;
      const other = chat.participants.find((p) => String(p.id) !== String(meId));
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
      const meId = myUserId;
      const other = chat.participants.find((p) => String(p.id) !== String(meId));
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
      socket.emit("markAsRead", {
        chatId: chat._id,
        userId: myUserId,
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
    <div className="flex h-[calc(100vh-70px)] bg-gray-50 dark:bg-dark-card font-sans overflow-hidden relative transition-colors duration-300">
      {/* Sidebar - Floating Card Style */}
      <div
        className={`absolute md:relative inset-y-0 left-0 z-20 h-full w-full sm:w-[360px] md:w-[380px] flex flex-col transform transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 p-4 md:pr-0`}
      >
        <div className="bg-white dark:bg-dark-main rounded-3xl shadow-xl h-full flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-dark-panel transition-colors">
            <div>
              <h2 className="font-extrabold text-2xl text-gray-900 dark:text-gray-200 dark:text-white tracking-tight">Wiadomości</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Twoje konwersacje</p>
            </div>
            {totalUnread > 0 && (
              <div className="bg-red-500 text-white rounded-xl px-3 py-1 text-xs font-bold shadow-red-200 shadow-md">
                {totalUnread} nowych
              </div>
            )}
          </div>

          {/* Chat List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 space-y-3 py-4 custom-scrollbar">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedChat && selectedChat._id === chat._id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm"
                    : "bg-white dark:bg-dark-main border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-100 dark:hover:border-gray-600"
                    }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="relative">
                    <Avatar
                      src={getParticipantImage(chat)}
                      alt={getParticipantName(chat)}
                      size={56}
                      imgClassName="rounded-2xl"
                    />
                    {chat.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className={`text-sm truncate ${chat.unreadCount > 0 ? "font-bold text-gray-900 dark:text-gray-200 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-300"}`}>
                        {getParticipantName(chat)}
                      </div>
                      {chat.lastMessage && (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-card px-2 py-1 rounded-lg">
                          {fmtTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className={`truncate w-full text-sm ${chat.unreadCount > 0 ? "text-gray-900 dark:text-gray-200 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                      {chat.lastMessage ? (
                        <>
                          <span className="font-semibold text-gray-400 dark:text-gray-500 mr-1">
                            {String(chat.lastMessage.sender) === String(myUserId) ? "Ty:" : ""}
                          </span>
                          {chat.lastMessage.content || "Empty message"}
                        </>
                      ) : (
                        <span className="italic text-gray-400">Rozpocznij konwersację</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <FaEnvelope size={24} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Brak wiadomości</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative p-4 pl-0 md:pl-4 transition-colors duration-300">
        <div className="bg-white dark:bg-dark-main rounded-3xl shadow-xl h-full flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden relative transition-colors duration-300">
          {/* Chat Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0 bg-white dark:bg-dark-panel z-10 transition-colors">
            <div className="flex items-center gap-4">
              {/* Mobile: sidebar toggle */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowSidebar((prev) => !prev)}
              >
                <FaBars className="h-4 w-4" />
              </button>
              {selectedChat ? (
                <div className="flex items-center gap-4">
                  <Avatar
                    src={getParticipantImage(selectedChat)}
                    alt={getParticipantName(selectedChat)}
                    size={48}
                    imgClassName="rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                  />
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-gray-200 dark:text-white transition-colors">
                      {getParticipantName(selectedChat)}
                    </div>
                    {selectedChat.carId && (
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg inline-block mt-1">
                        AUTO: {selectedChat.carId.title || "Nieznane"}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="font-bold text-lg text-gray-400">Wybierz konwersację</div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/30 dark:bg-dark-card/10 custom-scrollbar transition-colors">
            {selectedChat ? (
              messages.length > 0 ? (
                <>
                  {messages.map((message, index) => {
                    const isMe = String(message.sender) === String(myUserId) || String(message.senderId) === String(myUserId);
                    const isLast = index === messages.length - 1;

                    return (
                      <div
                        key={message._id || message.tempId}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                      >
                        <div className={`max-w-[75%] md:max-w-[60%] flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          {/* Optional small avatar next to message bubbles */}
                          {/* <Avatar src={isMe ? user?.image : getParticipantImage(selectedChat)} size={32} imgClassName="rounded-lg self-end" /> */}

                          <div
                            className={`px-6 py-4 rounded-2xl shadow-sm text-sm whitespace-pre-line relative transition-all duration-200 ${isMe
                              ? "bg-blue-600 text-white rounded-br-none shadow-blue-900/20"
                              : "bg-white dark:bg-dark-card text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-none shadow-black/5"
                              } ${message.pending ? "opacity-80" : "opacity-100"}`}
                          >
                            {String(message.sender) !== String(myUserId) &&
                              String(message.senderId) !== String(myUserId) && (
                                <div className="font-bold text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                                  {message.senderName || "Użytkownik"}
                                </div>
                              )}
                            {message.text || message.content}

                            <div className={`text-right text-[10px] font-bold mt-2 ${isMe ? 'text-blue-200' : 'text-gray-300 dark:text-gray-500'}`}>
                              {fmtTime(message.createdAt)}
                              {isMe && (
                                <span className="ml-2 inline-block">
                                  {message.pending ? (
                                    <span className="animate-pulse">●</span>
                                  ) : message.seenBy && message.seenBy.length > 1 ? (
                                    "✓✓"
                                  ) : (
                                    "✓"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-600 px-6 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-0" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 opacity-60">
                  <FaEnvelope size={48} className="mb-4" />
                  <p className="font-bold">To początek Waszej rozmowy</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600">
                <div className="w-24 h-24 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-6">
                  <FaPaperPlane size={32} className="ml-2" />
                </div>
                <p className="font-bold text-lg text-gray-400 dark:text-gray-500">Wybierz czat aby rozpocząć rozmowę</p>
              </div>
            )}
          </div>

          {/* Message Input - Floating */}
          {selectedChat && (
            <div className="p-4 md:p-6 bg-white dark:bg-dark-main border-t border-gray-100 dark:border-gray-700 z-10 transition-colors">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-card border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-2 pr-2 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50/50 dark:focus-within:ring-blue-900/20 transition-all">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  className="flex-1 bg-transparent outline-none border-none focus:ring-0 p-3 pl-4 text-sm font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Napisz wiadomość..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-600 transition-all shadow-lg dark:shadow-blue-900 shadow-blue-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  <FaPaperPlane size={14} className={newMessage.trim() ? "translate-x-0.5 translate-y-0.5" : ""} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
