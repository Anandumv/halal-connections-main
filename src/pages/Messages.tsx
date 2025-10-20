import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft,
  Search,
  MoreVertical,
  User,
  Heart
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Match = Tables<'matches'>;

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
  is_admin_message?: boolean;
}

interface Conversation {
  match: Match;
  otherUser: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const userId = searchParams.get('user_id');
  const matchId = searchParams.get('match_id');

  useEffect(() => {
    if (user) {
      fetchConversations();
      if (matchId) {
        // Message from match
        handleMatchMessage(matchId);
      }
    }
  }, [user, matchId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.match.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedConversation) return;

    console.log('Setting up real-time subscription for match:', selectedConversation.match.id);

    const channel = supabase
      .channel(`messages:${selectedConversation.match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${selectedConversation.match.id}`,
        },
        (payload) => {
          console.log('New message received via real-time:', payload);
          const newMessage = payload.new as Message;
          
          // Add the new message to the state
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping duplicate');
              return prev;
            }
            
            console.log('Adding new message to state');
            return [...prev, newMessage];
          });
          
          // Scroll to bottom when new message arrives
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time messages');
          setRealtimeConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error');
          setRealtimeConnected(false);
        } else if (status === 'TIMED_OUT') {
          console.error('Real-time subscription timed out');
          setRealtimeConnected(false);
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      setRealtimeConnected(false);
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // Fallback: Refresh messages if real-time is not connected
  useEffect(() => {
    if (selectedConversation && !realtimeConnected) {
      const interval = setInterval(() => {
        console.log('Real-time not connected, refreshing messages as fallback');
        fetchMessages(selectedConversation.match.id);
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [selectedConversation, realtimeConnected]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Fetch only accepted matches where user is involved
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_fkey(*),
          user2:profiles!matches_user2_fkey(*)
        `)
        .or(`user1.eq.${user?.id},user2.eq.${user?.id}`)
        .eq('status_user1', 'accepted')
        .eq('status_user2', 'accepted')
        .order('updated_at', { ascending: false });

      if (matchesError) throw matchesError;

      // Transform matches into conversations
      const conversationsData = await Promise.all(
        (matches || []).map(async (match) => {
          const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
          
          // Get last message for this match
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .eq('sender_id', otherUser.id)
            .is('read', false);

          return {
            match,
            otherUser,
            lastMessage,
            unreadCount: unreadCount || 0
          };
        })
      );

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    }
  };

  const handleMatchMessage = async (matchId: string) => {
    try {
      const { data: match } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_fkey(*),
          user2:profiles!matches_user2_fkey(*)
        `)
        .eq('id', matchId)
        .eq('status_user1', 'accepted')
        .eq('status_user2', 'accepted')
        .single();

      if (match) {
        const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
        const conversation: Conversation = {
          match,
          otherUser,
          lastMessage: undefined,
          unreadCount: 0,
        };
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('Error handling match message:', error);
      toast({
        title: 'Error',
        description: 'Unable to load conversation.',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      
      // Check if both users have accepted the match
      const match = selectedConversation.match;
      if (match.status_user1 !== 'accepted' || match.status_user2 !== 'accepted') {
        toast({
          title: "Cannot send message",
          description: "Both users must accept the match before messaging",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: selectedConversation.match.id,
          sender_id: user?.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      
      // Don't fetch messages again - real-time subscription will handle it
      // This eliminates the delay caused by the additional fetch
      
      // Optional: Show success toast (can be removed for faster UX)
      // toast({
      //   title: "Message sent",
      //   description: "Your message has been sent",
      // });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conversation => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return conversation.otherUser.full_name?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen animated-bg honeycomb-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto"></div>
          <p className="mt-4 text-amber-400 text-lg">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg honeycomb-bg">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Header */}
      <header className="glass border-b border-amber-400/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(-1)}
                className="btn-outline"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="gradient-text text-2xl font-bold">Messages</h1>
                  <p className="text-muted-foreground">Connect with your matches</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="honeycomb-card lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base sm:text-lg">Conversations</CardTitle>
                <Button variant="outline" size="icon" className="btn-outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-amber-400/20 text-foreground placeholder:text-muted-foreground focus:border-amber-400 w-full"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-amber-400 mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">No conversations yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">You need to have accepted matches to start conversations</p>
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="btn-primary w-full sm:w-auto"
                    >
                      View Matches
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.match.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 sm:p-4 cursor-pointer hover:bg-amber-400/5 transition-colors ${
                        selectedConversation?.match.id === conversation.match.id
                          ? 'bg-amber-400/10 border-r-2 border-amber-400'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={conversation.otherUser.photo_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-black font-semibold text-xs sm:text-base">
                            {conversation.otherUser.full_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-foreground font-medium truncate text-xs sm:text-base">
                              {conversation.otherUser.full_name}
                            </h4>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-amber-400 text-black text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || 'Start a conversation...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="honeycomb-card lg:col-span-2 flex flex-col mt-3 lg:mt-0">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b border-amber-400/20">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={selectedConversation.otherUser.photo_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-black font-semibold text-xs sm:text-base">
                          {selectedConversation.otherUser.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-foreground text-xs sm:text-base">{selectedConversation.otherUser.full_name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          {selectedConversation.otherUser.verified && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">
                              Verified
                            </Badge>
                          )}
                          <span className="text-xs sm:text-sm text-muted-foreground">Online</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 max-h-[calc(100vh-400px)]">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <Heart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-amber-400 mb-4" />
                          <p className="text-muted-foreground text-sm sm:text-base">No messages yet</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80vw] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${
                                message.sender_id === user?.id
                                  ? 'bg-amber-400 text-black'
                                  : message.is_admin_message
                                  ? 'bg-purple-600 text-foreground border border-purple-400/30'
                                  : 'bg-background/50 text-foreground border border-amber-400/20'
                              }`}
                            >
                              {message.is_admin_message && (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs font-semibold text-purple-200">👑 Admin</span>
                                </div>
                              )}
                              <p>{message.content}</p>
                              <p className={`mt-1 ${
                                message.sender_id === user?.id 
                                  ? 'text-black/70' 
                                  : message.is_admin_message
                                  ? 'text-purple-200'
                                  : 'text-muted-foreground'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Connection Status */}
                    {selectedConversation && (
                      <div className="px-2 sm:px-4 py-1 border-t border-amber-400/10">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className="text-muted-foreground">
                            {realtimeConnected ? 'Real-time connected' : 'Using fallback mode'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="p-2 sm:p-4 border-t border-amber-400/20">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1 bg-background/50 border-amber-400/20 text-foreground placeholder:text-muted-foreground focus:border-amber-400 w-full"
                        />
                        <Button 
                          onClick={sendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="btn-primary w-full sm:w-auto"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-amber-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">Select a conversation</h3>
                  <p className="text-muted-foreground text-xs sm:text-base">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 