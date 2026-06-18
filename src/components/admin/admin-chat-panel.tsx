"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageSquare, ChevronLeft } from "lucide-react";

type Session = {
  sessionId: string;
  brandSlug: string;
  senderName: string;
  lastMessage: string;
  lastSender: string;
  lastAt: string;
  unread: number;
};

type Message = {
  id: string;
  sender: string;
  senderName: string;
  message: string;
  createdAt: string;
};

const BRAND_LABEL: Record<string, string> = {
  "dapur-bwaji": "Dapur Bwaji",
  "hoki-dimsum": "Hoki Dimsum",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export function AdminChatPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/chat?all=1");
    if (res.ok) setSessions(await res.json());
  }, []);

  const fetchMessages = useCallback(async (session: Session) => {
    const res = await fetch(`/api/chat?phone=${encodeURIComponent(session.sessionId)}&brand=${session.brandSlug}`);
    if (res.ok) setMessages(await res.json());
  }, []);

  // Poll sessions
  useEffect(() => {
    fetchSessions();
    const t = setInterval(fetchSessions, 5000);
    return () => clearInterval(t);
  }, [fetchSessions]);

  // Poll active conversation
  useEffect(() => {
    if (!active) return;
    fetchMessages(active);
    // Mark as read
    fetch(`/api/chat?phone=${encodeURIComponent(active.sessionId)}&brand=${active.brandSlug}`, { method: "PATCH" });
    const t = setInterval(() => fetchMessages(active), 3000);
    return () => clearInterval(t);
  }, [active, fetchMessages]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !active || sending) return;
    setSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: active.sessionId,
          brand: active.brandSlug,
          sender: "admin",
          senderName: "Admin",
          message: input.trim(),
        }),
      });
      setInput("");
      await fetchMessages(active);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden min-h-0">
      {!active ? (
        // ── Session list ──────────────────────────────────────────────────
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-3">
                <MessageSquare size={24} className="text-gray-400" />
              </div>
              <p className="font-medium text-gray-500">Belum ada chat masuk</p>
              <p className="text-sm text-gray-400 mt-1">Pesan dari pelanggan akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sessions.map((s) => (
                <button
                  key={`${s.sessionId}__${s.brandSlug}`}
                  onClick={() => setActive(s)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                    {(s.senderName || s.sessionId).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {s.senderName || s.sessionId}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(s.lastAt)}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{BRAND_LABEL[s.brandSlug] ?? s.brandSlug}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {s.lastSender === "admin" ? "Anda: " : ""}{s.lastMessage}
                    </p>
                  </div>
                  {s.unread > 0 && (
                    <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {s.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ── Active conversation ───────────────────────────────────────────
        <div className="flex flex-1 flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
            <button onClick={() => setActive(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-xs">
              {(active.senderName || active.sessionId).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{active.senderName || active.sessionId}</p>
              <p className="text-xs text-gray-400">{active.sessionId} · {BRAND_LABEL[active.brandSlug] ?? active.brandSlug}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
            {messages.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-8">Belum ada pesan</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender === "admin"
                      ? "bg-orange-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="leading-snug">{m.message}</p>
                  <p className={`text-[10px] mt-0.5 ${m.sender === "admin" ? "text-orange-200" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ketik balasan..."
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white disabled:opacity-40 transition-opacity"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
