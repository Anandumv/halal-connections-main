import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Heart, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Phone, 
  Mail,
  Upload,
  X,
  Star,
  Camera,
  CheckCircle,
  Loader2,
  Plus
} from 'lucide-react';

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  age: z.number().min(18, 'Must be at least 18 years old').max(100, 'Age must be reasonable').optional(),
  gender: z.enum(['male', 'female']).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  photo_url: z.string().optional(),
  photos: z.array(z.string()).max(6, 'Maximum 6 photos allowed').optional(),
  // Basic Information
  name_initials: z.string().min(1, 'Name initials are required').optional(),
  year_of_birth: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Invalid year').optional(),
  hijabi: z.boolean().optional(),
  height: z.string().min(1, 'Height is required').optional(),
  residence: z.string().min(1, 'Residence is required').optional(),
  will_relocate: z.boolean().optional(),
  education: z.string().min(1, 'Education is required').optional(),
  profession: z.string().min(1, 'Profession is required').optional(),
  legal_status: z.enum(['citizen', 'permanent_resident', 'work_visa', 'student_visa', 'other']).optional(),
  marital_status: z.enum(['never_married', 'divorced', 'widowed']).optional(),
  divorced_with_kids: z.boolean().optional(),
  ethnicity: z.string().min(1, 'Ethnicity is required').optional(),
  religious_sect: z.string().min(1, 'Religious sect is required').optional(),
  family: z.string().min(1, 'Family information is required').optional(),
  language: z.string().min(1, 'Language is required').optional(),
  hobbies: z.array(z.string()).min(1, 'At least one hobby is required').optional(),
  // Preferences fields
  location: z.string().min(1, 'Location is required').optional(),
  madhab: z.enum(['hanafi', 'shafi', 'maliki', 'hanbali', 'other']).optional(),
  prayer_frequency: z.enum(['always', 'usually', 'sometimes', 'rarely']).optional(),
  marriage_timeline: z.enum(['asap', 'within_6_months', 'within_1_year', 'within_2_years', 'no_rush']).optional(),
  phone: z.string().optional(),
  interests: z.array(z.string()).min(1, 'At least one interest is required').optional(),
  // Looking for preferences
  looking_for_age_min: z.number().min(18, 'Minimum age must be at least 18').optional(),
  looking_for_age_max: z.number().min(18, 'Maximum age must be at least 18').optional(),
  looking_for_height: z.string().min(1, 'Preferred height is required').optional(),
  looking_for_residence: z.string().min(1, 'Preferred residence is required').optional(),
  looking_for_education: z.string().min(1, 'Preferred education is required').optional(),
  looking_for_profession: z.string().min(1, 'Preferred profession is required').optional(),
  looking_for_legal_status: z.enum(['citizen', 'permanent_resident', 'work_visa', 'student_visa', 'other']).optional(),
  looking_for_marital_status: z.enum(['never_married', 'divorced', 'widowed']).optional(),
  looking_for_religious_sect: z.string().min(1, 'Preferred religious sect is required').optional(),
  looking_for_ethnicity: z.string().min(1, 'Preferred ethnicity is required').optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<ProfileFormValues>;
  userId: string;
  onSave: () => void;
}

