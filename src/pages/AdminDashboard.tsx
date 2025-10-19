import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { 
  Users, 
  UserCheck, 
  Heart, 
  BarChart3, 
  Settings, 
  Shield, 
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  Search,
  User,
  Key,
  Plus,
  Copy,
  LogOut,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProfileCard } from '@/components/ProfileCard';
import { useForm } from 'react-hook-form';

type Profile = Tables<'profiles'> & {
  user?: {
    email: string;
  };
};

type Match = Tables<'matches'> & {
  user1?: Profile;
  user2?: Profile;
};

type PendingMatch = Tables<'pending_matches'> & {
  user1?: Profile;
  user2?: Profile;
};

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalMatches: number;
  successfulMatches: number;
  activeUsers: number;
}

// Admin Edit Modal form values type
interface AdminProfileFormValues {
  full_name: string;
  age: number;
  gender: string;
  profession: string;
  education: string;
  phone: string;
  bio: string;
  interests: string[];
  location: string;
  will_relocate: boolean;
  madhab: string;
  prayer_frequency: string;
  marriage_timeline: string;
  photo_url: string;
}

// Add invite code type
type InviteCode = {
  id: string;
  code: string;
  created_by: string | null;
  used_by: string | null;
  is_used: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  used_at: string | null;
};

