import React from 'react';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import PhotoGallery from './PhotoGallery';

export interface ProfileCardProps {
  profile: {
    full_name: string;
    photo_url?: string;
    photos?: string[];
    bio?: string;
    interests?: string[];
    age?: number;
    location?: string;
    madhab?: string;
    prayer_frequency?: string;
    marriage_timeline?: string;
    profession?: string;
    verified?: boolean;
    verification_status?: string;
  };
  children?: React.ReactNode; // For custom action buttons
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, children }) => {
  const photos = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : profile.photo_url ? [profile.photo_url] : [];

  return (
    <Card className="bg-background/90 border-amber-400/30 shadow-xl rounded-2xl max-w-md mx-auto p-4 sm:p-6 flex flex-col text-center">
      {/* Profile Photos Gallery */}
      <div className="mb-4 sm:mb-6">
        {photos.length > 0 ? (
          <PhotoGallery 
            photos={photos} 
            className="w-full max-w-sm mx-auto"
            showThumbnails={photos.length > 1}
            maxThumbnails={4}
          />
        ) : (
          <Avatar className="h-32 w-32 mx-auto border-4 border-amber-400/40 shadow-glow">
            <AvatarFallback className="bg-amber-400/20 text-amber-400 text-3xl">
              {profile.full_name?.[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      {/* Name and Tagline */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-wide mb-1 uppercase letter-spacing-wider">
        {profile.full_name}
      </h2>
      <div className="w-12 sm:w-16 h-1 bg-amber-400 rounded-full mx-auto mb-2 sm:mb-4" />
      {profile.bio && <div className="text-amber-400 text-base sm:text-lg font-medium mb-4 sm:mb-6">{profile.bio}</div>}
      {/* Verification Badge */}
      {(profile.verified || profile.verification_status === 'verified') && (
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30 mb-4">Verified</Badge>
      )}
      {/* Two-column layout */}
      <div className="w-full flex flex-col md:flex-row gap-4 sm:gap-6 justify-between mb-4 sm:mb-6 mt-2">
        {/* Interests */}
        <div className="flex-1">
          <div className="text-foreground font-bold text-xs sm:text-sm mb-1 sm:mb-2 tracking-wide">MY INTERESTS</div>
          <div className="flex flex-col gap-1 sm:gap-2 items-start">
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((tag, idx) => (
                <span key={idx} className="border border-amber-400 text-amber-400 bg-background/60 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-xs">No interests listed</span>
            )}
          </div>
        </div>
        {/* Match Preferences */}
        <div className="flex-1 mt-2 md:mt-0">
          <div className="text-foreground font-bold text-xs sm:text-sm mb-1 sm:mb-2 tracking-wide">MATCH PREFERENCES</div>
          <div className="text-left text-muted-foreground text-xs sm:text-sm space-y-1">
            {profile.age && <div><span className="text-muted-foreground">Age</span> <span className="text-foreground font-medium">{profile.age} years</span></div>}
            {profile.location && <div><span className="text-muted-foreground">Location</span> <span className="text-foreground font-medium">{profile.location}</span></div>}
            {profile.madhab && <div><span className="text-muted-foreground">Madhhab</span> <span className="text-foreground font-medium">{profile.madhab}</span></div>}
            {profile.prayer_frequency && <div><span className="text-muted-foreground">Prayer</span> <span className="text-foreground font-medium">{profile.prayer_frequency}</span></div>}
            {profile.marriage_timeline && <div><span className="text-muted-foreground">Marriage</span> <span className="text-foreground font-medium">{profile.marriage_timeline}</span></div>}
            {profile.profession && <div><span className="text-foreground font-medium">{profile.profession}</span></div>}
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      {children && <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full mt-2 sm:mt-4">{children}</div>}
    </Card>
  );
}; 