import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { ArrowLeft, Send, Phone, MoreVertical, Smile } from 'lucide-react'
import ChatBubble from '../../components/ChatBubble'

export default function HostChat() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'
  const messagesEndRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [chat, setChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!chatId) return

    // Get chat metadata
    getDoc(doc(db, 'chats', chatId)).then(snap => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() })
    })

    // Listen to messages
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMessages(data)
      setLoading(false)
      
      // Mark as read
      data.forEach(msg => {
        if (!msg.read && msg.senderId !== user.uid) {
          updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), { read: true })
        }
      })
    })

    return () => unsub()
  }, [chatId, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || 'Host',
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      })

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage.trim(),
        updatedAt: serverTimestamp()
      })

      setNewMessage('')
    } catch (err) {
      console.error('Send error:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className={`${isDark ? 'bg-[#0a0a14]' : 'bg-gray-50'} min-h-screen flex flex-col`} style={{ height: '100dvh' }}>
      {/* Chat Header */}
      <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} px-4 py-3 flex items-center gap-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <button onClick={() => navigate('/host/messages')} className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          <ArrowLeft size={24} />
        </button>

        <div className="w-10 h-10 rounded-full bg-[#f5a623] flex items-center justify-center text-white font-bold">
          {chat?.guestName?.[0] || 'G'}
        </div>

        <div className="flex-1">
          <h2 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            {chat?.guestName || 'Guest'}
          </h2>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {chat?.propertyName}
          </p>
        </div>

        <button className={`p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Phone size={20} />
        </button>
        <button className={`p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto px-4 py-2`} style={{ 
        background: isDark 
          ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAA5SURBVGje7dNBDQAACMAwlP5f2cEMbCZZkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkr8DAAD//wMAqT8M2YRmKQAAAABJRU5ErkJggg==")'
          : 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAA5SURBVGje7dNBDQAACMAwlP5f2cEMbCZZkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpkr8DAAD//wMAqT8M2YRmKQAAAABJRU5ErkJggg==")'
      }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className={`text-4xl mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                💬
              </div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No messages yet. Say hello!</p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === user.uid}
              senderName={msg.senderName}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} p-3 flex items-center gap-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <button className={`p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Smile size={22} />
        </button>
        
        <div className={`flex-1 flex items-center rounded-full px-4 ${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-100'}`}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={`flex-1 py-3 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'}`}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center disabled:opacity-50 transition-opacity"
        >
          <Send size={18} color="white" />
        </button>
      </div>
    </div>
  )
}