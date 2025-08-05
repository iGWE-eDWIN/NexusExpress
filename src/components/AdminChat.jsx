import { useState, useEffect, useRef } from 'react';
import { X, Send, User, Clock } from 'lucide-react';
import SocketService from '../services/socket';

const AdminChat = ({
  isOpen,
  onClose,
  activeChats = [],
  adminId,
  adminName,
}) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;

    // Join admin room
    SocketService.joinAdminRoom(adminId);

    // Listen for new user messages
    const handleUserMessage = (message) => {
      const { username, sender, message: content, timestamp } = message;

      setMessages((prev) => ({
        ...prev,
        [username]: [
          ...(prev[username] || []),
          {
            sender,
            message: content,
            timestamp,
            isAdmin: false,
            id: Date.now(),
          },
        ],
      }));

      // Auto-select chat if it's the first message from this user
      if (!selectedChat) {
        setSelectedChat(username);
      }
    };

    // Listen for new chat notifications
    const handleNewChat = ({ username, userId, timestamp }) => {
      setOnlineUsers((prev) => new Set([...prev, username]));
    };

    // Listen for user disconnections
    const handleUserDisconnected = ({ username }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(username);
        return updated;
      });
    };

    SocketService.onUserMessage(handleUserMessage);
    SocketService.onNewChatNotification(handleNewChat);
    SocketService.on('user-disconnected', handleUserDisconnected);

    return () => {
      SocketService.offUserMessage(handleUserMessage);
      SocketService.offNewChatNotification(handleNewChat);
      SocketService.off('user-disconnected', handleUserDisconnected);
    };
  }, [isOpen, adminId, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      username: selectedChat,
      content: newMessage,
      adminName: adminName || 'Admin',
      adminId,
    };

    SocketService.sendAdminReply(messageData);

    // Add to local messages
    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [
        ...(prev[selectedChat] || []),
        {
          sender: adminName || 'Admin',
          message: newMessage,
          timestamp: new Date().toISOString(),
          isAdmin: true,
          id: Date.now(),
        },
      ],
    }));

    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-6xl h-5/6 flex'>
        {/* Chat List Sidebar */}
        <div className='w-1/3 border-r bg-gray-50'>
          <div className='flex items-center justify-between p-4 border-b'>
            <h2 className='text-lg font-semibold'>Active Chats</h2>
            <button
              onClick={onClose}
              className='p-1 hover:bg-gray-200 rounded-full'
            >
              <X size={20} />
            </button>
          </div>

          <div className='overflow-y-auto h-full'>
            {/* Online Users */}
            {Array.from(onlineUsers).map((username) => (
              <div
                key={username}
                onClick={() => setSelectedChat(username)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                  selectedChat === username
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : ''
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div className='flex-1'>
                    <div className='font-medium'>{username}</div>
                    <div className='text-sm text-gray-600'>Online</div>
                    {messages[username] && messages[username].length > 0 && (
                      <div className='text-xs text-gray-500 mt-1'>
                        {messages[username][
                          messages[username].length - 1
                        ].message.slice(0, 30)}
                        ...
                      </div>
                    )}
                  </div>
                  {messages[username] && (
                    <div className='text-xs text-gray-400'>
                      {messages[username].length}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Previous Chats from activeChats prop */}
            {activeChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.name)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                  selectedChat === chat.name
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : ''
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <User size={16} className='text-gray-400' />
                  <div className='flex-1'>
                    <div className='font-medium'>{chat.name}</div>
                    <div className='text-sm text-gray-600'>
                      {chat.lastMessage || 'No messages'}
                    </div>
                  </div>
                  {chat.timestamp && (
                    <div className='text-xs text-gray-400'>
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {onlineUsers.size === 0 && activeChats.length === 0 && (
              <div className='p-8 text-center text-gray-500'>
                <User size={48} className='mx-auto mb-4 text-gray-300' />
                <p>No active chats</p>
                <p className='text-sm'>
                  Users will appear here when they start chatting
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className='flex-1 flex flex-col'>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className='p-4 border-b bg-white'>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <div>
                    <h3 className='font-semibold'>{selectedChat}</h3>
                    <p className='text-sm text-gray-600'>Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                {(messages[selectedChat] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isAdmin ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isAdmin
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className='text-sm font-medium mb-1'>
                        {msg.sender}
                      </div>
                      <div>{msg.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.isAdmin ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className='p-4 border-t bg-gray-50'>
                <div className='flex space-x-2'>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Reply to ${selectedChat}...`}
                    rows={1}
                    className='flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className='flex-1 flex items-center justify-center text-gray-500'>
              <div className='text-center'>
                <Clock size={48} className='mx-auto mb-4 text-gray-300' />
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
