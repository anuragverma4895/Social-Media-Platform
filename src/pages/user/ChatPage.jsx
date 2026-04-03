import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../../services/chatAPI';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { PaperAirplaneIcon, FaceSmileIcon, PhotoIcon, ArrowLeftIcon, EllipsisVerticalIcon, UserPlusIcon, ChatBubbleLeftRightIcon, PlusCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const scrollRef = useRef();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activeChatLoading, setActiveChatLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchSuggestions();
  }, []);

  useEffect(() => {
    const loadChat = async () => {
      if (!conversationId) return;
      setActiveChatLoading(true);
      try {
        const found = conversations.find(c => c._id === conversationId);
        if (found) {
          setActiveChat(found);
        } else {
          // Fallback: fetch list again to find it
          const { data } = await chatAPI.getConversations();
          const fresh = data.data.find(c => c._id === conversationId);
          if (fresh) setActiveChat(fresh);
          setConversations(data.data);
        }
        fetchMessages(conversationId);
      } finally {
        setActiveChatLoading(false);
      }
    };
    loadChat();
  }, [conversationId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
      // Update last message in conversation list
      setConversations((prev) => prev.map(c => 
        c._id === message.conversationId ? { ...c, lastMessage: message } : c
      ));
    });

    return () => socket.off('receive_message');
  }, [socket, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await chatAPI.getConversations();
      setConversations(data.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data } = await userAPI.getSuggestions();
      setSuggestedUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const { data } = await chatAPI.getOrCreateConversation(userId);
      navigate(`/messages/${data.data._id}`);
      fetchConversations(); // Update list
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const fetchMessages = async (id) => {
    try {
      const { data } = await chatAPI.getMessages(id);
      setMessages(data.data);
      if (socket) socket.emit('join_chat', id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const recipient = activeChat.participants.find(p => p._id !== user._id);
    
    try {
      const { data } = await chatAPI.sendMessage(recipient._id, newMessage);
      const messageData = {
        ...data.data,
        recipientId: recipient._id
      };
      
      socket.emit('send_message', messageData);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getChatPartner = (chat) => {
    return chat?.participants?.find(p => p._id !== user?._id);
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] max-w-6xl mx-auto my-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Sidebar - Conversations */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h2>
          <button 
            onClick={() => navigate('/messages')}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            title="New Message"
          >
            <PlusCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-100 transition-all outline-none"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 opacity-50">No conversations yet</div>
          ) : (
            conversations.map((chat) => {
              const partner = getChatPartner(chat);
              const isActive = conversationId === chat._id;
              return (
                <button
                  key={chat._id}
                  onClick={() => navigate(`/messages/${chat._id}`)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-white shadow-md ring-1 ring-black/5 scale-[1.02]' 
                      : 'hover:bg-white/60 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partner?.username}&background=667eea&color=fff`}
                      alt={partner?.username}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                    />
                    {/* Status dot could go here */}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-bold truncate">{partner?.name || partner?.username}</p>
                      {chat.updatedAt && (
                        <span className="text-[10px] text-gray-400 font-medium lowercase">
                          {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!conversationId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {activeChatLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
          </div>
        ) : !conversationId ? (
          <div className="w-full max-w-2xl px-6 py-12">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <PaperAirplaneIcon className="w-10 h-10 text-primary-500 -rotate-45" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Start a new chat</h3>
              <p className="text-gray-500">Pick someone to start messaging or search for friends.</p>
            </div>

            {suggestedUsers.length > 0 && (
              <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 px-2 uppercase tracking-wider">Suggested for you</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedUsers.slice(0, 6).map((sUser) => (
                    <div key={sUser._id} className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-gray-100/50 hover:shadow-md transition-all group">
                      <img
                        src={sUser.profilePicture || `https://ui-avatars.com/api/?name=${sUser.username}&background=667eea&color=fff`}
                        alt={sUser.username}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-50 group-hover:ring-primary-100 transition-all"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors uppercase tracking-tight">{sUser.name || sUser.username}</p>
                        <p className="text-xs text-gray-400 font-medium truncate">@{sUser.username}</p>
                      </div>
                      <button 
                        onClick={() => handleStartChat(sUser._id)}
                        className="p-2.5 bg-gray-900 hover:bg-primary-600 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                        title="Start Chat"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {suggestedUsers.length === 0 && !loading && (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No suggestions available right now. Try searching for friends!</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/messages')} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <img
                  src={getChatPartner(activeChat)?.profilePicture || `https://ui-avatars.com/api/?name=${getChatPartner(activeChat)?.username || 'User'}&background=667eea&color=fff`}
                  alt="avatar"
                  className="w-10 h-10 rounded-2xl object-cover shadow-sm"
                />
                <div>
                  <p className="font-bold text-gray-900 leading-tight">{getChatPartner(activeChat)?.name || getChatPartner(activeChat)?.username || 'Chat'}</p>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.map((msg, index) => {
                const isOwn = msg.sender === user._id;
                return (
                  <div key={msg._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-5 py-3 rounded-3xl text-sm shadow-sm transition-all hover:shadow-md ${
                      isOwn 
                        ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      {msg.content}
                      <p className={`text-[10px] mt-1 text-right opacity-60 font-medium ${isOwn ? 'text-white' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                <button type="button" className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                  <FaceSmileIcon className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                  <PhotoIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-300 text-white rounded-xl shadow-lg shadow-primary-200 transition-all hover:scale-105 active:scale-95"
                >
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
