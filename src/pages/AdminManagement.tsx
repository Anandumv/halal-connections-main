import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Heart, 
  Shield, 
  Settings as SettingsIcon,
  Search,
  Filter,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Mail,
  Phone,
  Calendar,
  MapPin,
  X,
  Plus,
  Camera,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type Profile = Tables<'profiles'>;
type Match = Tables<'matches'>;
type Admin = Tables<'admins'>;

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalMatches: number;
  successfulMatches: number;
  activeUsers: number;
  bannedUsers: number;
  totalAdmins: number;
  usersWithPhotos: number;
  totalPhotos: number;
}

type UserOption = { id: string; email: string; full_name: string };

export default function AdminManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    totalMatches: 0,
    successfulMatches: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalAdmins: 0,
    usersWithPhotos: 0,
    totalPhotos: 0,
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', age: '', gender: '', bio: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminId, setNewAdminId] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [editPhotoFiles, setEditPhotoFiles] = useState<File[]>([]);
  const [editPhotoPreviews, setEditPhotoPreviews] = useState<string[]>([]);
  const [editPhotoUrls, setEditPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [sortBy, setSortBy] = useState<'age' | 'gender' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [profilesResult, matchesResult, adminsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('matches').select('*').order('created_at', { ascending: false }),
        supabase.from('admins').select('*').order('created_at', { ascending: false }),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (matchesResult.error) throw matchesResult.error;
      if (adminsResult.error) throw adminsResult.error;

      setProfiles(profilesResult.data || []);
      setMatches(matchesResult.data || []);
      setAdmins(adminsResult.data || []);

      // Calculate stats
      const profilesData = profilesResult.data || [];
      const matchesData = matchesResult.data || [];
      const adminsData = adminsResult.data || [];

      setStats({
        totalUsers: profilesData.length,
        verifiedUsers: profilesData.filter(p => p.verified).length,
        pendingVerifications: profilesData.filter(p => !p.verified).length,
        totalMatches: matchesData.length,
        successfulMatches: matchesData.filter(m => m.status_user1 === 'accepted' && m.status_user2 === 'accepted').length,
        activeUsers: profilesData.filter(p => {
          const lastActive = new Date(p.updated_at || p.created_at || '');
          const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceActive <= 30;
        }).length,
        bannedUsers: profilesData.filter(p => p.role === 'banned').length,
        totalAdmins: adminsData.length,
        usersWithPhotos: profilesData.filter(p => 
          (p.photos && p.photos.length > 0) || p.photo_url
        ).length,
        totalPhotos: profilesData.reduce((total, p) => {
          if (p.photos && p.photos.length > 0) {
            return total + p.photos.length;
          } else if (p.photo_url) {
            return total + 1;
          }
          return total;
        }, 0),
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile verified successfully",
      });

      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error verifying profile:', error);
      toast({
        title: "Error",
        description: "Failed to verify profile",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'banned' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User banned successfully",
      });

      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleUnbanUser = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unbanned successfully",
      });

      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  const handleMultipleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (editPhotoPreviews.length + files.length > 6) {
      toast({
        title: 'Too many photos',
        description: 'You can upload a maximum of 6 photos.',
        variant: 'destructive',
      });
      return;
    }

    const newFiles = [...editPhotoFiles, ...files];
    setEditPhotoFiles(newFiles);

    // Create previews for new files
    const newPreviews = [...editPhotoPreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setEditPhotoPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPreviews = editPhotoPreviews.filter((_, i) => i !== index);
    const newFiles = editPhotoFiles.filter((_, i) => i !== index);
    const newUrls = editPhotoUrls.filter((_, i) => i !== index);
    
    setEditPhotoPreviews(newPreviews);
    setEditPhotoFiles(newFiles);
    setEditPhotoUrls(newUrls);
  };

  const handleMultiplePhotoUpload = async (files: File[], userId: string) => {
    if (!files || files.length === 0) return [];
    if (!userId) {
      throw new Error('User ID is not available');
    }

    try {
      setUploadingPhotos(true);
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}_${index}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      toast({
        title: 'Photos uploaded successfully',
        description: `${uploadedUrls.length} photo(s) have been uploaded.`,
      });

      return uploadedUrls;
    } catch (error: any) {
      toast({
        title: 'Photo upload failed',
        description: error.message || 'Failed to upload photos. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profileId);

        if (error) {
          console.error('Delete error details:', error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Profile deleted successfully",
        });

        fetchAllData(); // Refresh data
      } catch (error: any) {
        console.error('Error deleting profile:', error);
        const errorMessage = error?.message || error?.details || 'Unknown error occurred';
        toast({
          title: "Error",
          description: `Failed to delete profile: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  const filteredProfiles = profiles
    .filter(profile => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          profile.full_name?.toLowerCase().includes(searchLower) ||
          profile.email?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(profile => {
      if (genderFilter === 'all') return true;
      return profile.gender === genderFilter;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'gender':
          aValue = a.gender || '';
          bValue = b.gender || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen animated-bg honeycomb-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto"></div>
          <p className="mt-4 text-amber-400 text-lg">Loading admin management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg honeycomb-bg">
      {/* Header */}
      <header className="glass border-b border-amber-400/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/admin')}
                className="btn-outline"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="gradient-text text-2xl font-bold">Admin Management</h1>
                  <p className="text-muted-foreground">Manage users, profiles, and system settings</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-amber-400/20 text-foreground placeholder:text-muted-foreground focus:border-amber-400 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-amber-400/20">
            <TabsTrigger value="overview" className="text-muted-foreground data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="text-muted-foreground data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Users
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-muted-foreground data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Matches
            </TabsTrigger>
            <TabsTrigger value="admins" className="text-muted-foreground data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Admins
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Card className="honeycomb-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card className="honeycomb-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.verifiedUsers}</div>
                  <p className="text-xs text-muted-foreground">Profiles verified</p>
                </CardContent>
              </Card>

              <Card className="honeycomb-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Users with Photos</CardTitle>
                  <Camera className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.usersWithPhotos}</div>
                  <p className="text-xs text-muted-foreground">Profiles with photos</p>
                </CardContent>
              </Card>

              <Card className="honeycomb-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Photos</CardTitle>
                  <Camera className="h-4 w-4 text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalPhotos}</div>
                  <p className="text-xs text-muted-foreground">All photos uploaded</p>
                </CardContent>
              </Card>

              <Card className="honeycomb-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
                  <Heart className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">All matches</p>
                </CardContent>
              </Card>

              <Card className="honeycomb-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="honeycomb-card">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Latest user registrations and matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.slice(0, 5).map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-4 p-3 border border-amber-400/20 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-black font-semibold">
                          {profile.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{profile.full_name}</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {profile.verified ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Verified</Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Pending</Badge>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Camera className="h-3 w-3" />
                          <span>
                            {profile.photos && profile.photos.length > 0 
                              ? profile.photos.length 
                              : profile.photo_url 
                                ? 1 
                                : 0
                            }
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="honeycomb-card">
              <CardHeader>
                <CardTitle className="text-foreground">User Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage user profiles, verification, and permissions
                </CardDescription>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-muted-foreground">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'age' | 'gender' | 'created_at')}
                      className="bg-background/50 border border-amber-400/20 text-foreground rounded px-3 py-1 text-sm"
                    >
                      <option value="created_at">Join Date</option>
                      <option value="age">Age</option>
                      <option value="gender">Gender</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-muted-foreground">Order:</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="bg-background/50 border border-amber-400/20 text-foreground rounded px-3 py-1 text-sm"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-muted-foreground">Gender:</label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value as 'all' | 'male' | 'female')}
                      className="bg-background/50 border border-amber-400/20 text-foreground rounded px-3 py-1 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-amber-400/20">
                        <TableHead className="text-muted-foreground">User</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Photos</TableHead>
                        <TableHead className="text-muted-foreground">Age</TableHead>
                        <TableHead className="text-muted-foreground">Looking For</TableHead>
                        <TableHead className="text-muted-foreground">Joined</TableHead>
                        <TableHead className="text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id} className="border-amber-400/10">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile.photo_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-black text-xs font-semibold">
                                {profile.full_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-foreground font-medium">{profile.full_name}</p>
                              <p className="text-sm text-muted-foreground">{profile.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {profile.verified ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Verified</Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Pending</Badge>
                            )}
                            {profile.role === 'banned' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-400/30">Banned</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-amber-400" />
                            <span>
                              {profile.photos && profile.photos.length > 0 
                                ? `${profile.photos.length} photo${profile.photos.length > 1 ? 's' : ''}`
                                : profile.photo_url 
                                  ? '1 photo' 
                                  : 'No photos'
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{profile.age || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="space-y-1 text-xs">
                            {profile.preferences?.looking_for_age_min && profile.preferences?.looking_for_age_max && (
                              <div>Age: {profile.preferences.looking_for_age_min}-{profile.preferences.looking_for_age_max}</div>
                            )}
                            {profile.preferences?.looking_for_gender && (
                              <div>Gender: {profile.preferences.looking_for_gender}</div>
                            )}
                            {profile.preferences?.looking_for_location && (
                              <div>Location: {profile.preferences.looking_for_location}</div>
                            )}
                            {!profile.preferences?.looking_for_age_min && !profile.preferences?.looking_for_gender && !profile.preferences?.looking_for_location && (
                              <div className="text-gray-500">No preferences set</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditUser(profile);
                                setEditForm({
                                  full_name: profile.full_name || '',
                                  age: profile.age?.toString() || '',
                                  gender: profile.gender || '',
                                  bio: profile.bio || '',
                                  email: profile.email || '',
                                });
                                // Set photo data
                                if (profile.photos && profile.photos.length > 0) {
                                  setEditPhotoUrls(profile.photos);
                                  setEditPhotoPreviews(profile.photos);
                                } else if (profile.photo_url) {
                                  setEditPhotoUrls([profile.photo_url]);
                                  setEditPhotoPreviews([profile.photo_url]);
                                } else {
                                  setEditPhotoUrls([]);
                                  setEditPhotoPreviews([]);
                                }
                                setEditPhotoFiles([]);
                              }}
                              className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            {!profile.verified && (
                              <Button
                                size="sm"
                                onClick={() => handleVerifyProfile(profile.id)}
                                className="bg-green-600 hover:bg-green-700 text-foreground min-h-[44px]"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                            )}
                            {profile.role !== 'banned' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBanUser(profile.id)}
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 min-h-[44px]"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnbanUser(profile.id)}
                                className="border-green-500/20 text-green-400 hover:bg-green-500/10 min-h-[44px]"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProfile(profile.id)}
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10 min-h-[44px] min-w-[44px]"
                            >
                              <Trash2 className="h-4 w-4" />
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

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card className="honeycomb-card">
              <CardHeader>
                <CardTitle className="text-foreground">Match Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Monitor and manage user matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-amber-400/20">
                        <TableHead className="text-muted-foreground">Match ID</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match) => (
                      <TableRow key={match.id} className="border-amber-400/10">
                        <TableCell className="text-muted-foreground">{match.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              match.status_user1 === 'accepted' && match.status_user2 === 'accepted'
                                ? 'bg-green-500/20 text-green-400 border-green-400/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                            }>
                              {match.status_user1 === 'accepted' && match.status_user2 === 'accepted' ? 'Accepted' : 'Pending'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(match.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="btn-outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            <Card className="honeycomb-card">
              <CardHeader>
                <CardTitle className="text-foreground">Admin Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage admin users and permissions
                </CardDescription>
                <Button className="btn-primary mt-4" onClick={() => setShowAddAdmin(true)}>
                  + Add Admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-amber-400/20">
                        <TableHead className="text-muted-foreground">Admin ID</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id} className="border-amber-400/10">
                        <TableCell className="text-muted-foreground">{admin.id}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                            onClick={async () => {
                              if (!window.confirm('Remove this admin?')) return;
                              const { error } = await supabase.from('admins').delete().eq('id', admin.id);
                              if (error) {
                                toast({ title: 'Error', description: 'Failed to remove admin.', variant: 'destructive' });
                              } else {
                                toast({ title: 'Removed', description: 'Admin removed.' });
                                fetchAllData();
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
            {/* Add Admin Modal */}
            <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
              <DialogContent className="modal-content max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Admin</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAddAdminLoading(true);
                    const [id, email] = newAdminId.split('|');
                    const { error } = await supabase.from('admins').insert({ id, email });
                    setAddAdminLoading(false);
                    if (error) {
                      toast({ title: 'Error', description: 'Failed to add admin.', variant: 'destructive' });
                    } else {
                      toast({ title: 'Success', description: 'Admin added.' });
                      setShowAddAdmin(false);
                      setNewAdminId('');
                      fetchAllData();
                    }
                  }}
                  className="space-y-4"
                >
                  <Label htmlFor="admin_id">Select User</Label>
                  <input
                    id="admin_id"
                    className="w-full p-2 rounded bg-background/80 border border-amber-400/20 text-foreground mb-2"
                    value={userSearch}
                    onChange={async e => {
                      setUserSearch(e.target.value);
                      if (e.target.value.length >= 2) {
                        const { data } = await supabase.from('profiles').select('id, email, full_name').ilike('full_name', `%${e.target.value}%`);
                        setUserOptions((data as UserOption[]) || []);
                      } else {
                        setUserOptions([]);
                      }
                    }}
                    placeholder="Search user by name..."
                    autoComplete="off"
                  />
                  <div className="max-h-40 overflow-y-auto mb-2">
                    {userOptions.map(u => (
                      <div
                        key={u.id}
                        className="p-2 cursor-pointer hover:bg-amber-400/10 text-foreground border-b border-amber-400/10"
                        onClick={() => {
                          setNewAdminId(u.id + '|' + u.email);
                          setUserSearch(u.full_name || u.email);
                          setUserOptions([]);
                        }}
                      >
                        {u.full_name} <span className="text-xs text-muted-foreground">({u.email})</span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="hidden"
                    value={newAdminId}
                    readOnly
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={addAdminLoading} className="btn-primary">
                      {addAdminLoading ? 'Adding...' : 'Add Admin'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddAdmin(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit User Modal */}
      {editUser && (
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="modal-content max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditLoading(true);
                
                let finalPhotoUrls = editPhotoUrls;
                
                // Upload new photos if there are any
                if (editPhotoFiles.length > 0) {
                  try {
                    const uploadedUrls = await handleMultiplePhotoUpload(editPhotoFiles, editUser.id);
                    finalPhotoUrls = [...editPhotoUrls, ...uploadedUrls];
                  } catch (photoError) {
                    // Continue with profile save even if photo upload fails
                    console.error('Photo upload failed:', photoError);
                  }
                }

                const { error } = await supabase.from('profiles').update({
                  full_name: editForm.full_name,
                  age: Number(editForm.age),
                  gender: editForm.gender.toLowerCase(),
                  bio: editForm.bio,
                  email: editForm.email,
                  photo_url: finalPhotoUrls.length > 0 ? finalPhotoUrls[0] : null,
                  photos: finalPhotoUrls,
                }).eq('id', editUser.id);
                setEditLoading(false);
                if (error) {
                  toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' });
                } else {
                  toast({ title: 'Success', description: 'User updated.' });
                  setEditUser(null);
                  setEditPhotoUrls([]);
                  setEditPhotoPreviews([]);
                  setEditPhotoFiles([]);
                  fetchAllData();
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <input
                    id="full_name"
                    className="w-full p-2 rounded bg-background/80 border border-amber-400/20 text-foreground"
                    value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <input
                    id="age"
                    type="number"
                    className="w-full p-2 rounded bg-background/80 border border-amber-400/20 text-foreground"
                    value={editForm.age}
                    onChange={e => setEditForm(f => ({ ...f, age: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full p-2 rounded bg-background/80 border border-amber-400/20 text-foreground"
                    value={editForm.gender}
                    onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 rounded bg-background/80 border border-amber-400/20 text-foreground"
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full p-2 rounded bg-background/80 border border-amber-400/20 text-foreground"
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Photo Upload Section */}
              <div>
                <Label className="text-muted-foreground">Profile Photos (Up to 6)</Label>
                <div className="mt-2">
                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {editPhotoPreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-card group">
                        <img
                          src={preview}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-background/70 text-foreground hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-amber-400 text-black px-2 py-1 rounded text-xs font-medium">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Photo Button */}
                    {editPhotoPreviews.length < 6 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-amber-400/40 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-background/40 hover:bg-background/60">
                        {uploadingPhotos ? (
                          <Loader2 className="h-8 w-8 text-amber-400 animate-spin mb-2" />
                        ) : (
                          <Plus className="h-8 w-8 text-amber-400 mb-2" />
                        )}
                        <span className="text-amber-400 text-sm font-medium">Add Photo</span>
                        <span className="text-muted-foreground text-xs mt-1">{editPhotoPreviews.length}/6</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleMultipleFilesChange}
                          className="hidden"
                          disabled={uploadingPhotos}
                        />
                      </label>
                    )}
                  </div>

                  {editPhotoPreviews.length === 0 && (
                    <div className="text-center py-4 border border-dashed border-gray-600 rounded-lg">
                      <Camera className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No photos uploaded yet</p>
                    </div>
                  )}

                  {editPhotoPreviews.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>{editPhotoPreviews.length} photo{editPhotoPreviews.length > 1 ? 's' : ''} ready</span>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={editLoading} className="btn-primary">
                  {editLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 