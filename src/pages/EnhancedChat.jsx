import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  MessageSquare, Users, Filter, Archive, Search, Send,
  Phone, Mail, Tag, Clock, CheckCircle, XCircle, MessageCircle,
  ArrowUp, Download, Trash2, Eye, EyeOff, MoreVertical, ChevronLeft,
  ChevronRight, Paperclip, Smile, Mic, Image, Video, File, 
  Star, UserPlus, Ban, Flag, ThumbsUp, ThumbsDown, Zap,
  Bell, Settings, ExternalLink, Copy, Share, Link, Hash,
  BarChart, Calendar, AlertCircle, Check, X, Edit,
  Maximize2, Minimize2, Volume2, VolumeX, RefreshCw,
  PhoneCall, VideoIcon, MapPin, FileText, Headphones,
  Bot, User, Shield, Globe, Lock, Unlock, Wifi, WifiOff
} from 'lucide-react';
import API from '../utils/api';
import { io } from 'socket.io-client';

const EnhancedChat = () => {
  // State variables
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    replied: 0,
    archived: 0
  });
  
  // Socket.IO
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // ===============================
  // INITIALIZATION
  // ===============================
  
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      
      const tenantId = localStorage.getItem('tenantId') || 'default';
      newSocket.emit('joinTenant', tenantId);
    });
    
    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });
    
    newSocket.on('message:new', (message) => {
      handleNewMessage(message);
    });
    
    newSocket.on('message:status_updated', (message) => {
      handleMessageStatusUpdate(message);
    });
    
    newSocket.on('session:updated', (session) => {
      handleSessionUpdate(session);
    });
    
    newSocket.on('session:deleted', (data) => {
      handleSessionDelete(data.phone);
    });
    
    loadSessions();
    loadStats();
    
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // ===============================
  // DATA LOADING FUNCTIONS
  // ===============================
  
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: 1,
        limit: 50,
        search: searchTerm,
        filter: filter,
        archived: filter === 'archived' ? 'true' : 'false'
      };
      
      const response = await API.get('/chat/sessions', { params });
      
      if (response.data.success) {
        setSessions(response.data.sessions || []);
        setStats(response.data.stats || stats);
      }
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
      alert('Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const response = await API.get('/whatsapp/chat/stats');
      if (response.data.success) {
        setStats({
          total: response.data.stats.totalSessions || 0,
          unread: response.data.stats.totalUnread || 0,
          replied: response.data.stats.repliedSessions || 0,
          archived: response.data.stats.archivedSessions || 0
        });
      }
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
    }
  };
  
  const loadSessionMessages = async (phone) => {
    try {
      const response = await API.get(`/chat/sessions/${phone}`);
      
      if (response.data.success) {
        setMessages(response.data.messages || []);
        
        if (response.data.session?.unreadCount > 0) {
          setSessions(prev => 
            prev.map(session => 
              session.phone === phone 
                ? { ...session, unreadCount: 0 }
                : session
            )
          );
        }
        
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      alert('Failed to load chat messages');
    }
  };
  
  // ===============================
  // SOCKET EVENT HANDLERS
  // ===============================
  
  const handleNewMessage = (message) => {
    const phone = message.direction === 'inbound' ? message.from : message.to;
    
    if (selectedSession?.phone === phone) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    }
    
    setSessions(prev => {
      const existingIndex = prev.findIndex(s => s.phone === phone);
      
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message.body || '[Media]',
          lastMessageType: message.type,
          lastDirection: message.direction,
          lastStatus: message.status,
          lastInteraction: new Date(),
          updatedAt: new Date(),
          unreadCount: message.direction === 'inbound' 
            ? (updated[existingIndex].unreadCount || 0) + 1 
            : 0,
          messageCount: (updated[existingIndex].messageCount || 0) + 1,
          hasReplied: message.direction === 'inbound' 
            ? true 
            : updated[existingIndex].hasReplied
        };
        
        const session = updated.splice(existingIndex, 1)[0];
        updated.unshift(session);
        
        return updated;
      } else {
        const newSession = {
          phone,
          lastMessage: message.body || '[Media]',
          lastMessageType: message.type,
          lastDirection: message.direction,
          lastStatus: message.status,
          lastInteraction: new Date(),
          updatedAt: new Date(),
          unreadCount: message.direction === 'inbound' ? 1 : 0,
          messageCount: 1,
          hasReplied: message.direction === 'inbound',
          isArchived: false
        };
        
        return [newSession, ...prev];
      }
    });
  };
  
  const handleMessageStatusUpdate = (message) => {
    setMessages(prev => 
      prev.map(msg => 
        msg._id === message._id ? message : msg
      )
    );
    
    const phone = message.direction === 'outbound' ? message.to : message.from;
    setSessions(prev => 
      prev.map(session => 
        session.phone === phone 
          ? { ...session, lastStatus: message.status }
          : session
      )
    );
  };
  
  const handleSessionUpdate = (session) => {
    setSessions(prev => 
      prev.map(s => 
        s.phone === session.phone ? { ...s, ...session } : s
      )
    );
    
    if (selectedSession?.phone === session.phone) {
      setSelectedSession(prev => ({ ...prev, ...session }));
    }
  };
  
  const handleSessionDelete = (phone) => {
    setSessions(prev => prev.filter(s => s.phone !== phone));
    
    if (selectedSession?.phone === phone) {
      setSelectedSession(null);
      setMessages([]);
    }
  };
  
  // ===============================
  // MESSAGE FUNCTIONS
  // ===============================
  
  const sendMessage = async () => {
    if (!selectedSession || !newMessage.trim()) return;
    
    const messageText = newMessage.trim();
    const phone = selectedSession.phone;
    
    try {
      const formData = new FormData();
      formData.append('message', messageText);
      formData.append('type', 'text');
      
      await API.post(`/chat/sessions/${phone}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setNewMessage('');
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      alert('Failed to send message');
    }
  };
  
  const sendMedia = async (file) => {
    if (!selectedSession || !file) return;
    
    try {
      alert('Media upload requires cloud storage setup');
    } catch (error) {
      console.error('❌ Failed to send media:', error);
      alert('Failed to send media');
    }
  };
  
  // ===============================
  // SESSION FUNCTIONS
  // ===============================
  
  const selectSession = async (session) => {
    setSelectedSession(session);
    await loadSessionMessages(session.phone);
  };
  
  const archiveSession = async (phone) => {
    try {
      await API.patch(`/chat/sessions/${phone}`, {
        isArchived: true
      });
      
      loadSessions();
      alert('Session archived');
    } catch (error) {
      console.error('❌ Failed to archive session:', error);
      alert('Failed to archive session');
    }
  };
  
  const unarchiveSession = async (phone) => {
    try {
      await API.patch(`/chat/sessions/${phone}`, {
        isArchived: false
      });
      
      loadSessions();
      alert('Session unarchived');
    } catch (error) {
      console.error('❌ Failed to unarchive session:', error);
      alert('Failed to unarchive session');
    }
  };
  
  const deleteSession = async (phone) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }
    
    try {
      await API.delete(`/chat/sessions/${phone}`);
      loadSessions();
      
      if (selectedSession?.phone === phone) {
        setSelectedSession(null);
        setMessages([]);
      }
      
      alert('Session deleted');
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      alert('Failed to delete session');
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await API.post('/chat/sessions/mark-all-read');
      loadSessions();
      alert('All sessions marked as read');
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      alert('Failed to mark all as read');
    }
  };
  
  // ===============================
  // UTILITY FUNCTIONS
  // ===============================
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const getMessageIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={16} />;
      case 'video': return <Video size={16} />;
      case 'audio': return <Headphones size={16} />;
      case 'document': return <FileText size={16} />;
      case 'location': return <MapPin size={16} />;
      case 'contacts': return <User size={16} />;
      case 'template': return <File size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };
  
  // ===============================
  // RENDER FUNCTIONS
  // ===============================
  
  const renderSessionItem = (session) => (
    <div
      key={session.phone}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        selectedSession?.phone === session.phone
          ? 'bg-blue-50 border-l-4 border-l-blue-500'
          : ''
      } ${session.isArchived ? 'opacity-70' : ''}`}
      onClick={() => selectSession(session)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Phone size={14} className="text-gray-500" />
            <span className="font-medium truncate">{session.phone}</span>
            {session.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {session.unreadCount}
              </span>
            )}
            {session.isArchived && (
              <span className="text-xs text-gray-500">(Archived)</span>
            )}
          </div>
          
          {session.contactId?.name && (
            <div className="text-sm text-gray-600 mb-1">
              {session.contactId.name}
            </div>
          )}
          
          <div className="text-sm text-gray-500 truncate">
            {session.lastMessage || 'No messages yet'}
          </div>
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
          
          {session.tags?.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-1">
          {session.isArchived ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                unarchiveSession(session.phone);
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
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
              className="p-1 text-gray-500 hover:text-yellow-600 rounded hover:bg-gray-100"
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
            className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderMessage = (message, index) => {
    const isOutbound = message.direction === 'outbound';
    const isMedia = ['image', 'video', 'document', 'audio'].includes(message.type);
    
    return (
      <div
        key={message._id || index}
        className={`flex mb-4 ${isOutbound ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-2xl p-3 ${
            isOutbound
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none shadow'
          }`}
        >
          {/* Message header */}
          <div className="flex items-center gap-2 mb-1">
            {getMessageIcon(message.type)}
            <span className="text-xs opacity-75">
              {isOutbound ? 'You' : message.from}
            </span>
            <span className="text-xs opacity-75">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">
            {isMedia ? (
              <div className="flex items-center gap-2">
                {getMessageIcon(message.type)}
                <span>{message.body || `[${message.type}]`}</span>
              </div>
            ) : (
              message.body || `[${message.type}]`
            )}
          </div>
          
          {/* Message footer */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs opacity-75">
              {formatTime(message.timestamp)}
            </div>
            {isOutbound && (
              <div className="text-xs">
                {message.status === 'delivered' ? '✓✓' : 
                 message.status === 'read' ? '✓✓✓' : 
                 message.status === 'sent' ? '✓' : 
                 message.status === 'failed' ? '✗' : message.status}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-0">
          <div className="h-[calc(100vh-5rem)]">
            <div className="flex h-full rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
              {/* Left Sidebar - Sessions List */}
              <div className="w-96 border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      <MessageSquare size={24} className="text-blue-600" />
                      WhatsApp Chat
                    </h1>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={loadSessions}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh"
                      >
                        <RefreshCw size={18} className="text-gray-600" />
                      </button>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadSessions()}
                      placeholder="Search by phone..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'unread', 'replied', 'archived'].map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-3 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap transition-colors ${
                          filter === filterType
                            ? 'bg-blue-100 text-blue-600 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {filterType}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <div className="text-sm text-gray-500">Unread</div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.unread}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <div className="text-sm text-gray-500">Replied</div>
                      <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <div className="text-sm text-gray-500">Archived</div>
                      <div className="text-2xl font-bold text-red-600">{stats.archived}</div>
                    </div>
                  </div>
                  
                  {stats.unread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>
                
                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading chats...</p>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-gray-400">
                        {searchTerm ? 'No chats found' : 'No chat sessions yet'}
                      </p>
                    </div>
                  ) : (
                    sessions.map(renderSessionItem)
                  )}
                </div>
              </div>
              
              {/* Right Side - Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedSession ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-gray-800">{selectedSession.phone}</h2>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{selectedSession.messageCount || 0} messages</span>
                            <span>•</span>
                            <span className={selectedSession.hasReplied ? 'text-green-600' : 'text-yellow-600'}>
                              {selectedSession.hasReplied ? 'Replied' : 'No reply'}
                            </span>
                            <span>•</span>
                            <span>Last: {formatTime(selectedSession.lastInteraction)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectedSession.isArchived ? unarchiveSession(selectedSession.phone) : archiveSession(selectedSession.phone)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          {selectedSession.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSession(null);
                            setMessages([]);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                          <MessageSquare size={64} className="mb-4 opacity-20" />
                          <p className="text-lg font-medium text-gray-400">No messages yet</p>
                          <p className="text-sm text-gray-400">Start the conversation!</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {messages.map(renderMessage)}
                          </div>
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex items-end gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Attach file"
                        >
                          <Paperclip size={20} className="text-gray-600" />
                        </button>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) sendMedia(file);
                            e.target.value = '';
                          }}
                          accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt"
                        />
                        
                        <div className="flex-1">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                            rows="2"
                          />
                          <div className="text-xs text-gray-500 mt-2">
                            Press Enter to send • Shift+Enter for new line
                          </div>
                        </div>
                        
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                            newMessage.trim()
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Send size={20} /> Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <MessageSquare size={96} className="text-gray-300 mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-500 mb-2">
                      Welcome to WhatsApp Chat
                    </h2>
                    <p className="text-gray-400 max-w-md text-center mb-8">
                      Select a chat from the left panel to start messaging, 
                      or wait for incoming messages from your contacts.
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600 font-medium">
                        {isConnected ? 'Connected to server' : 'Disconnected from server'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedChat;