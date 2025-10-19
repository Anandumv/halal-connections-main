import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfileCard } from '@/components/ProfileCard';

interface Profile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  bio: string;
  photo_url: string;
  location?: string;
  madhab?: string;
  marriage_timeline?: string;
  profession?: string;
  prayer_frequency?: string;
  interests?: string[];
  verification_status?: string;
  role?: string;
}

const AdminProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
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
        .select("*")
        .eq("verification_status", "pending");
      if (!error && data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, [isAdmin]);

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
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">Back to Dashboard</Button>
        <h1 className="text-3xl font-bold mb-6">Pending Profile Verifications</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile}>
              <Button className="flex-1 bg-green-500/80 text-foreground font-bold py-2 rounded-lg shadow-glow hover:bg-green-600 transition-all text-md" onClick={() => handleVerify(profile.id, 'verified')}>Verify</Button>
              <Button className="flex-1 bg-red-500/80 text-foreground font-bold py-2 rounded-lg shadow-glow hover:bg-red-600 transition-all text-md" onClick={() => handleVerify(profile.id, 'rejected')}>Reject</Button>
            </ProfileCard>
          ))}
        </div>
        {profiles.length === 0 && <div className="text-center text-muted-foreground mt-12">No pending profiles.</div>}
      </div>
    </div>
  );

  async function handleVerify(id: string, status: 'verified' | 'rejected') {
    await supabase.from("profiles").update({ verification_status: status }).eq("id", id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }
};

export default AdminProfiles; 