// src/pages/LiveChat.jsx
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../utils/api";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function LiveChat() {
  const [contacts, setContacts] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const socketRef = useRef(null);
  const messagesRef = useRef(null);
  const selectedPhoneRef = useRef(null);

  // Keep selectedPhone ref updated for socket events
  useEffect(() => {
    selectedPhoneRef.current = selectedPhone;
  }, [selectedPhone]);

  const getChatWith = (log) =>
    log.direction === "inbound" ? log.from : log.to;

  // =========================
  // SOCKET.IO CONNECTION
  // =========================
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
      const tenantId = localStorage.getItem("tenantId") || "default";
      socketRef.current.emit("joinTenant", tenantId);
    });

    socketRef.current.on("message:new", (log) => handleIncomingMessage(log));

    return () => socketRef.current?.disconnect();
  }, []);

  // =========================
  // HANDLE INCOMING MESSAGE
  // =========================
  function handleIncomingMessage(log) {
    const chatWith = getChatWith(log);

    // Update contacts
    setContacts((prev) => {
      const exists = prev.find((c) => c.phone === chatWith);
      let updated;
      if (exists) {
        updated = prev.map((c) =>
          c.phone === chatWith
            ? {
                ...c,
                lastMessage: log.message || "[media]",
                lastTimestamp: log.timestamp,
                lastStatus: log.status || c.lastStatus,
              }
            : c
        );
      } else {
        updated = [
          {
            phone: chatWith,
            lastMessage: log.message || "[media]",
            lastTimestamp: log.timestamp,
            lastStatus: log.status || "received",
          },
          ...prev,
        ];
      }

      return updated.sort(
        (a, b) =>
          new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
      );
    });

    // Update messages if current chat is open
    if (selectedPhoneRef.current === chatWith) {
      setMessages((prev) => {
        const exists = prev.find(
          (m) =>
            m._id === log._id ||
            (m.provider_message_id && m.provider_message_id === log.provider_message_id)
        );
        if (exists) return prev;

        return [...prev, log].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    }
  }

  // =========================
  // LOAD CONTACTS
  // =========================
  async function loadContacts() {
    try {
      const res = await API.get("/chat/contacts");
      setContacts(res.data || []);
    } catch (err) {
      console.error("Load contacts error:", err);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  // =========================
  // OPEN CHAT
  // =========================
  async function openChat(phone) {
    setSelectedPhone(phone);
    setMessages([]);

    try {
      const res = await API.get(`/chat/${encodeURIComponent(phone)}/messages`);
      const sortedMessages = (res.data || []).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setMessages(sortedMessages);

      // Ensure phone is in contacts
      setContacts((prev) => {
        if (!prev.find((c) => c.phone === phone)) {
          return [{ phone, lastMessage: "", lastTimestamp: new Date() }, ...prev];
        }
        return prev;
      });
    } catch (err) {
      console.error("Load messages error:", err);
    }
  }

  // =========================
  // SEND REPLY
  // =========================
  async function sendReply() {
    if (!selectedPhone || !reply.trim()) return;

    const text = reply.trim();
    setReply("");

    try {
      const res = await API.post(
        `/chat/${encodeURIComponent(selectedPhone)}/reply`,
        { message: text }
      );

      if (res.data?.log) handleIncomingMessage(res.data.log);
    } catch (err) {
      console.error("Send reply error:", err);
      setReply(text);
    }
  }

  // =========================
  // START NEW CHAT / SEARCH
  // =========================
  function startNewChat() {
    if (!searchPhone.trim()) return;
    openChat(searchPhone.trim());
    setSearchPhone("");
  }

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 p-6 pt-24 flex gap-6 overflow-hidden">
          {/* Contacts */}
          <div className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
            <div className="mb-3">
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Search / new number"
                className="w-full border p-2 rounded mb-2"
              />
              <button
                onClick={startNewChat}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Start Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.phone}
                  onClick={() => openChat(c.phone)}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition ${
                    selectedPhone === c.phone ? "bg-blue-100 border border-blue-300" : ""
                  }`}
                >
                  <div className="font-semibold">{c.phone}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {c.lastMessage || "No messages yet"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col p-4">
            {!selectedPhone ? (
              <div className="flex items-center justify-center flex-1 text-gray-500 text-xl">
                Select a contact to start chatting
              </div>
            ) : (
              <>
                <div className="border-b pb-3 mb-3 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">{selectedPhone}</div>
                    <div className="text-sm text-gray-500">Live Chat</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPhone(null);
                      setMessages([]);
                    }}
                    className="px-3 py-1.5 border rounded-lg hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>

                <div
                  ref={messagesRef}
                  className="flex-1 overflow-y-auto p-2 space-y-3"
                >
                  {messages.map((m, i) => {
                    const isOutbound = m.direction === "outbound";
                    return (
                      <div
                        key={m._id || i}
                        className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md p-3 rounded-xl shadow text-sm ${
                            isOutbound ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div>{m.message || "[No message]"}</div>
                          {isOutbound && (
                            <div className="text-xs text-white/70 mt-1 text-right">
                              {m.status || "sent"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-3">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendReply();
                    }}
                    className="flex-1 border p-3 rounded-lg"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={sendReply}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
