# OAuth Setup Guide for THE BEE HIVE

This guide explains how to set up Google and Apple OAuth providers in Supabase for the THE BEE HIVE application.

## 🌐 Live Application URLs

- **Production**: https://hive-gamma-one.vercel.app
- **Latest Deployment**: https://hive-gsvbl6gh5-ibnyusufabdul-3725s-projects.vercel.app

## 🔧 OAuth Providers Setup

### 1. Google OAuth Setup

#### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `https://hive-gamma-one.vercel.app/auth/callback`
   - `http://localhost:8080/auth/callback` (for development)

#### Step 2: Configure in Supabase
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Enable "Google" provider
4. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret

### 2. Apple OAuth Setup

#### Step 1: Create Apple Developer Account
1. Go to [Apple Developer](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Create an App ID for your application
4. Enable "Sign In with Apple" capability

#### Step 2: Create Service ID
1. In Apple Developer Console, go to "Certificates, Identifiers & Profiles"
2. Create a new "Services ID"
3. Enable "Sign In with Apple"
4. Configure your domain and redirect URLs

#### Step 3: Configure in Supabase
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Enable "Apple" provider
4. Add your Apple OAuth credentials:
   - **Client ID**: Your Apple Service ID
   - **Client Secret**: Your Apple private key (JWT format)

## 🎨 UI Features

The application now includes:

### OAuth Buttons
- **Google Sign-In**: White button with Google logo
- **Apple Sign-In**: Black button with Apple logo
- **Email Sign-In**: Traditional email/password form

### User Experience
- OAuth buttons appear at the top of both Sign In and Sign Up tabs
- Visual separator between OAuth and email options
- Loading states for all authentication methods
- Error handling with toast notifications
- Responsive design for mobile devices

## 🔒 Security Features

- OAuth tokens are handled securely by Supabase
- Automatic session management
- Secure redirect URLs
- CSRF protection
- Rate limiting

## 🚀 Deployment Status

✅ **Latest Features Deployed:**
- Google OAuth integration
- Apple OAuth integration
- Enhanced authentication UI
- Mobile-responsive OAuth buttons
- Improved user experience

## 📱 Testing

1. **Visit**: https://hive-gamma-one.vercel.app
2. **Test OAuth**: Click "Continue with Google" or "Continue with Apple"
3. **Test Email**: Use traditional email/password sign-in
4. **Mobile**: Test on mobile devices for responsive design

## ⚠️ Important Notes

1. **OAuth Setup Required**: The OAuth buttons will show errors until you configure the providers in Supabase
2. **Environment Variables**: Ensure your Supabase URL and keys are properly set
3. **Redirect URLs**: Make sure all redirect URLs are correctly configured
4. **Domain Verification**: Apple requires domain verification for production use

## 🛠️ Development

For local development:
1. Run `npm run dev`
2. Test OAuth at `http://localhost:8080`
3. Ensure local redirect URLs are configured in OAuth providers

## 📞 Support

If you encounter issues:
1. Check Supabase authentication logs
2. Verify OAuth provider configurations
3. Test with different browsers/devices
4. Check network connectivity and CORS settings 