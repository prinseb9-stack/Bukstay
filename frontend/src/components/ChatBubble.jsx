export default function ChatBubble({ message, isMine, senderName }) {
  const time = message.timestamp?.toDate?.() || new Date(message.timestamp)
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
      {!isMine && <span className="chat-sender-name">{senderName}</span>}
      <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
        <p className="chat-text">{message.text}</p>
        <span className="chat-time">
          {formattedTime}
          {isMine && (
            <span className="chat-read">
              {message.read ? ' ✓✓' : ' ✓'}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}