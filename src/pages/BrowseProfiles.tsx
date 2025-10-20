import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import PhotoGallery from '@/components/PhotoGallery';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  ArrowLeft,
  Heart,
  MessageCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Star,
  Users,
  Eye,
  Sparkles,
  X,
  Phone,
  GraduationCap,
  Briefcase,
  Globe
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
  created_at: string;
}

export default function BrowseProfiles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Check if this is the "My Matches" page
  const isMyMatchesPage = location.pathname === '/my-matches';

  useEffect(() => {
    if (user) {
      fetchCurrentUserProfile();
      fetchMatches();
    }
  }, [user]);

  const fetchCurrentUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Error fetching current user profile:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('matches')
        .select(`
          *,
          user1_profile:profiles!matches_user1_fkey(*),
          user2_profile:profiles!matches_user2_fkey(*)
        `)
        .or(`user1.eq.${user?.id},user2.eq.${user?.id}`);
      
      // If this is the "My Matches" page, only show accepted matches
      if (isMyMatchesPage) {
        query = query
          .eq('status_user1', 'accepted')
          .eq('status_user2', 'accepted');
      }
      
      const { data: matchesData, error: matchesError } = await query
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      setMatches(matchesData || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load matches. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };



  const handleMessage = async (matchId: string) => {
    try {
      // Navigate to messages with the match ID
      navigate(`/messages?match=${matchId}`);
    } catch (error) {
      console.error('Error navigating to messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to open chat. Please try again.',
        variant: 'destructive',
      });
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen animated-bg honeycomb-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-amber-400/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-amber-400 rounded-full animate-spin"></div>
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Finding Profiles</h2>
            <p className="text-amber-400 text-lg">Loading potential matches...</p>
          </div>
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg honeycomb-bg">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-amber-400/20 sticky top-0 z-50">
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
                  <Heart className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="gradient-text text-2xl font-bold">
                    {isMyMatchesPage ? 'My Matches' : 'Browse Profiles'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isMyMatchesPage 
                      ? 'View your matches and their status' 
                      : 'Discover and connect with potential matches'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/30">
                {matches.length} matches
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Matches Grid */}
      <div className="container mx-auto px-4 py-6 fade-in">
        {matches.length === 0 ? (
          <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isMyMatchesPage ? 'No matches found' : 'No matches found'}
              </h3>
              <p className="text-muted-foreground">
                {isMyMatchesPage 
                  ? 'You don\'t have any matches yet. Check your pending matches on the dashboard!' 
                  : 'You don\'t have any matches yet. Check back later!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mobile-grid">
            {matches.map((match) => {
              // Determine which profile is the matched user (not the current user)
              const matchedProfile = match.user1 === user?.id ? match.user2_profile : match.user1_profile;
              const currentUserStatus = match.user1 === user?.id ? match.status_user1 : match.status_user2;
              const otherUserStatus = match.user1 === user?.id ? match.status_user2 : match.status_user1;
              const isAccepted = currentUserStatus === 'accepted' && otherUserStatus === 'accepted';
              const isPending = currentUserStatus === 'pending' && otherUserStatus === 'pending';
              const isRejected = currentUserStatus === 'rejected' || otherUserStatus === 'rejected';
              const isWaitingForOther = currentUserStatus === 'accepted' && otherUserStatus === 'pending';
              const isOtherAccepted = currentUserStatus === 'pending' && otherUserStatus === 'accepted';

              // Don't show rejected matches
              if (isRejected) return null;
              
              // For My Matches page, show accepted matches and matches waiting for other person
              if (isMyMatchesPage && !isAccepted && !isWaitingForOther && !isOtherAccepted) return null;

              return (
                <Card key={match.id} className="bg-background/80 backdrop-blur-xl border border-amber-400/20 rounded-xl hover:border-amber-400/40 transition-all duration-300 group card-hover">
                  <CardContent className="p-6">
                    {/* Profile Header */}
                    <div className="text-center mb-6">
                      <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-yellow-500 p-1 mx-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                             onClick={() => {
                               setSelectedProfile(matchedProfile);
                               setShowProfileModal(true);
                             }}>
                          <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            {(matchedProfile?.photos && matchedProfile.photos.length > 0) || matchedProfile?.photo_url ? (
                              <img
                                src={matchedProfile.photos && matchedProfile.photos.length > 0 ? matchedProfile.photos[0] : matchedProfile.photo_url}
                                alt={matchedProfile.full_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-black font-bold text-2xl ${(matchedProfile?.photos && matchedProfile.photos.length > 0) || matchedProfile?.photo_url ? 'hidden' : ''}`}>
                              {matchedProfile?.full_name?.[0] || 'U'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-1">{matchedProfile?.full_name}</h3>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-2"></div>
                      <p className="text-amber-400 text-sm font-medium">{matchedProfile?.preferences?.profession || 'Professional'}</p>
                    </div>

                    {/* Profile Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4 text-amber-400" />
                        <span>{matchedProfile?.age} years old</span>
                      </div>
                      
                      {matchedProfile?.preferences?.location && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 text-amber-400" />
                          <span>{matchedProfile.preferences.location}</span>
                        </div>
                      )}
                      
                      {matchedProfile?.preferences?.madhab && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Star className="h-4 w-4 text-amber-400" />
                          <span>{matchedProfile.preferences.madhab}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {matchedProfile?.bio && (
                      <div className="mb-6">
                        <p className="text-muted-foreground text-sm italic">"{matchedProfile.bio}"</p>
                      </div>
                    )}

                    {/* Match Status */}
                    <div className="mb-6">
                      <h4 className="text-foreground font-semibold text-sm mb-2">Match Status</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={`text-xs font-medium ${
                            isAccepted 
                              ? 'bg-green-500/20 text-green-400 border-green-400/30' 
                              : isWaitingForOther
                              ? 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                              : isOtherAccepted
                              ? 'bg-orange-500/20 text-orange-400 border-orange-400/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                          }`}
                        >
                          {isAccepted 
                            ? 'Both Accepted' 
                            : isWaitingForOther 
                            ? 'Waiting for them' 
                            : isOtherAccepted 
                            ? 'They accepted' 
                            : 'Pending'
                          }
                        </Badge>
                      </div>
                    </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {!isMyMatchesPage && isPending && (
                      <>
                        <Button
                          onClick={async () => {
                            try {
                              const updateField = match.user1 === user?.id ? 'status_user1' : 'status_user2';
                              await supabase
                                .from('matches')
                                .update({ [updateField]: 'accepted' })
                                .eq('id', match.id);
                              
                              // Check if both users have accepted
                              const newStatus = updateField === 'status_user1' ? 'accepted' : match.status_user1;
                              const otherStatus = updateField === 'status_user2' ? 'accepted' : match.status_user2;
                              
                              if (newStatus === 'accepted' && otherStatus === 'accepted') {
                                // Send email notification
                                await supabase.functions.invoke('send-match-email', {
                                  body: { matchId: match.id }
                                });
                              }
                              
                              fetchMatches(); // Refresh matches
                              toast({
                                title: "Match Accepted",
                                description: "You have accepted this match!",
                              });
                            } catch (error) {
                              console.error('Error accepting match:', error);
                              toast({
                                title: "Error",
                                description: "Failed to accept match. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-foreground font-semibold"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              const updateField = match.user1 === user?.id ? 'status_user1' : 'status_user2';
                              await supabase
                                .from('matches')
                                .update({ [updateField]: 'rejected' })
                                .eq('id', match.id);
                              
                              fetchMatches(); // Refresh matches
                              toast({
                                title: "Match Rejected",
                                description: "You have rejected this match.",
                              });
                            } catch (error) {
                              console.error('Error rejecting match:', error);
                              toast({
                                title: "Error",
                                description: "Failed to reject match. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          variant="destructive"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {isAccepted && (
                      <Button
                        onClick={() => handleMessage(match.id)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                    )}
                    
                    {(isWaitingForOther || isOtherAccepted) && (
                      <div className="flex-1 text-center">
                        <p className="text-muted-foreground text-sm">
                          {isWaitingForOther 
                            ? "Waiting for them to accept..." 
                            : "They accepted, waiting for you..."
                          }
                        </p>
                      </div>
                    )}
                    
                    {/* Debug info - remove this later */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 mt-2">
                        Debug: Current: {currentUserStatus}, Other: {otherUserStatus}, Accepted: {isAccepted.toString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/80 backdrop-blur-xl border border-amber-400/20">
          {selectedProfile && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {/* Profile Photos Gallery */}
                  {(() => {
                    const photos = selectedProfile.photos && selectedProfile.photos.length > 0 
                      ? selectedProfile.photos 
                      : selectedProfile.photo_url ? [selectedProfile.photo_url] : [];
                    
                    return photos.length > 0 ? (
                      <PhotoGallery 
                        photos={photos} 
                        className="max-w-md mx-auto"
                        showThumbnails={photos.length > 1}
                        maxThumbnails={5}
                      />
                    ) : (
                      <div className="max-w-md mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-yellow-500 p-1">
                        <div className="w-full h-64 flex items-center justify-center text-black font-bold text-4xl bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl">
                          {selectedProfile.full_name?.[0] || 'U'}
                        </div>
                      </div>
                    );
                  })()}
                  {selectedProfile.verified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-foreground mb-2">{selectedProfile.full_name}</h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-3"></div>
                <p className="text-amber-400 text-lg font-medium">{selectedProfile.preferences?.profession || 'Professional'}</p>
              </div>

              {/* Bio */}
              {selectedProfile.bio && (
                <div className="text-center">
                  <p className="text-muted-foreground text-lg italic">"{selectedProfile.bio}"</p>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="mobile-grid">
                {/* My Interests */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground uppercase tracking-wide">My Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.preferences?.interests?.map((interest: string, index: number) => (
                      <Badge
                        key={index}
                        className="bg-background text-amber-400 border border-amber-400 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </Badge>
                    ))}
                    {(!selectedProfile.preferences?.interests || selectedProfile.preferences.interests.length === 0) && (
                      <p className="text-muted-foreground text-sm">No interests listed</p>
                    )}
                  </div>
                </div>

                {/* Match Preferences */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground uppercase tracking-wide">Match Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span className="text-foreground font-medium">{selectedProfile.age} years</span>
                    </div>
                    
                    {selectedProfile.preferences?.location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-foreground font-medium">{selectedProfile.preferences.location}</span>
                      </div>
                    )}
                    
                    {selectedProfile.preferences?.madhab && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Madhhab:</span>
                        <span className="text-foreground font-medium">{selectedProfile.preferences.madhab}</span>
                      </div>
                    )}
                    
                    {selectedProfile.preferences?.prayer_frequency && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prayer:</span>
                        <span className="text-foreground font-medium">{selectedProfile.preferences.prayer_frequency}</span>
                      </div>
                    )}
                    
                    {selectedProfile.preferences?.marriage_timeline && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Marriage:</span>
                        <span className="text-foreground font-medium">{selectedProfile.preferences.marriage_timeline}</span>
                      </div>
                    )}
                    
                    {selectedProfile.preferences?.profession && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profession:</span>
                        <span className="text-foreground font-medium">{selectedProfile.preferences.profession}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground uppercase tracking-wide">Additional Details</h3>
                <div className="mobile-grid">
                  {selectedProfile.preferences?.education && (
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-muted-foreground text-sm">Education</p>
                        <p className="text-foreground font-medium">{selectedProfile.preferences.education}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProfile.preferences?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <Phone className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-muted-foreground text-sm">Phone</p>
                        <p className="text-foreground font-medium">{selectedProfile.preferences.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProfile.preferences?.will_relocate !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <Globe className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-muted-foreground text-sm">Willing to Relocate</p>
                        <p className="text-foreground font-medium">{selectedProfile.preferences.will_relocate ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-muted-foreground text-sm">Member Since</p>
                      <p className="text-foreground font-medium">
                        {new Date(selectedProfile.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-700">
                <Button
                  onClick={() => handleMessage(selectedProfile.id)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold py-3"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 