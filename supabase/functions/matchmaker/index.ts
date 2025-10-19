import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Profile {
  id: string;
  age: number;
  gender: string;
  preferences: any;
}

// OpenAI-powered compatibility analysis
async function analyzeCompatibilityWithOpenAI(profile1: Profile, profile2: Profile): Promise<{score: number, reasoning: string}> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('OpenAI API key not found, falling back to custom algorithm');
    return {
      score: calculateCompatibility(profile1, profile2),
      reasoning: 'Custom algorithm analysis'
    };
  }

  try {
    const prompt = `
You are an expert Muslim matchmaking advisor. Analyze the compatibility between these two profiles and provide a compatibility score (0-1) and detailed reasoning.

Profile 1:
- Age: ${profile1.age}
- Gender: ${profile1.gender}
- Madhab: ${profile1.preferences?.madhab || 'Not specified'}
- Prayer Frequency: ${profile1.preferences?.prayer_frequency || 'Not specified'}
- Location: ${profile1.preferences?.location || 'Not specified'}
- Education: ${profile1.preferences?.education || 'Not specified'}
- Marriage Timeline: ${profile1.preferences?.marriage_timeline || 'Not specified'}
- Interests: ${profile1.preferences?.interests?.join(', ') || 'Not specified'}
- Looking for: Age ${profile1.preferences?.looking_for_age_min}-${profile1.preferences?.looking_for_age_max}, ${profile1.preferences?.looking_for_gender || 'Any'}

Profile 2:
- Age: ${profile2.age}
- Gender: ${profile2.gender}
- Madhab: ${profile2.preferences?.madhab || 'Not specified'}
- Prayer Frequency: ${profile2.preferences?.prayer_frequency || 'Not specified'}
- Location: ${profile2.preferences?.location || 'Not specified'}
- Education: ${profile2.preferences?.education || 'Not specified'}
- Marriage Timeline: ${profile2.preferences?.marriage_timeline || 'Not specified'}
- Interests: ${profile2.preferences?.interests?.join(', ') || 'Not specified'}
- Looking for: Age ${profile2.preferences?.looking_for_age_min}-${profile2.preferences?.looking_for_age_max}, ${profile2.preferences?.looking_for_gender || 'Any'}

Consider:
1. Religious compatibility (madhab, prayer frequency)
2. Age compatibility and preferences
3. Location and relocation willingness
4. Education and career alignment
5. Marriage timeline compatibility
6. Shared interests and values
7. Gender preferences match

Respond in JSON format:
{
  "score": 0.85,
  "reasoning": "Detailed explanation of compatibility factors"
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Muslim matchmaking advisor. Analyze compatibility and provide scores and reasoning in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      return {
        score: Math.max(0, Math.min(1, result.score)),
        reasoning: result.reasoning || 'AI analysis completed'
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        score: calculateCompatibility(profile1, profile2),
        reasoning: 'Fallback to custom algorithm due to parsing error'
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      score: calculateCompatibility(profile1, profile2),
      reasoning: 'Fallback to custom algorithm due to API error'
    };
  }
}

// Compatibility scoring function (fallback)
function calculateCompatibility(profile1: Profile, profile2: Profile): number {
  let score = 0;
  const weights = {
    religion: 0.30,
    location: 0.20,
    age: 0.15,
    education: 0.15,
    timeline: 0.10,
    interests: 0.10
  };

  const prefs1 = profile1.preferences || {};
  const prefs2 = profile2.preferences || {};

  // Religion compatibility (30%)
  if (prefs1.madhab && prefs2.madhab) {
    if (prefs1.madhab === prefs2.madhab) {
      score += weights.religion;
    } else if (prefs1.madhab === 'other' || prefs2.madhab === 'other') {
      score += weights.religion * 0.5;
    }
  }

  if (prefs1.prayer_frequency && prefs2.prayer_frequency) {
    const prayer1 = prefs1.prayer_frequency;
    const prayer2 = prefs2.prayer_frequency;
    if (prayer1 === prayer2) {
      score += weights.religion * 0.3;
    } else if (
      (prayer1 === 'always' && prayer2 === 'usually') ||
      (prayer1 === 'usually' && prayer2 === 'always') ||
      (prayer1 === 'usually' && prayer2 === 'sometimes') ||
      (prayer1 === 'sometimes' && prayer2 === 'usually')
    ) {
      score += weights.religion * 0.2;
    }
  }

  // Location compatibility (20%)
  if (prefs1.location && prefs2.location) {
    if (prefs1.location === prefs2.location) {
      score += weights.location;
    } else if (prefs1.will_relocate || prefs2.will_relocate) {
      score += weights.location * 0.7;
    }
  }

  // Age preference compatibility (15%)
  const age1 = profile1.age;
  const age2 = profile2.age;
  const ageDiff = Math.abs(age1 - age2);
  
  if (prefs1.looking_for_age_min && prefs1.looking_for_age_max) {
    if (age2 >= prefs1.looking_for_age_min && age2 <= prefs1.looking_for_age_max) {
      score += weights.age * 0.5;
    }
  }
  if (prefs2.looking_for_age_min && prefs2.looking_for_age_max) {
    if (age1 >= prefs2.looking_for_age_min && age1 <= prefs2.looking_for_age_max) {
      score += weights.age * 0.5;
    }
  }

  // Education compatibility (15%)
  if (prefs1.education && prefs2.education) {
    const edu1 = prefs1.education.toLowerCase();
    const edu2 = prefs2.education.toLowerCase();
    
    if (edu1 === edu2) {
      score += weights.education;
    } else if (
      (edu1.includes('phd') && edu2.includes('masters')) ||
      (edu1.includes('masters') && edu2.includes('phd')) ||
      (edu1.includes('bachelors') && edu2.includes('masters')) ||
      (edu1.includes('masters') && edu2.includes('bachelors'))
    ) {
      score += weights.education * 0.7;
    }
  }

  // Marriage timeline compatibility (10%)
  if (prefs1.marriage_timeline && prefs2.marriage_timeline) {
    const timeline1 = prefs1.marriage_timeline;
    const timeline2 = prefs2.marriage_timeline;
    
    if (timeline1 === timeline2) {
      score += weights.timeline;
    } else if (
      (timeline1 === 'asap' && timeline2 === 'within_6_months') ||
      (timeline1 === 'within_6_months' && timeline2 === 'asap') ||
      (timeline1 === 'within_6_months' && timeline2 === 'within_1_year') ||
      (timeline1 === 'within_1_year' && timeline2 === 'within_6_months')
    ) {
      score += weights.timeline * 0.7;
    }
  }

  // Interests overlap (10%)
  if (prefs1.interests && prefs2.interests && Array.isArray(prefs1.interests) && Array.isArray(prefs2.interests)) {
    const interests1 = new Set(prefs1.interests.map((i: string) => i.toLowerCase()));
    const interests2 = new Set(prefs2.interests.map((i: string) => i.toLowerCase()));
    const intersection = new Set([...interests1].filter(x => interests2.has(x)));
    const union = new Set([...interests1, ...interests2]);
    
    if (union.size > 0) {
      const overlap = intersection.size / union.size;
      score += weights.interests * overlap;
    }
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting matchmaker process...');

    // Get all complete profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .not('full_name', 'is', null)
      .not('age', 'is', null)
      .not('gender', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} complete profiles`);

    // Get existing matches to avoid duplicates
    const { data: existingMatches, error: matchesError } = await supabase
      .from('matches')
      .select('user1, user2');

    if (matchesError) {
      console.error('Error fetching existing matches:', matchesError);
      throw matchesError;
    }

    const existingPairs = new Set(
      existingMatches?.map(match => 
        [match.user1, match.user2].sort().join('-')
      ) || []
    );

    let newMatches = 0;
    let notifications = 0;
    const compatibilityThreshold = 0.3; // Minimum compatibility score to create a match

    // Generate potential matches with compatibility scores
    const potentialMatches: Array<{
      profile1: Profile;
      profile2: Profile;
      score: number;
    }> = [];

    for (let i = 0; i < (profiles?.length || 0); i++) {
      for (let j = i + 1; j < (profiles?.length || 0); j++) {
        const profile1 = profiles![i];
        const profile2 = profiles![j];

        // Skip if same gender
        if (profile1.gender === profile2.gender) continue;

        // Skip if already matched
        const pairKey = [profile1.id, profile2.id].sort().join('-');
        if (existingPairs.has(pairKey)) continue;

        // Calculate compatibility score using OpenAI
        const aiAnalysis = await analyzeCompatibilityWithOpenAI(profile1, profile2);
        const compatibilityScore = aiAnalysis.score;
        
        // Only consider matches above threshold
        if (compatibilityScore >= compatibilityThreshold) {
          potentialMatches.push({
            profile1,
            profile2,
            score: compatibilityScore
          });
        }
      }
    }

    // Sort by compatibility score (highest first)
    potentialMatches.sort((a, b) => b.score - a.score);

    // Create matches (limit to top 50 to avoid overwhelming users)
    const maxMatches = Math.min(50, potentialMatches.length);
    
    for (let i = 0; i < maxMatches; i++) {
      const { profile1, profile2, score } = potentialMatches[i];

      // Sort user IDs to satisfy user1 < user2 constraint
      const [user1, user2] = [profile1.id, profile2.id].sort();
      
        // Create match with compatibility score and AI reasoning
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user1,
            user2,
            created_by: profile1.id,
            status_user1: 'pending',
            status_user2: 'pending',
            compatibility_score: score,
            ai_reasoning: aiAnalysis.reasoning
          });

      if (matchError) {
        console.error('Error creating match:', matchError);
        continue;
      }

      // Create notifications for both users
      const notificationPromises = [
        supabase.from('notifications').insert({
          user_id: profile1.id,
          type: 'new_match',
          title: 'New Match!',
          message: `You have a new compatible match (${Math.round(score * 100)}% compatibility)`,
          payload: { matched_user: profile2.id, compatibility_score: score }
        }),
        supabase.from('notifications').insert({
          user_id: profile2.id,
          type: 'new_match',
          title: 'New Match!',
          message: `You have a new compatible match (${Math.round(score * 100)}% compatibility)`,
          payload: { matched_user: profile1.id, compatibility_score: score }
        })
      ];

      await Promise.all(notificationPromises);

      newMatches++;
      notifications += 2;

      console.log(`Created match between ${profile1.id} and ${profile2.id} with ${Math.round(score * 100)}% compatibility`);
    }

    const summary = {
      status: 'success',
      profiles_processed: profiles?.length || 0,
      new_matches_created: newMatches,
      notifications_sent: notifications,
      timestamp: new Date().toISOString()
    };

    console.log('Matchmaker completed:', summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in matchmaker function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);