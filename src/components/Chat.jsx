import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import SocketService from '../services/socket';
import { useShipment } from '../context/hooks/useShipment';
import { useAuth } from '../context/hooks/useAuth';

// Chat component for customer support and admin interactions
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

  const isAdminUser = isAdmin || user?.role === 'admin';
  const effectiveAdminName =
    adminName || (isAdminUser ? user?.username || user?.name || 'Admin' : null);
  const effectiveAdminId = adminId || (isAdminUser ? user?.id : null);
  const isGeneral = !isAdminUser;
  const room = isAdminUser ? 'admin-room' : `user-${username}`;

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
    if (!isOpen) return;

    SocketService.connect();

    // Setup based on user type
    if (isAdminUser) {
      SocketService.joinAdminRoom(effectiveAdminId);
    }
    // else if (username) {
    //   SocketService.joinGeneralRoom(username);
    // }

    const handleIncomingMessage = (newMsg) => {
      setChatMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    };

    const handleAdminMessage = (adminMsg) => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: adminMsg.sender,
          message: adminMsg.message,
          timestamp: adminMsg.timestamp,
          isAdmin: true,
          content: adminMsg.message,
        },
      ]);
      scrollToBottom();
    };

    // Listen for messages
    SocketService.onNewMessage(handleIncomingMessage);
    if (!isAdminUser) {
      SocketService.onAdminMessage(handleAdminMessage);
    }

    return () => {
      SocketService.offNewMessage(handleIncomingMessage);
      if (!isAdminUser) {
        SocketService.offAdminMessage(handleAdminMessage);
      }
    };
  }, [isOpen, username, isAdminUser, effectiveAdminId, scrollToBottom]);

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
      className={`fixed bottom-4 right-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-xl shadow-lg border flex flex-col z-50 ${
        isAdmin ? 'border-blue-500' : ''
      }`}
    >
      {/* Username Modal */}
      {showUsernameModal && !isAdminUser && (
        <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded-lg w-80'>
            <h3 className='font-semibold mb-2'>
              Enter your name to start chatting
            </h3>
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
                  SocketService.joinGeneralRoom(username);
                }
              }}
              className='bg-blue-500 text-white px-3 py-1 rounded w-full hover:bg-blue-600'
              disabled={!username.trim()}
            >
              Start Chat
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='flex items-center justify-between p-3 border-b bg-white'>
        <span className='font-semibold'>
          {isAdminUser ? 'Admin Support' : 'Customer Support Chat'}
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
              msg.isAdmin ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                msg.isAdmin
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className='font-semibold text-xs mb-1'>{msg.sender}</div>
              <div>{msg.content || msg.message}</div>
              <div
                className={`text-xs mt-1 ${
                  msg.isAdmin ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
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
          placeholder={
            isGeneral && !username
              ? 'Enter your name first...'
              : 'Type your message...'
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className='flex-1 resize-none border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100'
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className={`${
            isAdminUser
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-800 hover:bg-gray-700'
          } text-white px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