export function ProfileForm({ open, onOpenChange, initialValues, userId, onSave }: ProfileFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [ageInput, setAgeInput] = useState('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: '',
      age: undefined,
      gender: 'male',
      bio: '',
      photo_url: '',
      photos: [],
      name_initials: '',
      year_of_birth: new Date().getFullYear() - 18,
      hijabi: false,
      height: '',
      residence: '',
      will_relocate: false,
      education: '',
      profession: '',
      legal_status: 'citizen',
      marital_status: 'never_married',
      divorced_with_kids: false,
      ethnicity: '',
      religious_sect: '',
      family: '',
      language: '',
      hobbies: [],
      location: '',
      madhab: 'hanafi',
      prayer_frequency: 'usually',
      marriage_timeline: 'within_1_year',
      phone: '',
      interests: [],
      looking_for_age_min: undefined,
      looking_for_age_max: 50,
      looking_for_height: '',
      looking_for_residence: '',
      looking_for_education: '',
      looking_for_profession: '',
      looking_for_legal_status: 'citizen',
      looking_for_marital_status: 'never_married',
      looking_for_religious_sect: '',
      looking_for_ethnicity: '',
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
      setAgeInput(initialValues.age != null ? String(initialValues.age) : '');
      if (initialValues.photos && initialValues.photos.length > 0) {
        setPhotoUrls(initialValues.photos);
        setPhotoPreviews(initialValues.photos);
      } else if (initialValues.photo_url) {
        setPhotoUrls([initialValues.photo_url]);
        setPhotoPreviews([initialValues.photo_url]);
      }
    } else {
      form.reset({
        full_name: '',
        age: undefined,
        gender: 'male',
        bio: '',
        photo_url: '',
        location: '',
        madhab: 'hanafi',
        prayer_frequency: 'usually',
        marriage_timeline: 'within_1_year',
        profession: '',
        education: '',
        phone: '',
        will_relocate: false,
        interests: [],
      });
      setAgeInput('');
      setPhotoPreviews([]);
      setPhotoFiles([]);
      setPhotoUrls([]);
    }
  }, [initialValues, form, open]);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    if (!userId) {
      throw new Error('User ID is not available');
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

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
      
      toast({
        title: 'Photo uploaded successfully',
        description: 'Your profile photo has been updated.',
      });
      
      return publicUrl;
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (photoPreviews.length + files.length > 6) {
      toast({
        title: 'Too many photos',
        description: 'You can upload a maximum of 6 photos.',
        variant: 'destructive',
      });
      return;
    }

    const newFiles = [...photoFiles, ...files];
    setPhotoFiles(newFiles);

    // Create previews for new files
    const newPreviews = [...photoPreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setPhotoPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    const newFiles = photoFiles.filter((_, i) => i !== index);
    const newUrls = photoUrls.filter((_, i) => i !== index);
    
    setPhotoPreviews(newPreviews);
    setPhotoFiles(newFiles);
    setPhotoUrls(newUrls);
  };

  const handleMultiplePhotoUpload = async (files: File[]) => {
    if (!files || files.length === 0) return [];
    if (!userId) {
      throw new Error('User ID is not available');
    }

    console.log('=== PHOTO UPLOAD STARTED ===');
    console.log('Files to upload:', files.length);
    console.log('User ID:', userId);

    try {
      setUploading(true);
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}_${index}.${fileExt}`;
        const filePath = fileName;

        console.log(`Uploading file ${index + 1}:`, fileName);

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for file ${index + 1}:`, uploadError);
          throw uploadError;
        }

        console.log(`File ${index + 1} uploaded successfully`);

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        console.log(`Public URL for file ${index + 1}:`, publicUrl);
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      console.log('All photos uploaded successfully:', uploadedUrls);
      console.log('=== PHOTO UPLOAD COMPLETED ===');
      
      toast({
        title: 'Photos uploaded successfully',
        description: `${uploadedUrls.length} photo(s) have been uploaded.`,
      });

      return uploadedUrls;
    } catch (error: any) {
      console.error('Photo upload failed:', error);
      toast({
        title: 'Photo upload failed',
        description: error.message || 'Failed to upload photos. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const getPreferencesObj = (values: ProfileFormValues) => {
    return {
      // Basic Information
      name_initials: values.name_initials,
      year_of_birth: values.year_of_birth,
      hijabi: values.hijabi,
      height: values.height,
      residence: values.residence,
      will_relocate: values.will_relocate,
      education: values.education,
      profession: values.profession,
      legal_status: values.legal_status,
      marital_status: values.marital_status,
      divorced_with_kids: values.divorced_with_kids,
      ethnicity: values.ethnicity,
      religious_sect: values.religious_sect,
      family: values.family,
      language: values.language,
      hobbies: values.hobbies,
      // Religious Preferences
      location: values.location,
      madhab: values.madhab,
      prayer_frequency: values.prayer_frequency,
      marriage_timeline: values.marriage_timeline,
      phone: values.phone,
      interests: values.interests,
      // Looking for preferences
      looking_for_age_min: values.looking_for_age_min,
      looking_for_age_max: values.looking_for_age_max,
      looking_for_height: values.looking_for_height,
      looking_for_residence: values.looking_for_residence,
      looking_for_education: values.looking_for_education,
      looking_for_profession: values.looking_for_profession,
      looking_for_legal_status: values.looking_for_legal_status,
      looking_for_marital_status: values.looking_for_marital_status,
      looking_for_religious_sect: values.looking_for_religious_sect,
      looking_for_ethnicity: values.looking_for_ethnicity,
    };
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (saving) return; // Prevent multiple submissions
    
    setSaving(true);
    try {
      console.log('=== SAVE PROFILE STARTED ===');
      console.log('Form submission started with values:', values);
      console.log('User ID:', userId);
      console.log('User email:', user?.email);
      console.log('Photo files to upload:', photoFiles.length);
      console.log('Existing photo URLs:', photoUrls);
      
      if (!userId) {
        throw new Error('User ID is not available');
      }

      // Upload new photos if any
      let finalPhotoUrls = [...photoUrls]; // Start with existing URLs
      
      if (photoFiles.length > 0) {
        console.log('Uploading new photos...');
        try {
          const uploadedUrls = await handleMultiplePhotoUpload(photoFiles);
          // Add new photos to existing ones (keep existing + add new)
          finalPhotoUrls = [...photoUrls, ...uploadedUrls];
          console.log('Photos uploaded successfully:', uploadedUrls);
          console.log('Final photo URLs (existing + new):', finalPhotoUrls);
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError);
          // Continue with profile save even if photo upload fails
        }
      }

      // Save profile with all data
      const profileData = {
        id: userId,
        email: user?.email || '',
        full_name: values.full_name || 'Updated User',
        // Keep age blank if user hasn't provided it
        age: values.age,
        gender: values.gender || 'male',
        bio: values.bio || '',
        photo_url: finalPhotoUrls.length > 0 ? finalPhotoUrls[0] : null,
        photos: finalPhotoUrls,
        preferences: getPreferencesObj(values),
        role: 'user',
        updated_at: new Date().toISOString(),
      };
      
      console.log('Saving profile data:', profileData);
      
      // Direct UPSERT operation
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Profile saved successfully:', data);
      console.log('=== SAVE PROFILE COMPLETED ===');

      toast({
        title: 'Profile saved successfully',
        description: 'Your profile has been updated.',
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        title: 'Save failed',
        description: `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !form.getValues('interests').includes(newInterest.trim())) {
      const currentInterests = form.getValues('interests');
      form.setValue('interests', [...currentInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    const currentInterests = form.getValues('interests');
    form.setValue('interests', currentInterests.filter(i => i !== interestToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/80 backdrop-blur-xl border border-amber-400/20">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-black" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Complete Your Profile
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-lg">
            Tell us about yourself to help find your perfect match
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted manually');
            const values = form.getValues();
            console.log('Form values:', values);
            onSubmit(values);
          }} className="space-y-8">
            {/* Multiple Photos Upload Section */}
            <div className="bg-background/80 backdrop-blur-xl rounded-xl p-6 border border-amber-400/20">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Camera className="h-5 w-5 text-amber-400" />
                Profile Photos (Up to 6)
              </h3>
              
              {/* Photo Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-card group">
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/70 text-foreground hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-amber-400 text-black px-2 py-1 rounded text-xs font-medium">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add Photo Button */}
                {photoPreviews.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-amber-400/40 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-background/40 hover:bg-background/60">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 text-amber-400 animate-spin mb-2" />
                    ) : (
                      <Plus className="h-8 w-8 text-amber-400 mb-2" />
                    )}
                    <span className="text-amber-400 text-sm font-medium">Add Photo</span>
                    <span className="text-muted-foreground text-xs mt-1">{photoPreviews.length}/6</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleFilesChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {photoPreviews.length === 0 && (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No photos uploaded yet</p>
                  <p className="text-muted-foreground text-sm">Add up to 6 photos to help others get to know you better</p>
                </div>
              )}

              {photoPreviews.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{photoPreviews.length} photo{photoPreviews.length > 1 ? 's' : ''} ready</span>
                </div>
              )}
            </div>

            {/* Basic Information Section */}
            <div className="bg-background/80 backdrop-blur-xl rounded-xl p-6 border border-amber-400/20">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-amber-400" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Full Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-background/80 border-amber-400/20 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Age *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your age"
                          value={ageInput}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (!/^\d*$/.test(raw)) {
                              return;
                            }
                            setAgeInput(raw);
                            if (raw === '') {
                              field.onChange(undefined);
                            } else {
                              field.onChange(Number(raw));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Gender *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="male" className="text-foreground hover:bg-gray-600">Male</SelectItem>
                          <SelectItem value="female" className="text-foreground hover:bg-gray-600">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Location *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-muted-foreground">Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400 min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground">
                      {field.value?.length || 0}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Religious & Personal Preferences */}
            <div className="bg-background/80 backdrop-blur-xl rounded-xl p-6 border border-amber-400/20">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                Religious & Personal Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="madhab"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Madhab *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Select your madhab" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="hanafi" className="text-foreground hover:bg-gray-600">Hanafi</SelectItem>
                          <SelectItem value="shafi" className="text-foreground hover:bg-gray-600">Shafi'i</SelectItem>
                          <SelectItem value="maliki" className="text-foreground hover:bg-gray-600">Maliki</SelectItem>
                          <SelectItem value="hanbali" className="text-foreground hover:bg-gray-600">Hanbali</SelectItem>
                          <SelectItem value="other" className="text-foreground hover:bg-gray-600">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prayer_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Prayer Frequency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Select prayer frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="always" className="text-foreground hover:bg-gray-600">Always</SelectItem>
                          <SelectItem value="usually" className="text-foreground hover:bg-gray-600">Usually</SelectItem>
                          <SelectItem value="sometimes" className="text-foreground hover:bg-gray-600">Sometimes</SelectItem>
                          <SelectItem value="rarely" className="text-foreground hover:bg-gray-600">Rarely</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marriage_timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Marriage Timeline *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Select marriage timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="asap" className="text-foreground hover:bg-gray-600">ASAP</SelectItem>
                          <SelectItem value="within_6_months" className="text-foreground hover:bg-gray-600">Within 6 months</SelectItem>
                          <SelectItem value="within_1_year" className="text-foreground hover:bg-gray-600">Within 1 year</SelectItem>
                          <SelectItem value="within_2_years" className="text-foreground hover:bg-gray-600">Within 2 years</SelectItem>
                          <SelectItem value="no_rush" className="text-foreground hover:bg-gray-600">No rush</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="will_relocate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-600 p-4 bg-gray-700">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-gray-600 rounded"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-muted-foreground">
                          Willing to relocate
                        </FormLabel>
                        <FormDescription className="text-muted-foreground">
                          Are you open to moving for marriage?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-card/50 rounded-xl p-6 border border-amber-400/10">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-amber-400" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ethnicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Ethnicity *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your ethnicity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Language *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your language"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legal_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Legal Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Select your legal status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="citizen" className="text-foreground hover:bg-gray-600">Citizen</SelectItem>
                          <SelectItem value="permanent_resident" className="text-foreground hover:bg-gray-600">Permanent Resident</SelectItem>
                          <SelectItem value="work_visa" className="text-foreground hover:bg-gray-600">Work Visa</SelectItem>
                          <SelectItem value="student_visa" className="text-foreground hover:bg-gray-600">Student Visa</SelectItem>
                          <SelectItem value="other" className="text-foreground hover:bg-gray-600">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marital_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Marital Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Select your marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="never_married" className="text-foreground hover:bg-gray-600">Never Married</SelectItem>
                          <SelectItem value="divorced" className="text-foreground hover:bg-gray-600">Divorced</SelectItem>
                          <SelectItem value="widowed" className="text-foreground hover:bg-gray-600">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hijabi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-600 p-4 bg-gray-700">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-gray-600 rounded"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-muted-foreground">
                          Hijabi
                        </FormLabel>
                        <FormDescription className="text-muted-foreground">
                          Do you wear hijab?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="divorced_with_kids"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-600 p-4 bg-gray-700">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-gray-600 rounded"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-muted-foreground">
                          Have Children
                        </FormLabel>
                        <FormDescription className="text-muted-foreground">
                          Do you have children from previous marriage?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-card/50 rounded-xl p-6 border border-amber-400/10">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-400" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Profession *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your profession"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Education *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your education level"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Enter your phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Interests Section */}
            <div className="bg-card/50 rounded-xl p-6 border border-amber-400/10">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-400" />
                Interests & Hobbies
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest..."
                    className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <Button
                    type="button"
                    onClick={addInterest}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black touch-target"
                  >
                    Add
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Your Interests *</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((interest, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium"
                          >
                            <span>{interest}</span>
                            <button
                              type="button"
                              onClick={() => removeInterest(interest)}
                              className="hover:bg-background/20 rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {field.value.length === 0 && (
                        <p className="text-muted-foreground text-sm">Add at least one interest to help find better matches</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Looking For Section */}
            <div className="bg-card/50 rounded-xl p-6 border border-amber-400/10">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-400" />
                Looking For
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="looking_for_age_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Minimum Age</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="18"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="looking_for_age_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Maximum Age</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="50"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="looking_for_ethnicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Preferred Ethnicity</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Any ethnicity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="looking_for_marital_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Preferred Marital Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Any marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="never_married" className="text-foreground hover:bg-gray-600">Never Married</SelectItem>
                          <SelectItem value="divorced" className="text-foreground hover:bg-gray-600">Divorced</SelectItem>
                          <SelectItem value="widowed" className="text-foreground hover:bg-gray-600">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="looking_for_legal_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Preferred Legal Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-foreground focus:border-amber-400">
                            <SelectValue placeholder="Any legal status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="citizen" className="text-foreground hover:bg-gray-600">Citizen</SelectItem>
                          <SelectItem value="permanent_resident" className="text-foreground hover:bg-gray-600">Permanent Resident</SelectItem>
                          <SelectItem value="work_visa" className="text-foreground hover:bg-gray-600">Work Visa</SelectItem>
                          <SelectItem value="student_visa" className="text-foreground hover:bg-gray-600">Student Visa</SelectItem>
                          <SelectItem value="other" className="text-foreground hover:bg-gray-600">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="looking_for_religious_sect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Preferred Religious Sect</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-foreground placeholder-gray-400 focus:border-amber-400"
                          placeholder="Any religious sect"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-muted-foreground hover:bg-gray-700 hover:text-foreground touch-target"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={uploading || saving}
                onClick={() => {
                  console.log('Save button clicked directly');
                  const values = form.getValues();
                  console.log('Form values from button click:', values);
                  onSubmit(values);
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold px-8"
              >
                {uploading || saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 