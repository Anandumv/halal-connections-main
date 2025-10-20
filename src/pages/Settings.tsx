import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from '@/components/ProfileForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Heart, 
  Eye, 
  EyeOff, 
  Save, 
  ArrowLeft,
  Trash2,
  Download,
  Lock,
  Mail,
  Smartphone,
  Globe,
  Palette,
  Edit,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface SettingsData {
  profile: Profile | null;
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
  };
  privacy: {
    showAge: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  preferences: {
    ageRange: [number, number];
    distance: number;
    interests: string[];
  };
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    profile: null,
    notifications: {
      email: true,
      push: true,
      matches: true,
      messages: true,
    },
    privacy: {
      showAge: true,
      showLocation: true,
      allowMessages: true,
    },
    preferences: {
      ageRange: [18, 50],
      distance: 50,
      interests: [],
    },
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        profile
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Only save notification and privacy settings here
      // Profile data is handled by ProfileForm component
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSave = () => {
    fetchSettings(); // Refresh profile data
    setShowProfileForm(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Delete profile
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user?.id);

        // Sign out
        try {
          await signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
        });
        
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto"></div>
          <p className="mt-4 text-amber-400 text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 honeycomb-bg opacity-10"></div>
      
      {/* Solid Black Background */}
      <div className="absolute inset-0 bg-background"></div>
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-amber-400/20 sticky top-0 z-50 relative">
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
                  <SettingsIcon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="gradient-text text-2xl font-bold">Settings</h1>
                  <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-background/80 backdrop-blur-xl border border-amber-400/20">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <Lock className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>





          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="h-5 w-5 text-amber-400" />
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Email Notifications</Label>
                      <p className="text-muted-foreground text-sm">Receive notifications via email when matches are made</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-amber-400" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Control your privacy and visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Show Age</Label>
                      <p className="text-muted-foreground text-sm">Display your age on profile</p>
                    </div>
                    <Switch 
                      checked={settings.privacy.showAge}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showAge: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Show Location</Label>
                      <p className="text-muted-foreground text-sm">Display your location on profile</p>
                    </div>
                    <Switch 
                      checked={settings.privacy.showLocation}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showLocation: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Allow Messages</Label>
                      <p className="text-muted-foreground text-sm">Allow others to message you</p>
                    </div>
                    <Switch 
                      checked={settings.privacy.allowMessages}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, allowMessages: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lock className="h-5 w-5 text-amber-400" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Email</Label>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-400/20 text-amber-400">
                      Verified
                    </Badge>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/reset-password')}
                      className="w-full btn-outline"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          await signOut();
                        } catch (error) {
                          console.error('Error signing out:', error);
                          navigate('/');
                        }
                      }}
                      className="w-full btn-outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

             {/* Profile Form Modal */}
       {showProfileForm && (
         <ProfileForm
           open={showProfileForm}
           onOpenChange={setShowProfileForm}
           initialValues={settings.profile ? {
             full_name: settings.profile.full_name || '',
             age: settings.profile.age,
             gender: (settings.profile.gender?.toLowerCase() as 'male' | 'female') || 'male',
             bio: settings.profile.bio || '',
             photo_url: settings.profile.photo_url || '',
             photos: settings.profile.photos || [],
             name_initials: (settings.profile.preferences as any)?.name_initials || '',
             year_of_birth: (settings.profile.preferences as any)?.year_of_birth || new Date().getFullYear() - 18,
             hijabi: (settings.profile.preferences as any)?.hijabi || false,
             height: (settings.profile.preferences as any)?.height || '',
             residence: (settings.profile.preferences as any)?.residence || '',
             will_relocate: (settings.profile.preferences as any)?.will_relocate || false,
             education: (settings.profile.preferences as any)?.education || '',
             profession: (settings.profile.preferences as any)?.profession || '',
             legal_status: (settings.profile.preferences as any)?.legal_status || 'citizen',
             marital_status: (settings.profile.preferences as any)?.marital_status || 'never_married',
             divorced_with_kids: (settings.profile.preferences as any)?.divorced_with_kids || false,
             ethnicity: (settings.profile.preferences as any)?.ethnicity || '',
             religious_sect: (settings.profile.preferences as any)?.religious_sect || '',
             family: (settings.profile.preferences as any)?.family || '',
             language: (settings.profile.preferences as any)?.language || '',
             hobbies: (settings.profile.preferences as any)?.hobbies || [],
             location: (settings.profile.preferences as any)?.location || '',
             madhab: (settings.profile.preferences as any)?.madhab || 'hanafi',
             prayer_frequency: (settings.profile.preferences as any)?.prayer_frequency || 'usually',
             marriage_timeline: (settings.profile.preferences as any)?.marriage_timeline || 'within_1_year',
             phone: (settings.profile.preferences as any)?.phone || '',
             interests: (settings.profile.preferences as any)?.interests || [],
             looking_for_age_min: (settings.profile.preferences as any)?.looking_for_age_min || 18,
             looking_for_age_max: (settings.profile.preferences as any)?.looking_for_age_max || 50,
             looking_for_height: (settings.profile.preferences as any)?.looking_for_height || '',
             looking_for_residence: (settings.profile.preferences as any)?.looking_for_residence || '',
             looking_for_education: (settings.profile.preferences as any)?.looking_for_education || '',
             looking_for_profession: (settings.profile.preferences as any)?.looking_for_profession || '',
             looking_for_legal_status: (settings.profile.preferences as any)?.looking_for_legal_status || 'citizen',
             looking_for_marital_status: (settings.profile.preferences as any)?.looking_for_marital_status || 'never_married',
             looking_for_religious_sect: (settings.profile.preferences as any)?.looking_for_religious_sect || '',
             looking_for_ethnicity: (settings.profile.preferences as any)?.looking_for_ethnicity || '',
           } : undefined}
           userId={user?.id || ''}
           onSave={handleProfileSave}
         />
       )}

      {/* Photo Modal */}
      {showPhotoModal && settings.profile?.photo_url && (
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
                <img
                  src={settings.profile.photo_url}
                  alt={`${settings.profile.full_name}'s profile photo`}
                  className="w-full h-auto max-h-96 object-cover rounded-xl"
                />
              </div>
              
              {/* Profile Details */}
              <h3 className="text-2xl font-bold text-foreground mb-2">{settings.profile.full_name}</h3>
              <p className="text-muted-foreground text-sm mb-4">Profile Photo</p>
              
              {/* Close Button */}
              <Button
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black transition-all duration-300"
                onClick={() => setShowPhotoModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 