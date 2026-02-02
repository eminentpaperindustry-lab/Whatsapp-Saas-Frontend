import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../utils/api";
import { io } from "socket.io-client";
import {
  MessageSquare,
  Users,
  Filter,
  Archive,
  Search,
  Send,
  Phone,
  Mail,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  ArrowUp,
  Download,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function EnhancedChat() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // =========================
  // SOCKET.IO CONNECTION
  // =========================
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected");
      const tenantId = localStorage.getItem("tenantId") || "default";
      socketRef.current.emit("joinTenant", tenantId);
    });

    socketRef.current.on("message:new", (message) => {
      handleNewMessage(message);
    });

    socketRef.current.on("message:status_updated", (message) => {
      handleMessageStatusUpdate(message);
    });

    socketRef.current.on("session:updated", (session) => {
      handleSessionUpdate(session);
    });

    socketRef.current.on("session:deleted", (data) => {
      handleSessionDelete(data.phone);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  // =========================
  // LOAD INITIAL DATA
  // =========================
  useEffect(() => {
    loadSessions();
    loadStats();
  }, [filter, showArchived, pagination.page]);

  const loadSessions = async () => {
    try {
      const params = new URLSearchParams({
        filter,
        archived: showArchived,
        page: pagination.page,
        limit: pagination.limit
      });
      if (search) params.append('search', search);
      
      const res = await API.get(`/chat/sessions?${params}`);
      setSessions(res.data.sessions || []);
      setPagination(res.data.pagination || pagination);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error("Load sessions error:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await API.get("/chat/stats/summary");
      setStats(res.data.summary || {});
    } catch (err) {
      console.error("Load stats error:", err);
    }
  };

  // =========================
  // HANDLE NEW MESSAGE
  // =========================
  const handleNewMessage = (message) => {
    const phone = message.direction === "inbound" ? message.from : message.to;
    
    // Update messages if this session is open
    if (selectedSession?.phone === phone) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    }

    // Update sessions list
    setSessions(prev => {
      let sessionExists = false;
      
      const updated = prev.map(session => {
        if (session.phone === phone) {
          sessionExists = true;
          return {
            ...session,
            lastMessage: message.message || '[Media]',
            lastDirection: message.direction,
            lastStatus: message.status,
            lastInteraction: new Date(),
            updatedAt: new Date(),
            unreadCount: message.direction === 'inbound' ? session.unreadCount + 1 : 0,
            messageCount: session.messageCount + 1,
            hasReplied: message.direction === 'inbound' ? true : session.hasReplied
          };
        }
        return session;
      });

      // If new session, add it
      if (!sessionExists) {
        updated.unshift({
          phone,
          lastMessage: message.message || '[Media]',
          lastDirection: message.direction,
          lastStatus: message.status,
          lastInteraction: new Date(),
          updatedAt: new Date(),
          unreadCount: message.direction === 'inbound' ? 1 : 0,
          messageCount: 1,
          hasReplied: message.direction === 'inbound'
        });
      }

      return updated.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    });
  };

  // =========================
  // SELECT SESSION
  // =========================
  const selectSession = async (session) => {
    try {
      setSelectedSession(session);
      
      const res = await API.get(`/chat/sessions/${session.phone}`);
      
      setMessages(res.data.messages || []);
      setContactInfo(res.data.contact || null);
      
      // Mark as read
      if (session.unreadCount > 0) {
        setSessions(prev =>
          prev.map(s =>
            s.phone === session.phone
              ? { ...s, unreadCount: 0 }
              : s
          )
        );
      }
      
      scrollToBottom();
    } catch (err) {
      console.error("Load session error:", err);
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!selectedSession || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const formData = new FormData();
      formData.append("message", messageText);

      await API.post(
        `/chat/sessions/${selectedSession.phone}/messages`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

    } catch (err) {
      console.error("Send message error:", err);
      setNewMessage(messageText);
    }
  };

  const sendMedia = async (file) => {
    if (!selectedSession || !file) return;

    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("message", "");

      await API.post(
        `/chat/sessions/${selectedSession.phone}/messages`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (err) {
      console.error("Send media error:", err);
    }
  };

  // =========================
  // SESSION ACTIONS
  // =========================
  const archiveSession = async (phone) => {
    try {
      await API.patch(`/chat/sessions/${phone}`, {
        isArchived: true
      });
      loadSessions();
    } catch (err) {
      console.error("Archive session error:", err);
    }
  };

  const deleteSession = async (phone) => {
    if (!window.confirm("Are you sure you want to delete this chat session?")) {
      return;
    }

    try {
      await API.delete(`/chat/sessions/${phone}`);
      if (selectedSession?.phone === phone) {
        setSelectedSession(null);
        setMessages([]);
      }
      loadSessions();
    } catch (err) {
      console.error("Delete session error:", err);
    }
  };

  // =========================
  // UTILITY FUNCTIONS
  // =========================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) sendMedia(file);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadSessions();
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 p-6 pt-24 flex gap-6 overflow-hidden">
          {/* Left Sidebar - Sessions List */}
          <div className="w-96 flex flex-col gap-4">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare size={20} /> Chat Dashboard
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`p-2 rounded ${showArchived ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                    title={showArchived ? "Show Active" : "Show Archived"}
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    onClick={loadSessions}
                    className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                    title="Refresh"
                  >
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Total Chats</div>
                  <div className="text-2xl font-bold">{stats.totalSessions || 0}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Unread</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.totalUnread || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Replied</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.repliedCount || 0}
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Messages</div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.totalMessages || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow p-4">
              <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by phone number..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </form>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { key: 'all', label: 'All', icon: Users },
                  { key: 'unread', label: 'Unread', icon: MessageCircle },
                  { key: 'replied', label: 'Replied', icon: CheckCircle },
                  { key: 'not_replied', label: 'Pending', icon: XCircle }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setFilter(item.key);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                      filter === item.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Chat Sessions</h3>
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-350px)]">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {search ? 'No sessions found for your search' : 'No chat sessions yet'}
                  </div>
                ) : (
                  <>
                    {sessions.map((session) => (
                      <div
                        key={session.phone}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                          selectedSession?.phone === session.phone
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : ''
                        } ${session.isArchived ? 'opacity-60' : ''}`}
                        onClick={() => selectSession(session)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              <span className="font-medium">{session.phone}</span>
                              {session.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  {session.unreadCount}
                                </span>
                              )}
                              {session.isArchived && (
                                <span className="text-xs text-gray-500">(Archived)</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {session.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {formatTime(session.updatedAt)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {session.lastDirection === 'inbound' ? '📥' : '📤'}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              session.hasReplied
                                ? 'bg-green-100 text-green-600'
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {session.hasReplied ? 'Replied' : 'No Reply'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(session.lastInteraction)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {session.isArchived ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Unarchive function
                                }}
                                className="p-1 text-gray-500 hover:text-blue-600"
                                title="Unarchive"
                              >
                                <Eye size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveSession(session.phone);
                                }}
                                className="p-1 text-gray-500 hover:text-yellow-600"
                                title="Archive"
                              >
                                <EyeOff size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.phone);
                              }}
                              className="p-1 text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    <div className="p-4 border-t flex justify-between items-center">
                      <button
                        onClick={() => setPagination(prev => ({ 
                          ...prev, 
                          page: Math.max(1, prev.page - 1) 
                        }))}
                        disabled={pagination.page <= 1}
                        className={`px-3 py-1 rounded flex items-center gap-1 ${
                          pagination.page <= 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      
                      <span className="text-sm text-gray-600">
                        {pagination.total} total sessions
                      </span>
                      
                      <button
                        onClick={() => setPagination(prev => ({ 
                          ...prev, 
                          page: Math.min(pagination.pages, prev.page + 1) 
                        }))}
                        disabled={pagination.page >= pagination.pages}
                        className={`px-3 py-1 rounded flex items-center gap-1 ${
                          pagination.page >= pagination.pages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow overflow-hidden">
            {!selectedSession ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <MessageSquare size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  Select a chat session
                </h3>
                <p className="text-gray-400 text-center">
                  Choose a chat from the left panel to start messaging
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedSession.phone}</h3>
                      {contactInfo ? (
                        <p className="text-sm text-gray-500">
                          {contactInfo.name || 'Unknown Contact'} • 
                          Messages: {selectedSession.messageCount} • 
                          Last: {formatTime(selectedSession.lastInteraction)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Messages: {selectedSession.messageCount} • 
                          Last: {formatTime(selectedSession.lastInteraction)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => archiveSession(selectedSession.phone)}
                      className="px-3 py-1.5 border rounded-lg hover:bg-yellow-50 text-yellow-600"
                    >
                      {selectedSession.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSession(null);
                        setMessages([]);
                      }}
                      className="px-3 py-1.5 border rounded-lg hover:bg-gray-100"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOutbound = msg.direction === "outbound";
                      const showDate = index === 0 || 
                        new Date(msg.timestamp).toDateString() !== 
                        new Date(messages[index-1]?.timestamp).toDateString();

                      return (
                        <React.Fragment key={msg._id || index}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {formatDate(msg.timestamp)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex mb-3 ${
                              isOutbound ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl p-3 ${
                                isOutbound
                                  ? "bg-blue-500 text-white rounded-br-none"
                                  : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                              }`}
                            >
                              {msg.type !== 'text' && (
                                <div className="text-xs mb-1 opacity-75">
                                  [{msg.type.toUpperCase()}]
                                </div>
                              )}
                              <div className="whitespace-pre-wrap break-words">
                                {msg.message || `[${msg.type}]`}
                              </div>
                              <div className={`text-xs mt-1 flex justify-end items-center gap-2 ${
                                isOutbound ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(msg.timestamp)}
                                {isOutbound && (
                                  <span className="text-xs">
                                    {msg.status === 'delivered' ? '✓✓' : 
                                     msg.status === 'read' ? '✓✓✓' :
                                     msg.status === 'sent' ? '✓' : msg.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,application/pdf,text/*"
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      title="Attach file"
                    >
                      📎
                    </button>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                      rows="2"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                        newMessage.trim()
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={20} /> Send
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Press Enter to send • Shift+Enter for new line
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}