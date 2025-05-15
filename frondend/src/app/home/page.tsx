'use client';
import { useState, useEffect, useRef } from 'react';
import {
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiSmile,
  FiPaperclip,
  FiSend,
  FiSearch,
  FiMessageSquare
} from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';
import { BsThreeDotsVertical, BsArrowLeft } from 'react-icons/bs';
import { RiSendPlaneFill } from 'react-icons/ri';
 import {EmojiPicker} from '../component/EmojiPicker'
import axiosInstance from '../utils/axiosInstance';

type User = {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastMessage?: string;
  time?: string;
  unread?: number;
};

type Message = {
  id: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
};

const ChatApp = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<any>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const storedUserString = localStorage.getItem('user');
    if (storedUserString) {
      try {
        const parsedUser = JSON.parse(storedUserString);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/users`
        );
        const data: User[] = response.data;

        const updatedUsers = data.map((user) => ({
          ...user,
          lastMessage: 'Hello there!',
          time: '1:00 PM',
          unread: Math.floor(Math.random() * 5), // Random unread count for demo
        }));

        setUsers(updatedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = async (selecteduser:any) => {
    try {
      console.log(selecteduser._id)
      console.log(user._id)
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chatrooms`, {
        user1: selecteduser._id,
        
      });
  
      const chatRoom = response.data;
  
      
      setSelectedUser({
        ...user,
        chatRoomId: chatRoom._id,
      });
  
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const newMsg: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);

    // Simulate reply after 1-3 seconds
    if (Math.random() > 0.3) { // 70% chance of reply for demo
      setTimeout(() => {
        const replies = [
          "That's interesting!",
          "I see what you mean.",
          "Let me think about that.",
          "Thanks for sharing!",
          "I agree with you.",
          "What do you think we should do next?",
          "That makes sense.",
        ];
        const replyMsg: Message = {
          id: messages.length + 2,
          text: replies[Math.floor(Math.random() * replies.length)],
          sender: 'them',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'read',
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 1000 + Math.random() * 2000);
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === selectedUser._id
          ? {
              ...user,
              lastMessage: newMessage,
              time: 'Just now',
              unread: 0,
            }
          : user
      )
    );
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  
    return (
      <div className="flex h-screen bg-gray-50 text-gray-800">
        {/* Sidebar */}
        <div className={`w-full md:w-96 border-r border-gray-200 bg-white flex flex-col transition-all duration-300 
          ${mobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 flex justify-between items-center">
          <div className="flex items-center space-x-4  p-4 rounded-lg max-w-xs text-white">
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
                        {user.lastMessage || <span className="italic text-gray-400">No messages yet</span>}
                      </p>
                     
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
                      <p className="text-xs text-blue-100">Last seen { 'recently'}</p>
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-sm relative
                        ${msg.sender === 'me'
                          ? 'bg-blue-100 rounded-tr-none'
                          : 'bg-white rounded-tl-none'
                        }`}
                    >
                      <p className="text-gray-800">{msg.text}</p>
                      <div className={`flex justify-end text-xs mt-1 items-center space-x-1 
                        ${msg.sender === 'me' ? 'text-blue-600' : 'text-gray-500'}`}>
                        <span>{msg.time}</span>
                        {msg.sender === 'me' && (
                          <IoCheckmarkDone
                            size={16}
                            className={msg.status === 'read' ? 'text-blue-600' : 'text-gray-400'}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
              <button className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100">
                <FiPaperclip size={22} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
      </div>
    );
    
};

export default ChatApp;