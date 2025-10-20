import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Profile {
  id: string;
  full_name: string;
  photo_url: string;
  verification_status: string;
  role?: string;
}

const AdminMatchmaker = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return setIsAdmin(false);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!error && data && data.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (isAdmin !== true) return;
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, photo_url, verification_status")
        .eq("verification_status", "verified");
      if (!error && data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, [isAdmin]);

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((uid) => uid !== id)
        : prev.length < 2
        ? [...prev, id]
        : [id]
    );
  };

  const handleCreateMatch = async () => {
    if (selected.length !== 2) return;
    const [user1, user2] = selected.sort(); // Sort IDs to satisfy user1 < user2 constraint
    
    try {
      // Create the match with pending status
      const { error: matchError } = await supabase
        .from("matches")
        .insert({ 
          user1, 
          user2, 
          status_user1: 'pending',
          status_user2: 'pending',
          created_by: user?.id
        });

      if (matchError) throw matchError;

      // Create notifications for both users
      const user1Profile = profiles.find(p => p.id === user1);
      const user2Profile = profiles.find(p => p.id === user2);

      const notificationPromises = [
        supabase.from('notifications').insert({
          user_id: user1,
          type: 'new_match',
          title: 'New Match Available!',
          message: `You have a new match with ${user2Profile?.full_name}. Please review and respond.`,
          payload: { match_id: `${user1}-${user2}` }
        }),
        supabase.from('notifications').insert({
          user_id: user2,
          type: 'new_match',
          title: 'New Match Available!',
          message: `You have a new match with ${user1Profile?.full_name}. Please review and respond.`,
          payload: { match_id: `${user1}-${user2}` }
        })
      ];

      await Promise.all(notificationPromises);

      setSuccess(`Match created between ${user1Profile?.full_name} and ${user2Profile?.full_name}. Both users have been notified.`);
      setSelected([]);
    } catch (error) {
      console.error('Error creating match:', error);
      setSuccess('Error creating match. Please try again.');
    }
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6 text-muted-foreground">You do not have permission to view this page.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (loading || isAdmin === null) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">Back to Dashboard</Button>
        <h1 className="text-3xl font-bold mb-6">Admin Matchmaker</h1>
        <p className="mb-4 text-muted-foreground">Select two verified users to create a match.</p>
        {success && <div className="mb-4 text-success font-semibold">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={`cursor-pointer border-2 ${selected.includes(profile.id) ? 'border-primary' : 'border-transparent'}`}
              onClick={() => handleSelect(profile.id)}
            >
              <CardHeader>
                <CardTitle>{profile.full_name}</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.photo_url && (
                  <img 
                    src={profile.photo_url} 
                    alt={profile.full_name} 
                    className="w-24 h-24 rounded-full mb-2 cursor-pointer hover:scale-105 transition-transform duration-200" 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Create a modal to show the image in full size
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
                      modal.onclick = () => modal.remove();
                      
                      const content = document.createElement('div');
                      content.className = 'relative max-w-2xl w-full mx-2 sm:mx-4 rounded-3xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-4 border-amber-400/60 shadow-2xl p-6 sm:p-8';
                      content.onclick = e => e.stopPropagation();
                      
                      const closeBtn = document.createElement('button');
                      closeBtn.className = 'absolute top-4 right-4 text-amber-400 hover:text-foreground bg-background/30 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all duration-300';
                      closeBtn.innerHTML = '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
                      closeBtn.onclick = () => modal.remove();
                      
                      const img = document.createElement('img');
                      img.src = profile.photo_url;
                      img.alt = `${profile.full_name}'s profile photo`;
                      img.className = 'w-full h-auto max-h-96 object-cover rounded-xl';
                      
                      const title = document.createElement('h3');
                      title.className = 'text-2xl font-bold text-foreground mb-2 mt-4 text-center';
                      title.textContent = profile.full_name;
                      
                      const subtitle = document.createElement('p');
                      subtitle.className = 'text-muted-foreground text-sm text-center mb-4';
                      subtitle.textContent = 'Profile Photo';
                      
                      content.appendChild(closeBtn);
                      content.appendChild(img);
                      content.appendChild(title);
                      content.appendChild(subtitle);
                      modal.appendChild(content);
                      document.body.appendChild(modal);
                    }}
                  />
                )}
                <div className="mt-2 text-xs text-muted-foreground">ID: {profile.id}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          variant="hero"
          size="lg"
          disabled={selected.length !== 2}
          onClick={handleCreateMatch}
        >
          Create Match
        </Button>
      </div>
    </div>
  );
};

export default AdminMatchmaker; 