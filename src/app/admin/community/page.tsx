"use client";
import { useState } from "react";
import { Search, Shield, Ban, Eye, Users, BookOpen, Palette } from "lucide-react";

const TABS = ["\uc804\uccb4 \uc720\uc800", "\ucee4\ubba4\ub2c8\ud2f0 \ud65c\ub3d9"];

const MOCK_USERS = [
  { id: "u001", email: "user1@example.com", name: "\ucf54\ub2c8\ub2c8", books: 3, creations: 8, chats: 24, joined: "2024-11-01", lastSeen: "\ubc29\uae08 \uc804", status: "active" },
  { id: "u002", email: "user2@example.com", name: "\uc2dc\uc624\uc5f0", books: 7, creations: 23, chats: 87, joined: "2024-10-15", lastSeen: "1\uc2dc\uac04 \uc804", status: "active" },
  { id: "u003", email: "user3@example.com", name: "\ub808\uc774\ub098", books: 1, creations: 2, chats: 5, joined: "2025-01-20", lastSeen: "3\uc77c \uc804", status: "active" },
  { id: "u004", email: "user4@example.com", name: "\ubbf8\ub098", books: 5, creations: 15, chats: 42, joined: "2024-12-05", lastSeen: "2\uc8fc \uc804", status: "suspended" },
  { id: "u005", email: "user5@example.com", name: "\ud558\ub8e8", books: 2, creations: 4, chats: 11, joined: "2025-02-11", lastSeen: "\uc5b4\uc81c", status: "active" },
  { id: "u006", email: "user6@example.com", name: "\ub2ec\ube5b", books: 9, creations: 31, chats: 156, joined: "2024-09-01", lastSeen: "\ubc29\uae08 \uc804", status: "active" },
];

const MOCK_CHATS = [
  { user: "\ub2ec\ube5b", book: "\uc560\uc778\uc758 \uc560\uc778\uc5d0\uac8c", message: "\uc218\uc5f0\uc758 \uac10\uc815 \ubcc0\ud654\uac00 \ub108\ubb34 \ud604\uc2e4\uc801\uc774\uc5d0\uc694.", time: "2\ubd84 \uc804" },
  { user: "\uc2dc\uc624\uc5f0", book: "\ubb34\uc5c7\uc774 \ub098\ub97c \uc6c0\uc9c1\uc774\uac8c \ud558\ub294\uac00", message: "\uc54c\ub9ac\uc758 \uc9c8\ubb38\uc774 \uacc4\uc18d \uba38\ub9bf\uc18d\uc5d0 \ub9f4\ub3cc\uc544\uc694.", time: "15\ubd84 \uc804" },
  { user: "\ucf54\ub2c8\ub2c8", book: "\ud1b5\uc99d \uc544\ud50c \ub54c \uaebc\ub0b4 \ubcf4\ub294 \ubc31\uacfc", message: "\uacbd\ub77d\ub3c4 \ucc55\ud130\uac00 \ud2b9\ud788 \uc720\uc775\ud588\uc2b5\ub2c8\ub2e4!", time: "32\ubd84 \uc804" },
  { user: "\ud558\ub8e8", book: "\ub098\ub97c \ubaa8\ub974\ub294 \ub098\uc5d0\uac8c", message: "\uac10\uc815 \ud68c\ub85c \ubd80\ubd84\uc5d0\uc11c \ub9ce\uc774 \uacf5\uac10\ud588\uc5b4\uc694.", time: "1\uc2dc\uac04 \uc804" },
];

export default function AdminCommunityPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const filtered = MOCK_USERS.filter(u => u.name.includes(search) || u.email.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">\ucee4\ubba4\ub2c8\ud2f0 & \uc720\uc800 \uad00\ub9ac</h1>
          <p className="text-sm text-mono-500 mt-1">\uc804\uccb4 \uba64\ubc84 {MOCK_USERS.length}\uba85</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-primary-050 text-primary-600 px-3 py-1.5 rounded-full font-medium">\ud65c\uc131 {MOCK_USERS.filter(u => u.status === "active").length}</span>
          <span className="text-xs bg-red-050 text-red-300 px-3 py-1.5 rounded-full font-medium">\uc815\uc9c0 {MOCK_USERS.filter(u => u.status === "suspended").length}</span>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-mono-050 p-1 rounded-lg w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === i ? "bg-white text-mono-900 shadow-sm" : "text-mono-500 hover:text-mono-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="bg-white rounded-xl border border-mono-080 overflow-hidden">
          <div className="p-4 border-b border-mono-050">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="\uc774\ub984, \uc774\uba54\uc77c \uac80\uc0c9..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-mono-080 rounded-lg focus:outline-none focus:border-primary-400" />
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-mono-050">
              <tr>
                {["\uc0ac\uc6a9\uc790", "\uc774\uba54\uc77c", "\ub3c4\uc11c", "\ucc3d\uc791", "\ucc44\ud305", "\uac00\uc785\uc77c", "\ucd5c\uadfc\uc811\uc18d", "\uc0c1\ud0dc", "\uad00\ub9ac"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-mono-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-mono-050 hover:bg-mono-010">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-050 flex items-center justify-center text-xs font-medium text-primary-600">{user.name[0]}</div>
                      <span className="text-sm font-medium text-mono-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-mono-500">{user.email}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-mono-600"><BookOpen className="w-3.5 h-3.5 text-mono-400" />{user.books}</div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-mono-600"><Palette className="w-3.5 h-3.5 text-mono-400" />{user.creations}</div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-mono-600"><Users className="w-3.5 h-3.5 text-mono-400" />{user.chats}</div></td>
                  <td className="px-4 py-3 text-sm text-mono-500">{user.joined}</td>
                  <td className="px-4 py-3 text-xs text-mono-400">{user.lastSeen}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === "active" ? "bg-primary-050 text-primary-600" : "bg-red-050 text-red-300"}`}>
                      {user.status === "active" ? "\ud65c\uc131" : "\uc815\uc9c0"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-blue-300"><Eye className="w-4 h-4" /></button>
                      <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-primary-500"><Shield className="w-4 h-4" /></button>
                      <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-red-300"><Ban className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 1 && (
        <div className="bg-white rounded-xl border border-mono-080 overflow-hidden">
          <div className="px-5 py-3 border-b border-mono-050">
            <p className="text-sm text-mono-500">\ucd5c\uadfc \ucee4\ubba4\ub2c8\ud2f0 \ucc44\ud305 \ud65c\ub3d9</p>
          </div>
          <div className="divide-y divide-mono-050">
            {MOCK_CHATS.map((c, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-mono-010">
                <div className="w-7 h-7 rounded-full bg-primary-050 flex items-center justify-center text-xs font-medium text-primary-600 shrink-0">{c.user[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-mono-900">{c.user}</span>
                    <span className="text-xs text-mono-400">·</span>
                    <span className="text-xs text-primary-500">{c.book}</span>
                  </div>
                  <p className="text-sm text-mono-600 truncate">{c.message}</p>
                </div>
                <span className="text-xs text-mono-400 shrink-0">{c.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
