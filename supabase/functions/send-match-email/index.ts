// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  match_id: string;
  user1_id: string;
  user2_id: string;
  type?: 'new_match' | 'match_accepted' | 'match_rejected' | 'new_message';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { match_id, user1_id, user2_id, type = 'new_match' }: EmailData = await req.json();

    if (!match_id || !user1_id || !user2_id) {
      throw new Error('Missing required parameters');
    }

    // Allow disabling emails in non-production environments
    const sendEmails = (Deno.env.get('SEND_EMAILS') || 'true').toLowerCase() === 'true';
    if (!sendEmails) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sending disabled (SEND_EMAILS=false)' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Get user profiles from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('full_name, email, photo_url')
      .in('id', [user1_id, user2_id]);

    if (profilesError || !profiles || profiles.length !== 2) {
      throw new Error('Failed to fetch user profiles');
    }

    const [user1, user2] = profiles;
    const recipient = type === 'new_match' ? user1 : user2;
    const otherUser = type === 'new_match' ? user2 : user1;

    // Create email content based on type
    let subject: string;
    let htmlContent: string;

    switch (type) {
      case 'new_match':
        subject = `New Match on Bee Hive Match! 🐝`;
        htmlContent = createNewMatchEmail(recipient.full_name, otherUser.full_name, otherUser.photo_url);
        break;
      case 'match_accepted':
        subject = `Your match accepted! 💕`;
        htmlContent = createMatchAcceptedEmail(recipient.full_name, otherUser.full_name);
        break;
      case 'match_rejected':
        subject = `Match update from Bee Hive Match`;
        htmlContent = createMatchRejectedEmail(recipient.full_name, otherUser.full_name);
        break;
      case 'new_message':
        subject = `New message from ${otherUser.full_name}`;
        htmlContent = createNewMessageEmail(recipient.full_name, otherUser.full_name);
        break;
      default:
        throw new Error('Invalid email type');
    }

    // Sender: configurable, with safe default for testing
    const from = Deno.env.get('RESEND_FROM') || 'onboarding@resend.dev';

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient.email],
        subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      let errorText = await emailResponse.text();
      try {
        const errorData = JSON.parse(errorText);
        errorText = errorData.message || JSON.stringify(errorData);
      } catch (_) {}
      throw new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
    }

    const emailData = await emailResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: emailData.id,
        to: recipient.email,
        type,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

// Email template functions
function createNewMatchEmail(recipientName: string, matchName: string, matchPhoto?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Match - Bee Hive Match</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FFD700; font-size: 28px; margin: 0;">🐝 Bee Hive Match</h1>
        <p style="color: #666; margin: 5px 0;">Muslim Matchmaking Platform</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #000; margin: 0; font-size: 24px;">New Match Found! 💕</h2>
        <p style="color: #000; margin: 10px 0; font-size: 16px;">We found someone special for you</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-top: 0;">Hello ${recipientName},</h3>
        <p>Great news! We've found a potential match for you:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          ${matchPhoto ? `<img src="${matchPhoto}" alt="${matchName}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #FFD700;">` : ''}
          <h4 style="color: #FFD700; margin: 10px 0;">${matchName}</h4>
        </div>
        
        <p>This match was created using our AI compatibility system, which considers factors like:</p>
        <ul style="color: #666;">
          <li>Religious compatibility (Madhab, prayer frequency)</li>
          <li>Location and relocation preferences</li>
          <li>Age preferences and compatibility</li>
          <li>Education and profession alignment</li>
          <li>Marriage timeline compatibility</li>
          <li>Shared interests and hobbies</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${Deno.env.get('SITE_URL') || 'https://beehivematch.com'}/dashboard" 
           style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          View Your Match
        </a>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <p>Best regards,<br>The Bee Hive Match Team</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function createMatchAcceptedEmail(recipientName: string, matchName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Match Accepted - Bee Hive Match</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FFD700; font-size: 28px; margin: 0;">🐝 Bee Hive Match</h1>
      </div>
      
      <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">Match Accepted! 🎉</h2>
        <p style="color: #fff; margin: 10px 0; font-size: 16px;">${matchName} has accepted your match</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-top: 0;">Hello ${recipientName},</h3>
        <p>Great news! ${matchName} has accepted your match. You can now start communicating and getting to know each other better.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${Deno.env.get('SITE_URL') || 'https://beehivematch.com'}/messages" 
           style="background: linear-gradient(135deg, #4CAF50, #45a049); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          Start Conversation
        </a>
      </div>
    </body>
    </html>
  `;
}

function createMatchRejectedEmail(recipientName: string, matchName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Match Update - Bee Hive Match</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FFD700; font-size: 28px; margin: 0;">🐝 Bee Hive Match</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-top: 0;">Hello ${recipientName},</h3>
        <p>We wanted to let you know that ${matchName} has decided not to proceed with the match at this time.</p>
        <p>Don't worry - we'll continue working to find you the perfect match! Our AI system is constantly learning and improving to provide better matches.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${Deno.env.get('SITE_URL') || 'https://beehivematch.com'}/dashboard" 
           style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          Browse More Matches
        </a>
      </div>
    </body>
    </html>
  `;
}

function createNewMessageEmail(recipientName: string, senderName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Message - Bee Hive Match</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FFD700; font-size: 28px; margin: 0;">🐝 Bee Hive Match</h1>
      </div>
      
      <div style="background: linear-gradient(135deg, #2196F3, #1976D2); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">New Message! 💬</h2>
        <p style="color: #fff; margin: 10px 0; font-size: 16px;">${senderName} sent you a message</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-top: 0;">Hello ${recipientName},</h3>
        <p>You have received a new message from ${senderName}. Don't keep them waiting!</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${Deno.env.get('SITE_URL') || 'https://beehivematch.com'}/messages" 
           style="background: linear-gradient(135deg, #2196F3, #1976D2); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          Read Message
        </a>
      </div>
    </body>
    </html>
  `;
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-match-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
