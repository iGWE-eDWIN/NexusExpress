import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import SocketService from '../services/socket';
import { useShipment } from '../context/hooks/useShipment';
import { useAuth } from '../context/hooks/useAuth';

// Chat component for customer support and admin interactions
// Handles message sending, emoji selection, and chat history retrieval
const Chat = ({
  isOpen,
  onClose,
  isAdmin = false,
  adminId = null,
  adminName = null,
  messages = [],
}) => {
  const [chatMessages, setChatMessages] = useState(messages);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const { sendChatMessage } = useShipment();
  const { user } = useAuth();
  // Use props for admin detection, fallback to context if not provided
  const isAdminUser = isAdmin || user?.role === 'admin';
  const effectiveAdminName =
    adminName || (isAdminUser ? user?.username || user?.name || 'Admin' : null);
  const effectiveAdminId = adminId || (isAdminUser ? user?.id : null);
  const isGeneral = !isAdminUser;
  const room = isAdminUser ? 'admin-room' : `general-${username}`;

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (isGeneral && !username) {
      setShowUsernameModal(true);
      return;
    }

    // Use adminName prop if admin, else username
    // const sender = isAdminUser ? effectiveAdminName : username;

    const msgData = {
      sender: isAdminUser ? effectiveAdminName : username,
      content: trimmed,
      timestamp: new Date().toISOString(),
      room,
      isGeneral,
      isAdmin: isAdminUser,
      adminId: effectiveAdminId,
      adminName: effectiveAdminName,
      ...(isGeneral && { username }),
    };

    try {
      const identifier = isGeneral ? username : adminId;
      await sendChatMessage(msgData, identifier, isGeneral);
      setChatMessages((prev) => [...prev, msgData]);
      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  const handleEmojiSelect = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || (isGeneral && !username)) return;

    SocketService.connect();
    SocketService.emit('join-room', room);

    const handleIncoming = (newMsg) => {
      setChatMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    };

    const handleHistory = (history) => {
      if (Array.isArray(history)) {
        setChatMessages(history);
        scrollToBottom();
      }
    };

    SocketService.onNewMessage(handleIncoming);
    if (!isAdminUser) {
      SocketService.on('chat-history', handleHistory);
    }

    return () => {
      SocketService.emit('leave-room', room);
      SocketService.offNewMessage();
      if (!isAdminUser) SocketService.off('chat-history');
    };
  }, [isOpen, username, isGeneral, isAdminUser, room, scrollToBottom]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatContainerRef}
      className={`fixed bottom-4 right-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-xl  shadow-lg border flex flex-col z-50 ${
        isAdmin ? 'border-blue-500' : ''
      }`}
    >
      {/* Username Modal */}
      {showUsernameModal && (
        <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded-lg w-80'>
            <h3 className='font-semibold mb-2'>Enter your name to start</h3>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Your name'
              className='border p-2 w-full mb-2 rounded'
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                username.trim() &&
                setShowUsernameModal(false)
              }
            />
            <button
              onClick={() => {
                if (username.trim()) {
                  setShowUsernameModal(false);
                  SocketService.disconnect();
                  SocketService.connect();
                }
              }}
              className='bg-gray-500 text-white px-3 py-1 rounded w-full'
              disabled={!username.trim()}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='flex items-center justify-between p-3 border-b bg-white'>
        <span className='font-semibold'>
          {isAdmin ? 'Admin Support' : 'Customer Support Chat'}
        </span>
        <button
          onClick={onClose}
          className='p-1 hover:bg-gray-100 rounded-full'
        >
          <X size={20} className='text-gray-600' />
        </button>
      </div>

      {/* Chat Messages */}
      <div className='flex-1 overflow-y-auto p-3 space-y-2'>
        {chatMessages.map((msg, i) => (
          <div
            key={`${msg.timestamp}-${i}`}
            className={`flex flex-col ${
              msg.isAdmin
                ? 'items-end'
                : msg.sender.includes('User')
                ? 'items-start'
                : 'items-end'
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                msg.isAdmin
                  ? 'bg-green-100 text-gray-800 border-l-4 border-green-500'
                  : msg.sender.includes('User')
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-500 text-white'
              }`}
            >
              <span className='font-semibold'>{msg.sender}</span>: {msg.content}
              <div className='text-xs text-white text-right mt-1'>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className='absolute bottom-[60px] right-4 z-50'>
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            width={300}
            height={350}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
          />
        </div>
      )}

      {/* Input Area */}
      <div className='p-3 border-t flex items-center gap-2 bg-gray-50 rounded-b-xl'>
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className='p-1 hover:bg-gray-200 rounded-full'
        >
          <Smile size={20} className='text-gray-600' />
        </button>
        <textarea
          rows={1}
          placeholder='Type your message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className='flex-1 resize-none border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500'
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className={`${
            isAdmin
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-800 hover:bg-gray-700'
          } text-white px-3 py-1 rounded-md text-sm disabled:opacity-50`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
