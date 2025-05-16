'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  FiSmile,
  FiPaperclip,
  FiSearch,
  FiMessageSquare
} from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';
import { BsThreeDotsVertical, BsArrowLeft } from 'react-icons/bs';
import { RiSendPlaneFill } from 'react-icons/ri';
import { EmojiPicker } from '../component/EmojiPicker';
import axiosInstance from '../utils/axiosInstance';
import AttachmentModal from '../component/attachmentModel';

type User = {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastMessage?: string;
  time?: string;
  unread?: number;
  chatRoomId?: string;
};

type Message = {
  _id: string;
  chatRoom: string;
  sender: string;
  messageType: "text" | "image" | "video" | "file";
  content: string;
  seenBy: string[];
  deliveredTo: string[];
  deletedFor: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

const ChatApp = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Error handling with debounce
  const showError = useDebounce((message: string) => {
    setError(message);
    const timeout = setTimeout(() => setError(null), 5000);
    setErrorTimeout(timeout);
  }, 300);

  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorTimeout]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || '', {
      query: { userId: user._id },
      transports: ['websocket'],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      showError("Connection error. Trying to reconnect...");
      console.error("Socket connection error:", err);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);

      if (selectedUser && message.chatRoom === selectedUser.chatRoomId) {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u._id === selectedUser._id
              ? { ...u, lastMessage: message.content, time: "Just now" }
              : u
          )
        );
      }
    };

    const handleMessageDelivered = ({ messageId, userId }: any) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, deliveredTo: [...msg.deliveredTo, userId] }
            : msg
        )
      );
    };

    const handleMessageSeen = ({ messageId, userId }: any) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, seenBy: [...msg.seenBy, userId] }
            : msg
        )
      );
    };

    const handleUserOnlineStatus = ({ userId, isOnline }: any) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isOnline } : user
        )
      );
      if (selectedUser?._id === userId && selectedUser!.isOnline !== isOnline) {
        setSelectedUser(prev => (prev ? { ...prev, isOnline } : prev));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDelivered", handleMessageDelivered);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("userOnlineStatus", handleUserOnlineStatus);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDelivered", handleMessageDelivered);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("userOnlineStatus", handleUserOnlineStatus);
    };
  }, [socket, user, selectedUser]);

  // Typing indicators and room management
  useEffect(() => {
    if (!socket || !user || !selectedUser?.chatRoomId) return;

    socket.emit("userConnected", user._id);
    socket.emit("joinRoom", selectedUser.chatRoomId);

    const handleTyping = ({ userId }: { userId: string }) => {
      setTypingUsers(prev => 
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    const handleStopTyping = ({ userId }: { userId: string }) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
    };
  }, [socket, user, selectedUser]);

  // Debounced typing handlers
  const emitStartTyping = useDebounce(() => {
    if (selectedUser?.chatRoomId && user?._id) {
      socket?.emit('startTyping', {
        roomId: selectedUser.chatRoomId,
        userId: user._id
      });
    }
  }, 500);

  const emitStopTyping = useDebounce(() => {
    if (selectedUser?.chatRoomId && user?._id) {
      socket?.emit('stopTyping', {
        roomId: selectedUser.chatRoomId,
        userId: user._id
      });
    }
  }, 1000);

  // Message handling
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user || !socket) return;

    const messageToSend = {
      chatRoom: selectedUser.chatRoomId,  
      sender: user._id,          
      messageType: 'text',              
      content: newMessage.trim(),
      fileName: null,                    
    };

    try {
      const response = await axiosInstance.post('/messages', messageToSend);
      socket.emit('sendMessage', messageToSend);
      
      setNewMessage('');
      
      // Clear typing indicator when message is sent
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setIsTyping(false);
      emitStopTyping();
      
      socket.on('lastMessageUpdate', ({ chatRoomId, lastMessage, time }) => {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === chatRoomId
              ? { ...user, lastMessage, time, unread: 0 }
              : user
          )
        );
      });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      showError(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Typing indicator logic
    if (!isTyping && selectedUser?.chatRoomId) {
      setIsTyping(true);
      emitStartTyping();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping();
    }, 2000);
  };

  // File handling
  const handleFileUpload = async (file: File, type: 'image' | 'document' | 'video' | 'audio') => {
    if (!selectedUser || !user || !socket) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatRoom', selectedUser.chatRoomId || '');
      formData.append('sender', user._id);
      formData.append('messageType', type);

      const response = await axiosInstance.post('/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const message = response.data;
      socket.emit('sendMessage', message);
      setMessages(prev => [...prev, message]);
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      showError(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleFileInput = (type: 'image' | 'document' | 'video' | 'audio') => {
    const input = document.createElement('input');
    input.type = 'file';

    switch (type) {
      case 'image': input.accept = 'image/*'; break;
      case 'document': input.accept = '.pdf,.doc,.docx,.txt'; break;
      case 'video': input.accept = 'video/*,.mp4,.mov,.avi,.webm,.mkv'; break;
      case 'audio': input.accept = 'audio/*,.mp3,.wav,.ogg,.aac'; break;
    }

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileUpload(files[0], type);
      }
    };

    input.click();
  };

  
  const fetchMessages = async () => {
    if (!selectedUser || !user || !selectedUser.chatRoomId) return;

    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/messages?roomId=${selectedUser.chatRoomId}`
      );
      
      setMessages(response.data);
      
      if (socket && response.data.length > 0) {
        const unseenMessages = response.data.filter(
          (msg: Message) => msg.sender !== user._id && !msg.seenBy.includes(user._id)
        );
        
        if (unseenMessages.length > 0) {
          socket.emit('markMessagesAsSeen', {
            messageIds: unseenMessages.map((msg: Message) => msg._id),
            userId: user._id,
            chatRoomId: selectedUser.chatRoomId
          });
        }
      }
    } catch (error: any) {
      console.log('Failed to fetch messages:', error);
      
    }
  };


  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMessages();
    }, 300);
  
    return () => clearTimeout(timeout);
  }, [selectedUser?.chatRoomId]);

  useEffect(() => {
    const storedUserString = localStorage.getItem('user');
    if (storedUserString) {
      try {
        const parsedUser = JSON.parse(storedUserString);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        showError('Failed to load user data');
      }
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/users`
        );
        setUsers(response.data);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        showError(error.response?.data?.message || 'Failed to load contacts');
      }
    };
    fetchUsers();
  }, []);

  // User interactions
  const handleUserClick = async (selectedUser: User) => {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chatrooms`,
        { user1: selectedUser._id }
      );

      const chatRoom = response.data.data.data;
      setSelectedUser({
        ...selectedUser,
        chatRoomId: chatRoom._id,
      });
      setMobileChatOpen(true);
    } catch (error: any) {
      console.error('Error creating/getting chat room:', error);
      showError(error.response?.data?.message || 'Failed to start chat');
    }
  };

  // UI helpers
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingIndicatorText = () => {
    if (typingUsers.length === 0) return null;

    const typingNames = typingUsers.map(userId => {
      const user = users.find(u => u._id === userId);
      return user?.username || 'Someone';
    });

    if (typingNames.length === 1) return `${typingNames[0]} is typing...`;
    if (typingNames.length === 2) return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    return `${typingNames[0]}, ${typingNames[1]}, and others are typing...`;
  };

  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [socket, errorTimeout]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className={`w-full md:w-96 border-r border-gray-200 bg-white flex flex-col transition-all duration-300 
          ${mobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 flex justify-between items-center">
          <div className="flex items-center space-x-4 p-4 rounded-lg max-w-xs text-white">
            <img
              src={user?.avatar}
              alt="User Avatar"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <span className="font-semibold text-lg">{user?.username}</span>
          </div>
          <button className="text-white hover:text-gray-200">
            <BsThreeDotsVertical size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-white">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 ease-in-out
                  ${selectedUser?._id === user._id ? 'bg-blue-50 transform scale-[1.01]' : 'hover:bg-gray-50 hover:shadow-xs'}`}
                onClick={() => handleUserClick(user)}
              >
                <div className="relative mr-4">
                  <img
                    src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={user.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white ring-1 ring-green-200"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {user.username}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {user.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 truncate pr-2">
  {user.lastMessage
    ? user.lastMessage.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ? <span className="italic text-gray-400">🖼️ File</span>
      : user.lastMessage
    : <span className="italic text-gray-400">No messages yet</span>}
</p>
                    {user.unread && user.unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {user.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-500 mb-1">No contacts found</h3>
              <p className="text-sm text-gray-400">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedUser ? (
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3">
              <button 
                className="md:hidden p-1 text-white hover:bg-blue-400 rounded-full transition-colors"
                onClick={() => setMobileChatOpen(false)}
              >
                <BsArrowLeft size={20} />
              </button>
              <div className="relative">
                <img
                  src={selectedUser.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={selectedUser.username}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                {selectedUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-600"></div>
                )}
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-white">{selectedUser.username}</h4>
                <div className="flex items-center space-x-1">
                  {selectedUser.isOnline ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="text-xs text-blue-100">Online</p>
                    </>
                  ) : (
                    <p className="text-xs text-blue-100">Last seen recently</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] bg-opacity-30"
            style={{
              backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')",
              backgroundBlendMode: 'overlay',
            }}
          >
            <div className="space-y-3">
              {messages.map((msg: any, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-sm relative
                      ${msg.sender === user?._id
                        ? 'bg-blue-100 rounded-tr-none'
                        : 'bg-white rounded-tl-none'
                      }`}
                  >
                    {msg.messageType === 'text' && (
                      <p className="text-gray-800">{msg.content}</p>
                    )}
                    {msg.messageType === 'image' && (
                      <img
                        src={msg.content}
                        alt="sent image"
                        className="max-w-full h-auto rounded"
                      />
                    )}
                    {msg.messageType === 'audio' && (
                      <audio controls className="w-full">
                        <source src={msg.content} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {msg.messageType === 'video' && (
                      <video controls className="w-full max-h-64">
                        <source src={msg.content} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {msg.messageType === 'document' && (
                      <a
                        href={msg.content}
                        download
                        className="text-blue-500 underline break-words"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📄 Download Document
                      </a>
                    )}
                    <div className={`flex justify-end text-xs mt-1 items-center space-x-1 
                      ${msg.sender === user?._id ? 'text-blue-600' : 'text-gray-500'}`}>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {msg.sender === user?._id && (
                        <>
                          {msg.deliveredTo.includes(selectedUser._id) ? (
                            <IoCheckmarkDone
                              size={16}
                              className={msg.seenBy.includes(selectedUser._id) ? 'text-blue-600' : 'text-gray-400'}
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">Sending...</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-xs md:max-w-md p-3 rounded-lg shadow-sm bg-white rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getTypingIndicatorText()}</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-3 bg-white border-t flex items-center space-x-2 relative">
            <button 
              className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FiSmile size={22} />
            </button>
            <button 
              className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
              onClick={() => setShowAttachmentModal(true)}
            >
              <FiPaperclip size={22} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <RiSendPlaneFill size={22} />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-16 left-4 z-10">
                <EmojiPicker onSelect={handleEmojiSelect} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center p-6 max-w-md">
            <div className="mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FiMessageSquare size={64} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Select a chat</h3>
            <p className="text-gray-500 mb-6">Choose a conversation from your contacts to start messaging</p>
            <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
              New Conversation
            </button>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {showAttachmentModal && (
        <AttachmentModal 
          onClose={() => setShowAttachmentModal(false)}
          onSelect={(type) => {
            setShowAttachmentModal(false);
            handleFileInput(type);
          }}
        />
      )}
    </div>
  );
};

export default ChatApp;