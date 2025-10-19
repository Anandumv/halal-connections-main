import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ProfileForm } from '@/components/ProfileForm';
import HoneycombLogo from '@/components/HoneycombLogo';
import { 
  Crown, 
  MessageCircle, 
  Settings, 
  Heart, 
  Calendar,
  MapPin,
  Users,
  Bell,
  ChevronRight,
  Sparkles,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  User,
  Edit,
  Upload,
  X,
  Plus,
  UserPlus,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  photo_url: string;
  photos?: string[];
  bio: string;
  verified: boolean;
  preferences: any;
  email: string;
}

interface Match {
  id: string;
  user1: Profile;
  user2: Profile;
  status_user1: string;
  status_user2: string;
  created_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  payload?: {
    match_id?: string;
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [processingMatch, setProcessingMatch] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchProfile(),
            fetchMatches(),
            fetchPendingMatches(),
            fetchNotifications()
          ]);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileSave = async () => {
    await fetchProfile();
    setShowProfileModal(false);
    toast({
      title: "Profile updated successfully",
      description: "Your profile has been saved.",
    });
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          status_user1,
          status_user2,
          created_at,
          user1:profiles!matches_user1_fkey(*),
          user2:profiles!matches_user2_fkey(*)
        `)
        .or(`user1.eq.${user?.id},user2.eq.${user?.id}`)
        .eq('status_user1', 'accepted')
        .eq('status_user2', 'accepted');

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPendingMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          status_user1,
          status_user2,
          created_at,
          user1:profiles!matches_user1_fkey(*),
          user2:profiles!matches_user2_fkey(*)
        `)
        .or(`user1.eq.${user?.id},user2.eq.${user?.id}`)
        .or(`status_user1.eq.pending,status_user2.eq.pending`);

      if (error) throw error;
      
      // Filter to only show matches where the current user hasn't made a decision yet
      const filteredData = (data || []).filter(match => {
        const isUser1 = match.user1.id === user?.id;
        const userStatus = isUser1 ? match.status_user1 : match.status_user2;
        return userStatus === 'pending';
      });
      
      setPendingMatches(filteredData);
    } catch (error) {
      console.error('Error fetching pending matches:', error);
    }
  };

  const handleMatchResponse = async (matchId: string, response: 'accepted' | 'rejected') => {
    if (!user) return;
    
    setProcessingMatch(matchId);
    
    try {
      // First, verify the match exists and user is part of it
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('user1, user2, status_user1, status_user2')
        .eq('id', matchId)
        .single();

      if (matchError || !matchData) throw new Error('Match not found');

      // Verify user is part of this match
      if (matchData.user1 !== user.id && matchData.user2 !== user.id) {
        throw new Error('You are not part of this match');
      }

      // Verify user hasn't already responded
      const isUser1 = matchData.user1 === user.id;
      const currentUserStatus = isUser1 ? matchData.status_user1 : matchData.status_user2;
      
      if (currentUserStatus !== 'pending') {
        throw new Error('You have already responded to this match');
      }

      const updateField = isUser1 ? 'status_user1' : 'status_user2';

      // Update the match status
      const { error: updateError } = await supabase
        .from('matches')
        .update({ [updateField]: response })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // If both users have accepted, create a notification for both
      if (response === 'accepted') {
        const { data: updatedMatch } = await supabase
          .from('matches')
          .select('status_user1, status_user2, user1, user2')
          .eq('id', matchId)
          .single();

        if (updatedMatch && updatedMatch.status_user1 === 'accepted' && updatedMatch.status_user2 === 'accepted') {
          // Both users accepted - create notifications
          const notificationPromises = [
            supabase.from('notifications').insert({
              user_id: updatedMatch.user1,
              type: 'match_accepted',
              title: 'Match Accepted!',
              message: 'You can now start chatting with your match',
              payload: { match_id: matchId }
            }),
            supabase.from('notifications').insert({
              user_id: updatedMatch.user2,
              type: 'match_accepted',
              title: 'Match Accepted!',
              message: 'You can now start chatting with your match',
              payload: { match_id: matchId }
            })
          ];

          await Promise.all(notificationPromises);
        }
      } else if (response === 'rejected') {
        // If user rejected, notify the other user
        const otherUserId = isUser1 ? matchData.user2 : matchData.user1;
        await supabase.from('notifications').insert({
          user_id: otherUserId,
          type: 'match_rejected',
          title: 'Match Update',
          message: 'A match has been rejected',
          payload: { match_id: matchId }
        });
      }

      // Refresh data
      await Promise.all([fetchMatches(), fetchPendingMatches(), fetchNotifications()]);

      toast({
        title: response === 'accepted' ? "Match accepted!" : "Match rejected",
        description: response === 'accepted' 
          ? "You can now start chatting with your match." 
          : "The match has been rejected.",
      });

    } catch (error) {
      console.error('Error updating match:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingMatch(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      // Parse payload as object
      setNotifications((data || []).map((n) => ({
        ...n,
        payload: typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload || {},
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchedProfile = (match: Match) => {
    return match.user1.id === user?.id ? match.user2 : match.user1;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return formatDate(dateString);
  };

  const handleLogout = async () => {
    try {
      // Use the signOut function from useAuth hook to properly clean up state
      await signOut();
      navigate('/');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      // Force redirect even if signOut fails
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been logged out of your account.",
      });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingPhoto(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          photo_url: publicUrl,
          photos: [publicUrl],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      await fetchProfile();

      toast({
        title: "Photo uploaded successfully",
        description: "Your profile photo has been updated.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    fetchNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationRead(notification.id);
    if (notification.type === 'match' && notification.payload?.match_id) {
      navigate(`/messages?match=${notification.payload.match_id}`);
      setShowNotificationModal(false);
    } else if (notification.type === 'message' && notification.payload?.match_id) {
      navigate(`/messages?match=${notification.payload.match_id}`);
      setShowNotificationModal(false);
    } else if (notification.type === 'match_accepted' && notification.payload?.match_id) {
      navigate(`/messages?match=${notification.payload.match_id}`);
      setShowNotificationModal(false);
    } else {
      setShowNotificationModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="h-8 w-8 text-black" />
          </div>
          <p className="text-foreground text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-card/90 border border-amber-400/30 shadow-2xl rounded-3xl max-w-lg w-full backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="h-10 w-10 text-black" />
            </div>
                            <CardTitle className="text-foreground text-2xl font-bold mb-2">Welcome to Bee Hive Match</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Complete your profile to start connecting with your community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Heart className="h-5 w-5 text-amber-400" />
                <div className="text-left">
                  <p className="text-foreground font-medium">Find Your Perfect Match</p>
                  <p className="text-muted-foreground text-sm">Connect with like-minded individuals</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Users className="h-5 w-5 text-amber-400" />
                <div className="text-left">
                  <p className="text-foreground font-medium">Join the Community</p>
                  <p className="text-muted-foreground text-sm">Be part of a growing network</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <div className="text-left">
                  <p className="text-foreground font-medium">Verified Profiles</p>
                  <p className="text-muted-foreground text-sm">Safe and authentic connections</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                if (user?.id) {
                  setShowProfileModal(true);
                } else {
                  toast({
                    title: "Error",
                    description: "User session not available. Please try logging in again.",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              <Plus className="h-6 w-6 mr-3" />
              Create Your Profile
            </Button>
            
            <p className="text-muted-foreground text-sm text-center">
              It only takes a few minutes to get started
            </p>
          </CardContent>
        </Card>

        {/* Profile Creation Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-400/20">
            <ProfileForm 
              open={showProfileModal} 
              onOpenChange={setShowProfileModal}
              initialValues={profile ? {
                full_name: profile.full_name || '',
                age: profile.age,
                gender: (profile.gender?.toLowerCase() as 'male' | 'female') || 'male',
                bio: profile.bio || '',
                photo_url: profile.photo_url || '',
                photos: profile.photos || [],
                name_initials: (profile.preferences as any)?.name_initials || '',
                year_of_birth: (profile.preferences as any)?.year_of_birth || new Date().getFullYear() - 18,
                hijabi: (profile.preferences as any)?.hijabi || false,
                height: (profile.preferences as any)?.height || '',
                residence: (profile.preferences as any)?.residence || '',
                will_relocate: (profile.preferences as any)?.will_relocate || false,
                education: (profile.preferences as any)?.education || '',
                profession: (profile.preferences as any)?.profession || '',
                legal_status: (profile.preferences as any)?.legal_status || 'citizen',
                marital_status: (profile.preferences as any)?.marital_status || 'never_married',
                divorced_with_kids: (profile.preferences as any)?.divorced_with_kids || false,
                ethnicity: (profile.preferences as any)?.ethnicity || '',
                religious_sect: (profile.preferences as any)?.religious_sect || '',
                family: (profile.preferences as any)?.family || '',
                language: (profile.preferences as any)?.language || '',
                hobbies: (profile.preferences as any)?.hobbies || [],
                location: (profile.preferences as any)?.location || '',
                madhab: (profile.preferences as any)?.madhab || 'hanafi',
                prayer_frequency: (profile.preferences as any)?.prayer_frequency || 'usually',
                marriage_timeline: (profile.preferences as any)?.marriage_timeline || 'within_1_year',
                phone: (profile.preferences as any)?.phone || '',
                interests: (profile.preferences as any)?.interests || [],
                looking_for_age_min: (profile.preferences as any)?.looking_for_age_min || 18,
                looking_for_age_max: (profile.preferences as any)?.looking_for_age_max || 50,
                looking_for_height: (profile.preferences as any)?.looking_for_height || '',
                looking_for_residence: (profile.preferences as any)?.looking_for_residence || '',
                looking_for_education: (profile.preferences as any)?.looking_for_education || '',
                looking_for_profession: (profile.preferences as any)?.looking_for_profession || '',
                looking_for_legal_status: (profile.preferences as any)?.looking_for_legal_status || 'citizen',
                looking_for_marital_status: (profile.preferences as any)?.looking_for_marital_status || 'never_married',
                looking_for_religious_sect: (profile.preferences as any)?.looking_for_religious_sect || '',
                looking_for_ethnicity: (profile.preferences as any)?.looking_for_ethnicity || '',
              } : undefined}
              userId={user?.id || ''}
              onSave={handleProfileSave}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 honeycomb-bg opacity-10"></div>
      
      {/* Solid Black Background */}
      <div className="absolute inset-0 bg-background"></div>

      {/* Top Profile Header - Exact match to reference */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-amber-400/20 p-4 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <HoneycombLogo size="md" className="mr-2" />
            
            {/* Circular Profile Avatar - Clickable */}
            <div className="relative group">
              <button 
                onClick={() => setShowPhotoModal(true)}
                className="relative w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden bg-gradient-to-br from-amber-400 to-yellow-500 transition-all duration-300 hover:scale-105"
              >
                                        {(profile.photos && profile.photos.length > 0) || profile.photo_url ? (
                          <img
                            src={profile.photos && profile.photos.length > 0 ? profile.photos[0] : profile.photo_url}
                            alt={profile.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-black font-bold text-lg ${(profile.photos && profile.photos.length > 0) || profile.photo_url ? 'hidden' : ''}`}>
                  {profile.full_name?.[0] || 'U'}
                </div>
              </button>
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 text-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex flex-col">
              <h1 className="text-foreground font-bold text-lg">Welcome, {profile.full_name}!</h1>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="default" 
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border-green-400/30"
                >
                  Ready to connect
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-amber-400 hover:text-foreground hover:bg-amber-400/10 rounded-lg transition-all duration-300 relative"
              onClick={() => setShowNotificationModal(true)}
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-amber-400 hover:text-foreground hover:bg-amber-400/10 rounded-lg transition-all duration-300"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 fade-in relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left Column - Action Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* My Profile Card */}
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl hover:border-amber-400/40 transition-all duration-300 cursor-pointer group card-hover"
                  onClick={() => navigate('/profile')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <User className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold text-sm">My Profile</h3>
                    <p className="text-muted-foreground text-xs">Update your information</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages Card */}
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl hover:border-amber-400/40 transition-all duration-300 cursor-pointer group card-hover"
                  onClick={() => navigate('/messages')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold text-sm">Messages</h3>
                    <p className="text-muted-foreground text-xs">Chat with your matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Matches Card */}
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl hover:border-amber-400/40 transition-all duration-300 cursor-pointer group card-hover"
                  onClick={() => navigate('/my-matches')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold text-sm">My Matches</h3>
                    <p className="text-muted-foreground text-xs">View your assigned matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl hover:border-amber-400/40 transition-all duration-300 cursor-pointer group card-hover"
                  onClick={() => navigate('/settings')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold text-sm">Settings</h3>
                    <p className="text-muted-foreground text-xs">Customize your preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content Card */}
          <div className="lg:col-span-2">
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl relative overflow-hidden">
              
              <CardContent className="p-8 text-center">
                {/* User Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden">
                  {(profile?.photos && profile.photos.length > 0) || profile?.photo_url ? (
                    <img 
                      src={profile.photos && profile.photos.length > 0 ? profile.photos[0] : profile.photo_url} 
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-black" />
                  )}
                </div>
                
                {/* Title */}
                <h2 className="text-foreground font-bold text-2xl mb-4">Welcome, {profile?.full_name}!</h2>
                
                {/* Description */}
                <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md mx-auto">
                  Manage your profile, view your matches, and connect with your community. Everything you need is just a click away.
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-card/50 rounded-lg p-4 border border-amber-400/10">
                    <div className="text-2xl font-bold text-amber-400 mb-1">{matches.length}</div>
                    <div className="text-muted-foreground text-sm">Active Matches</div>
                  </div>
                  <div className="bg-card/50 rounded-lg p-4 border border-amber-400/10">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{pendingMatches.length}</div>
                    <div className="text-muted-foreground text-sm">Pending Matches</div>
                  </div>
                  <div className="bg-card/50 rounded-lg p-4 border border-amber-400/10">
                    <div className="text-2xl font-bold text-amber-400 mb-1">{notifications.filter(n => !n.read).length}</div>
                    <div className="text-muted-foreground text-sm">New Notifications</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Matches Section */}
            {pendingMatches.length > 0 && (
              <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground text-lg font-semibold">Pending Matches</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        {pendingMatches.length} {pendingMatches.length === 1 ? 'match' : 'matches'} waiting for your response
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {pendingMatches.map((match) => {
                      const matchedProfile = getMatchedProfile(match);
                      const isUser1 = match.user1.id === user?.id;
                      const otherUserStatus = isUser1 ? match.status_user2 : match.status_user1;
                      
                      return (
                        <div key={match.id} className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border border-amber-400/20">
                          <Avatar className="h-12 w-12 ring-2 ring-amber-400/30">
                            <AvatarImage src={(matchedProfile?.photos && matchedProfile.photos.length > 0) ? matchedProfile.photos[0] : matchedProfile?.photo_url} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-bold">
                              {matchedProfile?.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-base">{matchedProfile?.full_name}</h4>
                            <p className="text-muted-foreground text-sm">{matchedProfile?.age} years • {matchedProfile?.gender}</p>
                            {matchedProfile?.bio && (
                              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{matchedProfile.bio}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-amber-400 text-xs">Match created {getTimeAgo(match.created_at)}</p>
                              {otherUserStatus !== 'pending' && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs">
                                  {otherUserStatus === 'accepted' ? 'They accepted' : 'They declined'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="text-center">
                              <p className="text-muted-foreground text-xs mb-1">Your Response</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMatchResponse(match.id, 'rejected')}
                                disabled={processingMatch === match.id}
                                className="bg-red-600 hover:bg-red-700 text-foreground px-3 py-1"
                                title="Reject Match"
                              >
                                {processingMatch === match.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <ThumbsDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleMatchResponse(match.id, 'accepted')}
                                disabled={processingMatch === match.id}
                                className="bg-green-600 hover:bg-green-700 text-foreground px-3 py-1"
                                title="Accept Match"
                              >
                                {processingMatch === match.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <ThumbsUp className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accepted Matches Section */}
            {matches.length > 0 && (
              <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                      <Heart className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground text-lg font-semibold">Your Matches</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        {matches.length} {matches.length === 1 ? 'match' : 'matches'} ready to chat
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matches.slice(0, 4).map((match) => {
                      const matchedProfile = getMatchedProfile(match);
                      
                      return (
                        <div key={match.id} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-amber-400/10 hover:border-amber-400/30 transition-all duration-300 cursor-pointer group"
                             onClick={() => navigate(`/messages?match=${match.id}`)}>
                          <Avatar className="h-10 w-10 ring-2 ring-amber-400/30 group-hover:ring-amber-400/60 transition-all duration-300">
                            <AvatarImage src={(matchedProfile?.photos && matchedProfile.photos.length > 0) ? matchedProfile.photos[0] : matchedProfile?.photo_url} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-bold">
                              {matchedProfile?.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm truncate">{matchedProfile?.full_name}</h4>
                            <p className="text-muted-foreground text-xs">{matchedProfile?.age} years • {matchedProfile?.gender}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">
                              Chat Ready
                            </Badge>
                            <MessageCircle className="h-4 w-4 text-amber-400 group-hover:text-foreground transition-colors duration-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {matches.length > 4 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/messages')}
                        className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                      >
                        View All Matches
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Photo Modal - Click to Expand */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="relative max-w-2xl w-full mx-2 sm:mx-4 rounded-3xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-4 border-amber-400/60 shadow-2xl p-6 sm:p-8"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close photo preview"
              className="absolute top-4 right-4 text-amber-400 hover:text-foreground bg-background/30 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all duration-300"
              onClick={() => setShowPhotoModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              {/* Large Profile Photo - Full Size */}
              <div className="max-w-md mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-yellow-500 p-1">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={`${profile.full_name}'s profile photo`}
                    className="w-full h-auto max-h-96 object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-black font-bold text-4xl bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl">
                    {profile.full_name?.[0] || 'U'}
                  </div>
                )}
              </div>
              
              {/* Profile Details */}
              <h3 className="text-2xl font-bold text-foreground mb-2">{profile.full_name}</h3>
              <p className="text-muted-foreground text-sm mb-4">Profile Photo</p>
              
              {/* Profile Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto mb-6">
                {profile.age && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">{profile.age} years</span>
                  </div>
                )}
                {profile.gender && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">{profile.gender}</span>
                  </div>
                )}
                {profile.preferences?.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">{profile.preferences.location}</span>
                  </div>
                )}
                {profile.preferences?.profession && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">{profile.preferences.profession}</span>
                  </div>
                )}
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <div className="text-center mb-6">
                  <p className="text-muted-foreground text-sm italic">"{profile.bio}"</p>
                </div>
              )}
              
              {/* Upload New Photo Button */}
              <div className="flex gap-3 justify-center">
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black transition-all duration-300"
                    disabled={uploadingPhoto}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </Button>
                </label>
                <Button
                  variant="outline"
                  className="border-gray-400 text-muted-foreground hover:bg-gray-400 hover:text-black transition-all duration-300"
                  onClick={() => setShowPhotoModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="max-w-lg w-full bg-gray-900 border-amber-400/20">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-400" /> Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border border-amber-400/10 hover:bg-amber-400/10 ${notification.read ? 'opacity-60' : 'bg-background/30'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === 'match' ? (
                      <Heart className="h-5 w-5 text-pink-400" />
                    ) : notification.type === 'message' ? (
                      <MessageCircle className="h-5 w-5 text-amber-400" />
                    ) : notification.type === 'match_accepted' ? (
                      <ThumbsUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <Bell className="h-5 w-5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{notification.title}</span>
                      {!notification.read && <span className="ml-2 px-2 py-0.5 bg-amber-400 text-black text-xs rounded-full">New</span>}
                    </div>
                    <div className="text-muted-foreground text-xs mb-1">{notification.message}</div>
                    <div className="text-gray-500 text-xs">{new Date(notification.created_at).toLocaleString()}</div>
                  </div>
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-400 text-amber-400 hover:bg-amber-400/10 ml-2"
                      onClick={e => { e.stopPropagation(); markNotificationRead(notification.id); }}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}