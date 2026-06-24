import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Search, MessageCircle, ArrowLeft } from 'lucide-react'

export default function HostMessages() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'chats'),
      where('hostId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChats(data)
      setLoading(false)
    }, (err) => {
      console.error('Chats error:', err)
      setLoading(false)
    })

    return () => unsub()
  }, [user])

  const filteredChats = chats.filter(chat => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      chat.guestName?.toLowerCase().includes(term) ||
      chat.propertyName?.toLowerCase().includes(term) ||
      chat.lastMessage?.toLowerCase().includes(term)
    )
  })

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate?.() || new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
    return date.toLocaleDateString()
  }

  return (
    <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-4 sticky top-0 z-10 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4 mb-3">
          <button onClick={() => navigate('/host/dashboard')} className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Messages</h1>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-100'}`}>
          <Search size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`bg-transparent outline-none flex-1 text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'}`}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="divide-y" style={{ borderColor: isDark ? '#1f1f2e' : '#f0f0f0' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              {search ? 'No chats found' : 'No messages yet'}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {search ? 'Try a different search' : 'Messages from guests will appear here'}
            </p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => navigate(`/host/messages/${chat.id}`)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-opacity-50 transition-colors ${isDark ? 'hover:bg-[#1a1a2e]' : 'hover:bg-gray-50'}`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#f5a623] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {chat.guestName?.[0] || 'G'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-black'}`}>
                    {chat.guestName || 'Guest'}
                  </h3>
                  <span className={`text-xs flex-shrink-0 ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatTime(chat.updatedAt)}
                  </span>
                </div>
                <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {chat.lastMessage || 'No messages yet'}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {chat.propertyName}
                </p>
              </div>

              {/* Unread badge */}
              {chat.unreadCount > 0 && (
                <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}