// Move the admin edit form to a separate component
function AdminEditProfileForm({ editProfile, saveProfile, handleAdminPhotoUpload, adminUploading }: any) {
  const preferences = (editProfile.preferences as any) || {};
  const [interestInput, setInterestInput] = useState('');
  const form = useForm({
    defaultValues: {
      full_name: editProfile.full_name || '',
      age: editProfile.age || undefined,
      gender: editProfile.gender || '',
      profession: preferences.profession || '',
      education: preferences.education || '',
      phone: preferences.phone || '',
      bio: editProfile.bio || '',
      interests: preferences.interests || [],
      location: preferences.location || '',
      will_relocate: preferences.will_relocate || false,
      madhab: preferences.madhab || '',
      prayer_frequency: preferences.prayer_frequency || '',
      marriage_timeline: preferences.marriage_timeline || '',
      photo_url: editProfile.photo_url || '',
    }
  });
  const interests = form.watch('interests');
  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  // Get current admin user id (replace with your auth/session logic)
  const currentAdminId = localStorage.getItem('user_id') || '';
  return (
    <form
      onSubmit={form.handleSubmit(async (values: any) => {
        const preferencesObj = {
          profession: values.profession,
          education: values.education,
          phone: values.phone,
          interests: values.interests,
          location: values.location,
          will_relocate: values.will_relocate,
          madhab: values.madhab,
          prayer_frequency: values.prayer_frequency,
          marriage_timeline: values.marriage_timeline,
          tagline: values.bio,
        };
        await saveProfile({
          ...editProfile,
          full_name: values.full_name,
          age: values.age,
          gender: values.gender.toLowerCase(),
          bio: values.bio,
          photo_url: values.photo_url,
          preferences: preferencesObj,
        });
      })}
      className="space-y-6"
    >
      {/* Details Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input {...form.register('full_name')} placeholder="Full Name" className="bg-background/50 border-amber-400/20 text-foreground" />
          <Input 
            type="number" 
            min={18} 
            max={100}
            {...form.register('age', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? undefined : Number(value)
            })} 
            placeholder="Age" 
            className="bg-background/50 border-amber-400/20 text-foreground" 
          />
          <select {...form.register('gender')} className="bg-background/50 border border-amber-400/20 text-foreground rounded px-3 py-2 focus:border-amber-400">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <Input {...form.register('profession')} placeholder="Profession" className="bg-background/50 border-amber-400/20 text-foreground" />
          <Input {...form.register('education')} placeholder="Education" className="bg-background/50 border-amber-400/20 text-foreground" />
          <Input {...form.register('phone')} placeholder="Phone" className="bg-background/50 border-amber-400/20 text-foreground" />
          <Input {...form.register('bio')} placeholder="Tagline / Bio" className="bg-background/50 border-amber-400/20 text-foreground" />
          {/* Interests */}
          <div>
            <label className="text-muted-foreground flex items-center gap-2 mb-1">Interests</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests && interests.map((tag: string, idx: number) => (
                <span key={idx} className="bg-amber-400/20 text-amber-400 px-2 py-1 rounded-full flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => form.setValue('interests', interests.filter((_: any, i: number) => i !== idx))} className="ml-1 text-xs">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && interestInput.trim()) {
                    e.preventDefault();
                    if (!interests.includes(interestInput.trim())) {
                      form.setValue('interests', [...interests, interestInput.trim()]);
                    }
                    setInterestInput("");
                  }
                }}
                placeholder="Add interest and press Enter"
                className="bg-background/50 border-amber-400/20 text-foreground"
              />
              <Button type="button" onClick={() => {
                if (interestInput.trim() && !interests.includes(interestInput.trim())) {
                  form.setValue('interests', [...interests, interestInput.trim()]);
                  setInterestInput("");
                }
              }} className="btn-primary">Add</Button>
            </div>
          </div>
        </div>
      </div>
      {/* Location Section */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-amber-400 mb-2">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...form.register('location')} placeholder="Location (City, Country)" className="bg-background/50 border-amber-400/20 text-foreground" />
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" {...form.register('will_relocate')} className="h-5 w-5 accent-amber-400" />
            <label className="text-muted-foreground">Willing to Relocate?</label>
          </div>
        </div>
      </div>
      {/* Religion Section */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-amber-400 mb-2">Religion</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input {...form.register('madhab')} placeholder="Madhab" className="bg-background/50 border-amber-400/20 text-foreground" />
          <Input {...form.register('prayer_frequency')} placeholder="Prayer Frequency" className="bg-background/50 border-amber-400/20 text-foreground" />
          <Input {...form.register('marriage_timeline')} placeholder="Marriage Timeline" className="bg-background/50 border-amber-400/20 text-foreground" />
        </div>
      </div>
      {/* Photo Upload */}
      <div>
        <label className="text-muted-foreground flex items-center gap-2 mb-1">Profile Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAdminPhotoUpload}
          disabled={adminUploading}
          className="bg-background/50 border-amber-400/20 text-foreground placeholder:text-muted-foreground focus:border-amber-400 focus:ring-amber-400/20"
        />
        {form.watch('photo_url') && (
          <div className="mt-2">
            <img 
              src={form.watch('photo_url')} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-2 border-amber-400/20 cursor-pointer hover:scale-105 transition-transform duration-200" 
              onClick={() => {
                // Create a modal to show the image in full size
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
                modal.onclick = () => modal.remove();
                
                const content = document.createElement('div');
                content.className = 'relative max-w-2xl w-full mx-2 sm:mx-4 rounded-3xl bg-gradient-to-br from-background/95 to-card/95 border-4 border-amber-400/60 shadow-2xl p-6 sm:p-8';
                content.onclick = e => e.stopPropagation();
                
                const closeBtn = document.createElement('button');
                closeBtn.className = 'absolute top-4 right-4 text-amber-400 hover:text-foreground bg-background/30 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all duration-300';
                closeBtn.innerHTML = '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
                closeBtn.onclick = () => modal.remove();
                
                const img = document.createElement('img');
                img.src = form.watch('photo_url');
                img.alt = 'Profile Photo';
                img.className = 'w-full h-auto max-h-96 object-cover rounded-xl';
                
                const title = document.createElement('h3');
                title.className = 'text-2xl font-bold text-foreground mb-2 mt-4 text-center';
                title.textContent = 'Profile Photo';
                
                content.appendChild(closeBtn);
                content.appendChild(img);
                content.appendChild(title);
                modal.appendChild(content);
                document.body.appendChild(modal);
              }}
            />
          </div>
        )}
      </div>
      {/* Password Reset Section */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-amber-400 mb-2">Set/Reset Password</h3>
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="bg-background/50 border-amber-400/20 text-foreground"
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="bg-background/50 border-amber-400/20 text-foreground mt-2"
        />
        {passwordError && <div className="text-red-500">{passwordError}</div>}
        {passwordSuccess && <div className="text-green-500">{passwordSuccess}</div>}
        <Button
          className="mt-2"
          type="button"
          onClick={async () => {
            setPasswordError('');
            setPasswordSuccess('');
            if (newPassword !== confirmPassword) {
              setPasswordError('Passwords do not match');
              return;
            }
            if (!newPassword) {
              setPasswordError('Password cannot be empty');
              return;
            }
            // Call the Edge Function
            const res = await fetch('https://agavrllcbxlqyeifyuht.functions.supabase.co/set-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                targetUserId: editProfile.id,
                newPassword,
                adminUserId: currentAdminId
              }),
            });
            const result = await res.json();
            if (result.error) setPasswordError(result.error);
            else setPasswordSuccess('Password updated!');
          }}
        >
          Set Password
        </Button>
      </div>
      <DialogFooter>
        <Button type="submit" className="btn-primary">Save</Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminDashboard() {
  const { user, session, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    totalMatches: 0,
    successfulMatches: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchUser1, setMatchUser1] = useState<string>('');
  const [matchUser2, setMatchUser2] = useState<string>('');
  const [matchWith, setMatchWith] = useState<{ [userId: string]: string }>({});
  const [adminUploading, setAdminUploading] = useState(false);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatMatch, setActiveChatMatch] = useState<Match | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState('');
  const [inviteCodeQuantity, setInviteCodeQuantity] = useState(1);
  const [inviteCodeExpiry, setInviteCodeExpiry] = useState('1');

  // Admin check is now handled by AdminRoute component in App.tsx
  // No need to check admin status here

  useEffect(() => {
    if (user) {
      fetchData();
      fetchActivityFeed();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!user1(*),
          user2:profiles!user2(*)
        `)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      // Fetch pending matches
      const { data: pendingMatchesData, error: pendingMatchesError } = await supabase
        .from('pending_matches')
        .select(`
          *,
          user1:profiles!user1(*),
          user2:profiles!user2(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingMatchesError) throw pendingMatchesError;

      setProfiles(profilesData || []);
      setMatches(matchesData || []);
      setPendingMatches(pendingMatchesData || []);

      // Calculate stats
      const totalUsers = profilesData?.length || 0;
      const verifiedUsers = profilesData?.filter(p => p.verified).length || 0;
      const pendingVerifications = profilesData?.filter(p => !p.verified).length || 0;
      const totalMatches = matchesData?.length || 0;
      const successfulMatches = matchesData?.filter(m => m.status_user1 === 'accepted' && m.status_user2 === 'accepted').length || 0;
      const activeUsers = profilesData?.filter(p => {
        const lastActive = new Date(p.updated_at || p.created_at || '');
        const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActive <= 30;
      }).length || 0;

      setStats({
        totalUsers,
        verifiedUsers,
        pendingVerifications,
        totalMatches,
        successfulMatches,
        activeUsers
      });

      await fetchInviteCodes();

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: true, verification_status: 'verified' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile verified successfully",
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error verifying profile:', error);
      toast({
        title: "Error",
        description: "Failed to verify profile",
        variant: "destructive"
      });
    }
  };

  const rejectProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: false, verification_status: 'rejected' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile rejected",
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting profile:', error);
      toast({
        title: "Error",
        description: "Failed to reject profile",
        variant: "destructive"
      });
    }
  };

  // Removed approveMatch function to enforce two-step matching process
  // Users must accept/reject matches themselves

  const deleteProfile = async (profileId: string) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profileId);
      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }
      toast({ title: 'Deleted', description: 'Profile deleted.' });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      const errorMessage = error?.message || error?.details || 'Unknown error occurred';
      toast({ 
        title: 'Error', 
        description: `Failed to delete profile: ${errorMessage}`, 
        variant: 'destructive' 
      });
    }
  };

  const saveProfile = async (profile: Profile) => {
    try {
      const { error } = await supabase.from('profiles').update(profile).eq('id', profile.id);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Profile updated.' });
      setShowEditModal(false);
      setEditProfile(null);
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  };

  const markProfileDone = async (profileId: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ verified: true }).eq('id', profileId);
      if (error) throw error;
      toast({ title: 'Marked as Done', description: 'Profile marked as done.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark as done.', variant: 'destructive' });
    }
  };

  const runMatchmaker = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/matchmaker`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to run matchmaker');
      }

      const result = await response.json();
      toast({ 
        title: 'Matchmaker Complete', 
        description: `Created ${result.new_matches_created} new matches with AI compatibility scoring.` 
      });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to run matchmaker.', variant: 'destructive' });
    }
  };

  const createMatch = async () => {
    if (!matchUser1 || !matchUser2 || matchUser1 === matchUser2) {
      toast({ title: 'Error', description: 'Select two different users.', variant: 'destructive' });
      return;
    }
    try {
      // Sort user IDs to satisfy user1 < user2 constraint
      const [user1, user2] = [matchUser1, matchUser2].sort();
      
      // Insert match with created_by field
      const { data: matchData, error } = await supabase.from('matches').insert({ 
        user1, 
        user2, 
        status_user1: 'pending', 
        status_user2: 'pending',
        created_by: user?.id // Set the admin who created the match
      }).select().single();
      if (error) throw error;
      // Get user names
      const user1Profile = profiles.find(p => p.id === matchUser1);
      const user2Profile = profiles.find(p => p.id === matchUser2);
      // Insert notifications for both users
      await supabase.from('notifications').insert([
        {
          user_id: matchUser1,
          title: 'New Match!',
          message: `You have a new match with ${user2Profile?.full_name || 'a user'}`,
          type: 'match',
          read: false,
          payload: { match_id: matchData.id, other_user_id: matchUser2 },
        },
        {
          user_id: matchUser2,
          title: 'New Match!',
          message: `You have a new match with ${user1Profile?.full_name || 'a user'}`,
          type: 'match',
          read: false,
          payload: { match_id: matchData.id, other_user_id: matchUser1 },
        }
      ]);
      // Call Supabase Edge Function to send email notifications
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-match-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: matchData.id,
          user1_id: matchUser1,
          user2_id: matchUser2,
        }),
      });
      toast({ title: 'Match Created', description: 'A new match and notifications have been created.' });
      setShowMatchModal(false);
      setMatchUser1('');
      setMatchUser2('');
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create match.', variant: 'destructive' });
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      const { error } = await supabase.from('matches').delete().eq('id', matchId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Match deleted.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete match.', variant: 'destructive' });
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Filter only pending profiles for the Profile Verification tab
  const pendingProfiles = profiles.filter(
    (p) => !p.verified || p.verification_status === 'pending'
  );

  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editProfile) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setAdminUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${editProfile.id}/${fileName}`;
      
      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Save the new photo_url to the profile in Supabase
      await saveProfile({ ...editProfile, photo_url: data.publicUrl });
      setEditProfile({ ...editProfile, photo_url: data.publicUrl });
      
      toast({
        title: "Photo uploaded successfully",
        description: "Profile photo has been updated",
      });
      
    } catch (error) {
      console.error('Admin photo upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAdminUploading(false);
    }
  };

  // Fetch activity feed
  const fetchActivityFeed = async () => {
    // Get recent profiles, matches, and verifications
    const [{ data: profiles }, { data: matches }] = await Promise.all([
      supabase.from('profiles').select('*').order('updated_at', { ascending: false }).limit(10),
      supabase.from('matches').select('*, user1:profiles!user1(*), user2:profiles!user2(*)').order('created_at', { ascending: false }).limit(10),
    ]);
    const events: any[] = [];
    (profiles || []).forEach((p: any) => {
      if (p.created_at === p.updated_at) {
        events.push({
          type: 'profile_created',
          user: p,
          time: p.created_at,
        });
      } else if (p.verified) {
        events.push({
          type: 'profile_verified',
          user: p,
          time: p.updated_at,
        });
      } else if (p.verification_status === 'rejected') {
        events.push({
          type: 'profile_rejected',
          user: p,
          time: p.updated_at,
        });
      }
    });
    (matches || []).forEach((m: any) => {
      events.push({
        type: 'match_created',
        match: m,
        time: m.created_at,
      });
      if (m.status_user1 === 'accepted' && m.status_user2 === 'accepted') {
        events.push({
          type: 'match_accepted',
          match: m,
          time: m.updated_at,
        });
      }
    });
    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setActivityFeed(events.slice(0, 10));
  };

  // Chat modal logic
  const openChatModal = async (match: Match) => {
    setActiveChatMatch(match);
    setShowChatModal(true);
    setChatLoading(true);
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: true });
    setChatMessages(messages || []);
    setChatLoading(false);
  };

  const sendChatMessage = async () => {
    if (!activeChatMatch || !chatInput.trim()) return;
    setChatLoading(true);
    
    try {
      // Send admin message to the match
      const { error } = await supabase.from('messages').insert({
        match_id: activeChatMatch.id,
        sender_id: user.id,
        content: chatInput.trim(),
        is_admin_message: true,
      });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      } else {
        // Clear input
        setChatInput('');
        
        // Refresh messages
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', activeChatMatch.id)
          .order('created_at', { ascending: true });
        setChatMessages(messages || []);
        
        toast({
          title: "Message Sent",
          description: "Your message has been sent to both users in the match",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  };

  // Fetch invite codes
  const fetchInviteCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invite codes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch invite codes",
          variant: "destructive",
        });
      } else {
        setInviteCodes(data || []);
      }
    } catch (error) {
      console.error('Error fetching invite codes:', error);
    }
  };

  // Approve pending match
  const approvePendingMatch = async (pendingMatchId: string) => {
    try {
      const pendingMatch = pendingMatches.find(pm => pm.id === pendingMatchId);
      if (!pendingMatch) return;

      // Create actual match
      const { error: matchError } = await supabase
        .from('matches')
        .insert({
          user1: pendingMatch.user1,
          user2: pendingMatch.user2,
          created_by: pendingMatch.created_by,
          status_user1: 'pending',
          status_user2: 'pending',
          compatibility_score: pendingMatch.compatibility_score,
          ai_reasoning: pendingMatch.ai_reasoning
        });

      if (matchError) throw matchError;

      // Update pending match status
      const { error: updateError } = await supabase
        .from('pending_matches')
        .update({ 
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', pendingMatchId);

      if (updateError) throw updateError;

      toast({
        title: "Match Approved",
        description: "The AI-suggested match has been approved and created",
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving pending match:', error);
      toast({
        title: "Error",
        description: "Failed to approve match",
        variant: "destructive"
      });
    }
  };

  // Reject pending match
  const rejectPendingMatch = async (pendingMatchId: string) => {
    try {
      const { error } = await supabase
        .from('pending_matches')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', pendingMatchId);

      if (error) throw error;

      toast({
        title: "Match Rejected",
        description: "The AI-suggested match has been rejected",
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting pending match:', error);
      toast({
        title: "Error",
        description: "Failed to reject match",
        variant: "destructive"
      });
    }
  };

  // Generate new invite codes
  const generateInviteCodes = async () => {
    try {
      const codes = [];
      for (let i = 0; i < inviteCodeQuantity; i++) {
        // Generate a random 8-character code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
      }

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(inviteCodeExpiry));

      const { error } = await supabase
        .from('invite_codes')
        .insert(
          codes.map(code => ({
            code,
            created_by: user?.id,
            expires_at: expiryDate.toISOString(),
            is_active: true
          }))
        );

      if (error) {
        console.error('Error creating invite codes:', error);
        toast({
          title: "Error",
          description: "Failed to create invite codes",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Created ${inviteCodeQuantity} invite code(s)`,
        });
        setShowInviteCodeModal(false);
        setNewInviteCode('');
        setInviteCodeQuantity(1);
        setInviteCodeExpiry('1');
        fetchInviteCodes();
      }
    } catch (error) {
      console.error('Error generating invite codes:', error);
    }
  };

  // Toggle invite code status
  const toggleInviteCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) {
        console.error('Error updating invite code:', error);
        toast({
          title: "Error",
          description: "Failed to update invite code",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Invite code status updated",
        });
        fetchInviteCodes();
      }
    } catch (error) {
      console.error('Error updating invite code:', error);
    }
  };

  // Copy invite code to clipboard
  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying invite code:', error);
    }
  };

  // Delete invite code
  const deleteInviteCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .delete()
        .eq('id', codeId);

      if (error) {
        console.error('Error deleting invite code:', error);
        toast({
          title: "Error",
          description: "Failed to delete invite code",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Invite code deleted",
        });
        fetchInviteCodes();
      }
    } catch (error) {
      console.error('Error deleting invite code:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-bg honeycomb-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto"></div>
          <p className="mt-4 text-amber-400 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-xl border-b border-amber-400/30 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="h-8 w-8 text-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-foreground flex items-center justify-center">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base mt-1">Manage users, verify profiles, and monitor matches</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Badge variant="outline" className="border-green-400/30 text-green-400 bg-green-400/10 text-sm font-medium px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Admin Access
              </Badge>
              <Button
                onClick={runMatchmaker}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Activity className="h-4 w-4 mr-2" />
                AI Matchmaker
              </Button>
              <Button
                onClick={() => setShowMatchModal(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Heart className="h-4 w-4 mr-2" />
                Create Match
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await signOut();
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                  window.location.href = '/';
                }}
                className="border-red-400/30 text-red-400 hover:bg-red-400/10 px-6 py-2 rounded-xl transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-400/20 hover:border-green-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Verified Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.verifiedUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingVerifications}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">Total Matches</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalMatches}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-400/20 hover:border-pink-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-400 text-sm font-medium">Successful</p>
                  <p className="text-2xl font-bold text-foreground">{stats.successfulMatches}</p>
                </div>
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-background/50 border-amber-400/20 text-foreground placeholder:text-muted-foreground focus:border-amber-400 focus:ring-amber-400/20 rounded-xl pl-12 pr-4 py-3 w-full shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {/* Profile Management Table */}
        <Card className="bg-background/50 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-t-2xl">
            <CardTitle className="text-foreground text-base sm:text-xl font-bold">All User Profiles</CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-base">
              View, edit, delete, mark as done, or match any profile
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px] text-sm">
                <TableHeader>
                  <TableRow className="border-amber-400/20 bg-gradient-to-r from-background/60 to-card/60">
                    <TableHead className="text-amber-400 font-bold text-base py-6 px-4">User Profile</TableHead>
                    <TableHead className="text-amber-400 font-bold text-base py-6 px-4">Professional Info</TableHead>
                    <TableHead className="text-amber-400 font-bold text-base py-6 px-4">Location & Preferences</TableHead>
                    <TableHead className="text-amber-400 font-bold text-base py-6 px-4">Religious Info</TableHead>
                    <TableHead className="text-amber-400 font-bold text-base py-6 px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile, idx) => {
                    const preferences = (profile.preferences as any) || {};
                    const profession = preferences.profession || '-';
                    const education = preferences.education || '-';
                    const phone = preferences.phone || '-';
                    const interests = Array.isArray(preferences.interests) ? preferences.interests.join(', ') : '-';
                    const location = preferences.location || '-';
                    const will_relocate = preferences.will_relocate ? 'Yes' : 'No';
                    const madhab = preferences.madhab || '-';
                    const prayer_frequency = preferences.prayer_frequency || '-';
                    const marriage_timeline = preferences.marriage_timeline || '-';
                    const tagline = preferences.tagline || profile.bio || '-';
                    // Exclude self and already matched users from dropdown
                    const availableMatchOptions = profiles.filter(
                      p => p.id !== profile.id &&
                        !matches.some(m => (m.user1?.id === profile.id && m.user2?.id === p.id) || (m.user2?.id === profile.id && m.user1?.id === p.id))
                    );
                    return (
                      <TableRow key={profile.id} className={`border-amber-400/10 ${idx % 2 === 0 ? 'bg-background/30' : 'bg-card/30'} hover:bg-amber-400/5 transition-all duration-300`}>
                        {/* User Profile */}
                        <TableCell className="py-6 px-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 ring-2 ring-amber-400/50 shadow-lg">
                              <AvatarImage src={profile.photo_url} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-400 text-foreground font-bold text-lg">
                                {profile.full_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-bold text-foreground text-lg mb-1">{profile.full_name}</div>
                              <div className="text-sm text-muted-foreground mb-1">{profile.gender}, {profile.age} years</div>
                              <div className="text-sm text-muted-foreground mb-2">{profile.email}</div>
                              <div className="flex gap-2">
                                {profile.verified ? (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">✓ Verified</Badge>
                                ) : (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">⏳ Pending</Badge>
                                )}
                                {profile.bio && (
                                  <Badge variant="outline" className="border-amber-400/30 text-amber-400">Has Bio</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Professional Info */}
                        <TableCell className="py-6 px-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Profession</span>
                              <div className="text-foreground font-medium">{profession}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Education</span>
                              <div className="text-foreground">{education}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Phone</span>
                              <div className="text-foreground">{phone}</div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Location & Preferences */}
                        <TableCell className="py-6 px-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Location</span>
                              <div className="text-foreground font-medium">{location}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Willing to Relocate</span>
                              <div className="text-foreground">{will_relocate}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Interests</span>
                              <div className="text-foreground text-sm">{interests}</div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Religious Info */}
                        <TableCell className="py-6 px-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Madhab</span>
                              <div className="text-foreground font-medium">{madhab}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Prayer Frequency</span>
                              <div className="text-foreground">{prayer_frequency}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Marriage Timeline</span>
                              <div className="text-foreground">{marriage_timeline}</div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-6 px-4">
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-foreground font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 rounded-lg shadow-lg" 
                                onClick={() => { setEditProfile(profile); setShowEditModal(true); }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-red-600 text-foreground font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 rounded-lg shadow-lg" 
                                onClick={() => deleteProfile(profile.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <select
                                value={matchWith[profile.id] || ''}
                                onChange={e => setMatchWith(prev => ({ ...prev, [profile.id]: e.target.value }))}
                                className="w-full bg-background/50 border border-amber-400/20 text-foreground rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-amber-400/20"
                              >
                                <option value="">Match with...</option>
                                {availableMatchOptions.map(opt => (
                                  <option key={opt.id} value={opt.id}>{opt.full_name}</option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-foreground font-semibold hover:from-amber-500 hover:to-yellow-500 transition-all duration-200 rounded-lg shadow-lg"
                                disabled={!matchWith[profile.id]}
                                onClick={async () => {
                                  const otherId = matchWith[profile.id];
                                  if (!otherId || otherId === profile.id) return;
                                  if (matches.some(m => (m.user1?.id === profile.id && m.user2?.id === otherId) || (m.user2?.id === profile.id && m.user1?.id === otherId))) {
                                    toast({ title: 'Already matched', description: 'These users are already matched.', variant: 'destructive' });
                                    return;
                                  }
                                  try {
                                    // Sort user IDs to satisfy user1 < user2 constraint
                                    const [user1, user2] = [profile.id, otherId].sort();
                                    
                                    const { error } = await supabase.from('matches').insert({ 
                                      user1, 
                                      user2, 
                                      status_user1: 'pending', 
                                      status_user2: 'pending',
                                      created_by: user?.id
                                    });
                                    if (error) throw error;
                                    
                                    // Create notifications for both users
                                    const otherProfile = profiles.find(p => p.id === otherId);
                                    const notificationPromises = [
                                      supabase.from('notifications').insert({
                                        user_id: profile.id,
                                        type: 'new_match',
                                        title: 'New Match Available!',
                                        message: `You have a new match with ${otherProfile?.full_name}. Please review and respond.`,
                                        payload: { match_id: `${profile.id}-${otherId}` }
                                      }),
                                      supabase.from('notifications').insert({
                                        user_id: otherId,
                                        type: 'new_match',
                                        title: 'New Match Available!',
                                        message: `You have a new match with ${profile.full_name}. Please review and respond.`,
                                        payload: { match_id: `${profile.id}-${otherId}` }
                                      })
                                    ];

                                    await Promise.all(notificationPromises);
                                    
                                    toast({ title: 'Match Created', description: 'A new match has been created. Both users have been notified.' });
                                    setMatchWith(prev => ({ ...prev, [profile.id]: '' }));
                                    fetchData();
                                  } catch (err) {
                                    toast({ title: 'Error', description: 'Failed to create match.', variant: 'destructive' });
                                  }
                                }}
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                Create Match
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profiles" className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 bg-background/50 border border-amber-400/20 rounded-2xl p-2 text-sm font-medium">
            <TabsTrigger 
              value="profiles" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 rounded-xl transition-all duration-300 py-3"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Profile Verification
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 rounded-xl transition-all duration-300 py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Match Management
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 rounded-xl transition-all duration-300 py-3"
            >
              <Clock className="h-4 w-4 mr-2" />
              AI Matches ({pendingMatches.length})
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 rounded-xl transition-all duration-300 py-3"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Profile Verification Tab */}
          <TabsContent value="profiles" className="space-y-6">
            <Card className="bg-gradient-to-br from-background/80 to-card/80 border border-amber-400/20 rounded-3xl shadow-2xl backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-r from-amber-400/10 via-yellow-400/10 to-amber-400/10 rounded-t-3xl border-b border-amber-400/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground text-xl font-bold flex items-center">
                      <UserCheck className="h-6 w-6 mr-3 text-amber-400" />
                      Profile Verification Queue
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm mt-2">
                      Review and verify user profiles for platform access
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/30 px-3 py-1">
                    {profiles.filter(p => !p.verified).length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[700px] text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow className="border-amber-400/20 bg-background/30">
                        <TableHead className="text-muted-foreground font-semibold">User</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Details</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Location</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Religion</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProfiles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                            <div className="flex flex-col items-center space-y-2">
                              <CheckCircle className="h-12 w-12 text-amber-400/50" />
                              <p className="text-lg">No pending profiles for verification.</p>
                              <p className="text-sm">All profiles have been reviewed!</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {pendingProfiles.map((profile, idx) => {
                        const preferences = (profile.preferences as any) || {};
                        const profession = preferences.profession || '-';
                        const education = preferences.education || '-';
                        const location = preferences.location || '-';
                        const will_relocate = preferences.will_relocate ? 'Will relocate' : '';
                        const madhab = preferences.madhab || '-';
                        const prayer_frequency = preferences.prayer_frequency || '-';
                        const phone = preferences.phone || '-';
                        const tagline = preferences.tagline || '-';
                        const isVerified = !!profile.verified;
                        return (
                          <TableRow key={profile.id} className={`border-amber-400/10 ${idx % 2 === 0 ? 'bg-background/40' : 'bg-background/60'} hover:bg-amber-950/30 transition-all duration-200`}> 
                            {/* User */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 ring-2 ring-amber-400/30">
                                  <AvatarImage src={profile.photo_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-400 text-foreground font-bold">
                                    {profile.full_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-bold text-foreground">{profile.full_name}</div>
                                  <div className="text-xs text-muted-foreground">{profile.gender}, {profile.age} years</div>
                                  <div className="text-xs text-muted-foreground">{profile.email}</div>
                                  <div className="text-xs text-muted-foreground">{phone}</div>
                                  <div className="text-xs text-amber-400">{tagline}</div>
                                </div>
                              </div>
                            </TableCell>
                            {/* Details */}
                            <TableCell>
                              <div className="text-foreground text-sm font-medium">{profession}</div>
                              <div className="text-xs text-muted-foreground">{education}</div>
                            </TableCell>
                            {/* Location */}
                            <TableCell>
                              <div className="text-foreground text-sm">{location}</div>
                              <div className="text-xs text-muted-foreground">{will_relocate}</div>
                            </TableCell>
                            {/* Religion */}
                            <TableCell>
                              <div className="text-foreground text-sm">{madhab}</div>
                              <div className="text-xs text-muted-foreground">{prayer_frequency}</div>
                            </TableCell>
                            {/* Status */}
                            <TableCell>
                              {isVerified ? (
                                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-foreground border-green-400/30 rounded-full px-3 py-1 font-semibold text-sm shadow-lg">Verified</Badge>
                              ) : (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-foreground border-yellow-400/30 rounded-full px-3 py-1 font-semibold text-sm shadow-lg">Pending</Badge>
                              )}
                            </TableCell>
                            {/* Actions */}
                            <TableCell>
                              <div className="flex gap-2">
                                {!isVerified ? (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-foreground font-bold py-2 rounded-lg shadow-lg transition-all duration-200 text-sm" 
                                    onClick={() => verifyProfile(profile.id)}
                                  >
                                    ✅ Approve
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-muted to-muted-foreground/50 text-foreground font-bold py-2 rounded-lg shadow-lg transition-all duration-200 text-sm" 
                                    disabled
                                  >
                                    ✅ Approved
                                  </Button>
                                )}
                                {!isVerified ? (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-foreground font-bold py-2 rounded-lg shadow-lg transition-all duration-200 text-sm" 
                                    onClick={() => rejectProfile(profile.id)}
                                  >
                                    ❌ Reject
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-foreground font-bold py-2 rounded-lg shadow-lg transition-all duration-200 text-sm" 
                                    onClick={() => rejectProfile(profile.id)}
                                  >
                                    🔄 Revoke
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-foreground font-bold py-2 rounded-lg shadow-lg transition-all duration-200 text-sm" 
                                  onClick={() => { setEditProfile(profile); setShowEditModal(true); }}
                                >
                                  ✏️ Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Match Management Tab */}
          <TabsContent value="matches" className="space-y-4 sm:space-y-6">
            <Card className="bg-background/50 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-t-2xl">
                <CardTitle className="text-foreground text-base sm:text-xl font-bold">Match Management</CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-base">
                  View and manage user matches
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[500px] text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow className="border-amber-400/20 bg-background/30">
                        <TableHead className="text-muted-foreground font-semibold">Users</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Created</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((match, idx) => (
                        <TableRow key={match.id} className={`border-amber-400/10 ${idx % 2 === 0 ? 'bg-background/40' : 'bg-background/60'} hover:bg-amber-950/30 transition-all duration-200`}>
                          <TableCell>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8 ring-2 ring-amber-400/30">
                                  <AvatarImage src={match.user1?.photo_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-400 text-foreground text-xs font-bold">
                                    {match.user1?.full_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-foreground text-sm font-medium">
                                  {match.user1?.full_name}
                                </span>
                              </div>
                              <Heart className="h-4 w-4 text-amber-400" />
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8 ring-2 ring-amber-400/30">
                                  <AvatarImage src={match.user2?.photo_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-400 text-foreground text-xs font-bold">
                                    {match.user2?.full_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-foreground text-sm font-medium">
                                  {match.user2?.full_name}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                match.status_user1 === 'accepted' && match.status_user2 === 'accepted'
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-foreground border-green-400/30" 
                                  : match.status_user1 === 'rejected' || match.status_user2 === 'rejected'
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-foreground border-red-400/30"
                                  : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-foreground border-yellow-400/30"
                              }
                            >
                              {match.status_user1 === 'accepted' && match.status_user2 === 'accepted' ? "Accepted" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(match.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Badge
                                className={`text-xs font-medium ${
                                  match.status_user1 === 'accepted' && match.status_user2 === 'accepted'
                                    ? 'bg-green-500/20 text-green-400 border-green-400/30'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                                }`}
                              >
                                {match.status_user1 === 'accepted' && match.status_user2 === 'accepted' ? 'Both Accepted' : 'Pending Response'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 rounded-lg shadow-lg transition-all duration-200"
                                onClick={() => openChatModal(match)}
                              >
                                💬 Message
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-400/30 text-red-400 hover:bg-red-400/10 rounded-lg shadow-lg transition-all duration-200"
                                onClick={() => deleteMatch(match.id)}
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card className="honeycomb-card bg-gradient-to-br from-background/50 to-background/30 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
              <Card className="honeycomb-card bg-gradient-to-br from-background/50 to-background/30 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.verifiedUsers}</div>
                  <p className="text-xs text-muted-foreground">Profiles verified</p>
                </CardContent>
              </Card>
              <Card className="honeycomb-card bg-gradient-to-br from-background/50 to-background/30 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
                  <Activity className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.pendingVerifications}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
              <Card className="honeycomb-card bg-gradient-to-br from-background/50 to-background/30 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
                  <Heart className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">Matches created</p>
                </CardContent>
              </Card>
              <Card className="honeycomb-card bg-gradient-to-br from-background/50 to-background/30 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Successful Matches</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.successfulMatches}</div>
                  <p className="text-xs text-muted-foreground">Mutual acceptance</p>
                </CardContent>
              </Card>
              <Card className="honeycomb-card bg-gradient-to-br from-background/50 to-background/30 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                  <User className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-background/50 border-amber-400/20 rounded-2xl shadow-2xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-t-2xl">
                <CardTitle className="text-foreground text-xl font-bold">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Latest user activities and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityFeed.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-2 rounded-lg bg-background/60 border-l-4" style={{ borderColor: event.type === 'profile_verified' ? '#22c55e' : event.type === 'profile_rejected' ? '#f59e42' : event.type === 'match_created' ? '#fbbf24' : '#818cf8' }}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={event.user?.photo_url || event.match?.user1?.photo_url || event.match?.user2?.photo_url} />
                        <AvatarFallback className="bg-amber-400/20 text-amber-400">
                          {event.user?.full_name?.[0] || event.match?.user1?.full_name?.[0] || event.match?.user2?.full_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">
                          {event.type === 'profile_created' && `${event.user.full_name} joined`}
                          {event.type === 'profile_verified' && `${event.user.full_name} was verified`}
                          {event.type === 'profile_rejected' && `${event.user.full_name}'s profile was rejected`}
                          {event.type === 'match_created' && `New match: ${event.match.user1.full_name} & ${event.match.user2.full_name}`}
                          {event.type === 'match_accepted' && `Match accepted: ${event.match.user1.full_name} & ${event.match.user2.full_name}`}
                        </div>
                        <div className="text-xs text-muted-foreground">{new Date(event.time).toLocaleString()}</div>
                      </div>
                      <div>
                        {event.type === 'profile_verified' && <CheckCircle className="text-green-400" />}
                        {event.type === 'profile_rejected' && <XCircle className="text-orange-400" />}
                        {event.type === 'match_created' && <Heart className="text-amber-400" />}
                        {event.type === 'match_accepted' && <Heart className="text-pink-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Matches Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="bg-gradient-to-br from-background/80 to-card/80 border border-amber-400/20 rounded-3xl shadow-2xl backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-r from-amber-400/10 via-yellow-400/10 to-amber-400/10 rounded-t-3xl border-b border-amber-400/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground text-xl font-bold flex items-center">
                      <Clock className="h-6 w-6 mr-3 text-amber-400" />
                      AI-Suggested Matches
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      Review and approve AI-generated match suggestions
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/30 px-3 py-1">
                    {pendingMatches.length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {pendingMatches.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Matches</h3>
                    <p className="text-muted-foreground">Run the AI Matchmaker to generate new match suggestions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingMatches.map((pendingMatch) => (
                      <Card key={pendingMatch.id} className="bg-card/50 border-amber-400/20 rounded-xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex -space-x-2">
                                <Avatar className="h-12 w-12 ring-2 ring-amber-400/50">
                                  <AvatarImage src={pendingMatch.user1?.photo_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-400 text-foreground">
                                    {pendingMatch.user1?.full_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <Avatar className="h-12 w-12 ring-2 ring-amber-400/50">
                                  <AvatarImage src={pendingMatch.user2?.photo_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-400 text-foreground">
                                    {pendingMatch.user2?.full_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">
                                  {pendingMatch.user1?.full_name} & {pendingMatch.user2?.full_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Math.round((pendingMatch.compatibility_score || 0) * 100)}% Compatibility
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {pendingMatch.ai_reasoning}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => approvePendingMatch(pendingMatch.id)}
                                className="bg-green-500/20 text-green-400 border-green-400/30 hover:bg-green-500/30"
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => rejectPendingMatch(pendingMatch.id)}
                                variant="outline"
                                className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                                size="sm"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-background/90 border-amber-400/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          {editProfile && (
            <AdminEditProfileForm
              editProfile={editProfile}
              saveProfile={saveProfile}
              handleAdminPhotoUpload={handleAdminPhotoUpload}
              adminUploading={adminUploading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Match Modal */}
      <Dialog open={showMatchModal} onOpenChange={setShowMatchModal}>
        <DialogContent className="max-w-lg bg-background/90 border-amber-400/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-bold">Create Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMatch(); }} className="space-y-4">
            <div className="flex gap-4">
              <select
                value={matchUser1}
                onChange={e => setMatchUser1(e.target.value)}
                className="flex-1 bg-background/50 border-amber-400/20 text-foreground rounded-lg px-3 py-2"
              >
                <option value="">Select User 1</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
              <select
                value={matchUser2}
                onChange={e => setMatchUser2(e.target.value)}
                className="flex-1 bg-background/50 border-amber-400/20 text-foreground rounded-lg px-3 py-2"
              >
                <option value="">Select User 2</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-amber-400 to-yellow-400 text-foreground font-bold hover:from-amber-500 hover:to-yellow-500 transition-all duration-200 rounded-lg shadow-lg">Create Match</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-lg bg-background/90 border-amber-400/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-bold">Chat</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto p-2">
            {chatLoading ? <div className="text-center text-muted-foreground">Loading...</div> :
              chatMessages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 ${msg.sender_id === user.id ? 'bg-amber-400 text-foreground' : 'bg-background/70 text-foreground border border-amber-400/20'}`}>{msg.content}</div>
                </div>
              ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Type a message..." className="flex-1 bg-background/50 border-amber-400/20 text-foreground" />
            <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} className="bg-amber-400 text-foreground font-bold">Send</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Code Generation Modal */}
      <Dialog open={showInviteCodeModal} onOpenChange={setShowInviteCodeModal}>
        <DialogContent className="bg-background/90 border border-amber-400/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">Generate Invite Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Number of Codes</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={inviteCodeQuantity}
                onChange={(e) => setInviteCodeQuantity(parseInt(e.target.value) || 1)}
                className="bg-background/50 border-amber-400/20 text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expiry (months)</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={inviteCodeExpiry}
                onChange={(e) => setInviteCodeExpiry(e.target.value)}
                className="bg-background/50 border-amber-400/20 text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteCodeModal(false)}
              className="border-amber-400/20 text-amber-400 hover:bg-amber-400/10"
            >
              Cancel
            </Button>
            <Button
              onClick={generateInviteCodes}
              className="btn-primary"
            >
              Generate Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 