import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from '@/components/ProfileForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  User, 
  ArrowLeft,
  Edit,
  Upload,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Heart,
  Star,
  CheckCircle,
  XCircle,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import PhotoGallery from '@/components/PhotoGallery';

type Profile = Tables<'profiles'>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching profile for user:', user?.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      console.log('📊 Profile fetch result:', { data, error });

      if (error) throw error;
      setProfile(data);
      console.log('✅ Profile set successfully:', data);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🏁 Profile loading finished');
    }
  };

  const handleProfileSave = () => {
    fetchProfile();
    setShowProfileForm(false);
    toast({
      title: "Success",
      description: "Profile updated successfully!",
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    try {
      setUploadingPhoto(true);
      
      // Convert FileList to Array
      const fileArray = Array.from(files);
      console.log('=== UPLOADING MULTIPLE PHOTOS ===');
      console.log('Files to upload:', fileArray.length);
      
      // Upload all files
      const uploadPromises = fileArray.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}_${index}.${fileExt}`;
        console.log(`Uploading file ${index + 1}:`, fileName);
        
        const { data, error } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file);

        if (error) {
          console.error(`Upload error for file ${index + 1}:`, error);
          throw error;
        }
        
        console.log(`File ${index + 1} uploaded successfully`);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
          
        console.log(`Public URL for file ${index + 1}:`, publicUrl);
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('All photos uploaded successfully:', uploadedUrls);

      // Get current photos and add new ones
      const currentPhotos = profile?.photos || [];
      const updatedPhotos = [...currentPhotos, ...uploadedUrls];
      console.log('Updated photos array:', updatedPhotos);

      // Update profile with new photos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          photo_url: updatedPhotos[0], // Set first photo as main photo
          photos: updatedPhotos
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      toast({
        title: "Success",
        description: `${fileArray.length} photo${fileArray.length > 1 ? 's' : ''} uploaded successfully!`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    console.log('🔄 Profile component: Loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="h-8 w-8 text-black" />
          </div>
          <p className="text-foreground text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('❌ Profile component: No profile found');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-background/90 border border-amber-400/30 shadow-2xl rounded-3xl max-w-lg w-full backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-black" />
            </div>
            <CardTitle className="text-foreground text-2xl font-bold mb-2">Profile Not Found</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Please complete your profile to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowProfileForm(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold h-14 rounded-xl"
            >
              <Edit className="h-6 w-6 mr-3" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ Profile component: Rendering profile with data:', profile);

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
                  <User className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="gradient-text text-2xl font-bold">My Profile</h1>
                  <p className="text-muted-foreground">View and manage your profile</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => {
                console.log('Edit Profile button clicked');
                console.log('Current showProfileForm state:', showProfileForm);
                setShowProfileForm(true);
                console.log('Setting showProfileForm to true');
              }}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-semibold"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
                      {/* Profile Header Card */}
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                {/* Profile Photo */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-amber-400 overflow-hidden bg-gradient-to-br from-amber-400 to-yellow-500">
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
                <div className={`w-full h-full flex items-center justify-center text-black font-bold text-4xl ${(profile.photos && profile.photos.length > 0) || profile.photo_url ? 'hidden' : ''}`}>
                      {profile.full_name?.[0] || 'U'}
                    </div>
                  </div>
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                    <label className="cursor-pointer">
                      <Upload className="h-6 w-6 text-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-foreground">{profile.full_name}</h2>
                    <Badge 
                      variant={profile.verified ? "default" : "secondary"} 
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        profile.verified 
                          ? 'bg-green-500/20 text-green-400 border-green-400/30' 
                          : 'bg-gray-500/20 text-muted-foreground border-gray-400/30'
                      }`}
                    >
                      {profile.verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Pending Verification
                        </>
                      )}
                    </Badge>
                  </div>
                  
                                     <div className="space-y-2 text-muted-foreground">
                     {profile.age && (
                       <div className="flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-amber-400" />
                         <span>{profile.age} years old</span>
                       </div>
                     )}
                     <div className="flex items-center gap-2">
                       <Mail className="h-4 w-4 text-amber-400" />
                       <span>{profile.email}</span>
                     </div>
                     {(profile.preferences as any)?.name_initials && (
                       <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-amber-400" />
                         <span>Initials: {(profile.preferences as any).name_initials}</span>
                       </div>
                     )}
                     {(profile.preferences as any)?.year_of_birth && (
                       <div className="flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-amber-400" />
                         <span>Born: {(profile.preferences as any).year_of_birth}</span>
                       </div>
                     )}
                     {(profile.preferences as any)?.hijabi !== undefined && (
                       <div className="flex items-center gap-2">
                         <Heart className="h-4 w-4 text-amber-400" />
                         <span>Hijabi: {(profile.preferences as any).hijabi ? 'Yes' : 'No'}</span>
                       </div>
                     )}
                     {(profile.preferences as any)?.height && (
                       <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-amber-400" />
                         <span>Height: {(profile.preferences as any).height}</span>
                       </div>
                     )}
                     {(profile.preferences as any)?.residence && (
                       <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-amber-400" />
                         <span>Residence: {(profile.preferences as any).residence}</span>
                       </div>
                     )}
                     {(profile.preferences as any)?.will_relocate !== undefined && (
                       <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-amber-400" />
                         <span>Will Relocate: {(profile.preferences as any).will_relocate ? 'Yes' : 'No'}</span>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery Card */}
          <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Camera className="h-5 w-5 text-amber-400" />
                Profile Photos
                {profile.photos && profile.photos.length > 0 && (
                  <Badge className="ml-2 bg-amber-400/20 text-amber-400 border-amber-400/30">
                    {profile.photos.length} photo{profile.photos.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const photos = profile.photos && profile.photos.length > 0 
                  ? profile.photos 
                  : profile.photo_url ? [profile.photo_url] : [];
                
                return photos.length > 0 ? (
                  <div className="space-y-4">
                    <PhotoGallery 
                      photos={photos} 
                      className="max-w-2xl mx-auto"
                      showThumbnails={photos.length > 1}
                      maxThumbnails={6}
                    />
                    <div className="text-center">
                      <label className="cursor-pointer">
                        <Button 
                          variant="outline" 
                          className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              Add More Photos
                            </>
                          )}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No photos uploaded yet</p>
                    <p className="text-gray-500 text-sm mb-4">Add photos to your profile to help others get to know you better</p>
                    <label className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Add Photos
                          </>
                        )}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Heart className="h-5 w-5 text-amber-400" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">{profile.bio}</p>
              ) : (
                <p className="text-gray-500 italic mb-6">No bio added yet. Click "Edit Profile" to add your bio.</p>
              )}
              
              {/* Additional Details Grid */}
              <div className="mobile-grid">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground border-b border-amber-400/20 pb-2">
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    {(profile.preferences as any)?.education && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Education:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).education}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.profession && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profession:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).profession}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.legal_status && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Legal Status:</span>
                        <span className="text-foreground font-medium capitalize">{(profile.preferences as any).legal_status.replace('_', ' ')}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.marital_status && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Marital Status:</span>
                        <span className="text-foreground font-medium capitalize">{(profile.preferences as any).marital_status.replace('_', ' ')}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.divorced_with_kids !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Divorced with Kids:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).divorced_with_kids ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.ethnicity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ethnicity:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).ethnicity}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground border-b border-amber-400/20 pb-2">
                    Religious & Cultural
                  </h4>
                  <div className="space-y-3">
                    {(profile.preferences as any)?.religious_sect && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Religious Sect:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).religious_sect}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.madhab && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Madhhab:</span>
                        <span className="text-foreground font-medium capitalize">{(profile.preferences as any).madhab}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.prayer_frequency && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prayer Frequency:</span>
                        <span className="text-foreground font-medium capitalize">{(profile.preferences as any).prayer_frequency}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.family && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Family:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).family}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.language && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Language:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).language}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.marriage_timeline && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Marriage Timeline:</span>
                        <span className="text-foreground font-medium capitalize">{(profile.preferences as any).marriage_timeline.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hobbies & Interests Card */}
          {((profile.preferences as any)?.hobbies && (profile.preferences as any).hobbies.length > 0) || 
           ((profile.preferences as any)?.interests && (profile.preferences as any).interests.length > 0) ? (
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Heart className="h-5 w-5 text-amber-400" />
                  Hobbies & Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(profile.preferences as any)?.hobbies && (profile.preferences as any).hobbies.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-3">Hobbies</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile.preferences as any).hobbies.map((hobby: string, index: number) => (
                          <Badge
                            key={index}
                            className="bg-amber-400/20 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(profile.preferences as any)?.interests && (profile.preferences as any).interests.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-3">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile.preferences as any).interests.map((interest: string, index: number) => (
                          <Badge
                            key={index}
                            className="bg-amber-400/20 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Looking For Card */}
          {((profile.preferences as any)?.looking_for_age_min || (profile.preferences as any)?.looking_for_height) && (
            <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Star className="h-5 w-5 text-amber-400" />
                  Looking For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mobile-grid">
                  <div className="space-y-3">
                    {(profile.preferences as any)?.looking_for_age_min && (profile.preferences as any)?.looking_for_age_max && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age Range:</span>
                        <span className="text-foreground font-medium">
                          {(profile.preferences as any).looking_for_age_min} - {(profile.preferences as any).looking_for_age_max} years
                        </span>
                      </div>
                    )}
                    {(profile.preferences as any)?.looking_for_height && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Height:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).looking_for_height}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.looking_for_residence && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Residence:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).looking_for_residence}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.looking_for_education && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Education:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).looking_for_education}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.looking_for_profession && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profession:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).looking_for_profession}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {(profile.preferences as any)?.looking_for_legal_status && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Legal Status:</span>
                        <span className="text-foreground font-medium capitalize">{(profile.preferences as any).looking_for_legal_status.replace('_', ' ')}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.looking_for_marital_status && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Marital Status:</span>
                        <span className="text-foreground font-medium capitalize">{(profile.preferences as any).looking_for_marital_status.replace('_', ' ')}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.looking_for_religious_sect && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Religious Sect:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).looking_for_religious_sect}</span>
                      </div>
                    )}
                    {(profile.preferences as any)?.looking_for_ethnicity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ethnicity:</span>
                        <span className="text-foreground font-medium">{(profile.preferences as any).looking_for_ethnicity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Stats Card */}
          <Card className="bg-background/80 backdrop-blur-xl border border-amber-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Star className="h-5 w-5 text-amber-400" />
                Profile Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mobile-grid">
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400 mb-1">0</div>
                  <div className="text-muted-foreground text-sm">Matches</div>
                </div>
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400 mb-1">0</div>
                  <div className="text-muted-foreground text-sm">Messages</div>
                </div>
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400 mb-1">100%</div>
                  <div className="text-muted-foreground text-sm">Profile Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Form Modal */}
      <ProfileForm 
        open={showProfileForm} 
        onOpenChange={(open) => {
          console.log('ProfileForm onOpenChange called with:', open);
          setShowProfileForm(open);
        }}
        initialValues={profile ? {
          full_name: profile.full_name || '',
          age: profile.age,
          gender: (profile.gender?.toLowerCase() as 'male' | 'female') || 'male',
          bio: profile.bio || '',
                  photo_url: profile.photo_url || '',
        photos: (profile as any).photos || [],
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
    </div>
  );
} 