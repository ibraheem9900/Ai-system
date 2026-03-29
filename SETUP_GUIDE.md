# AI Search Assistant - Setup Guide

## Prerequisites

You need two API keys to make this application work:

1. **OpenAI API Key** - For AI responses and query generation
2. **SerpAPI Key** - For real-time web search

## Getting Your API Keys

### OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to [API Keys section](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-proj-`)
6. Keep this key safe - you won't be able to see it again

### SerpAPI Key

1. Go to [serpapi.com](https://serpapi.com)
2. Sign up for a free account
3. Go to your [dashboard](https://serpapi.com/dashboard)
4. Copy your API key
5. SerpAPI offers free tier with 100 searches/month

## Configuring Secrets in Supabase

The API keys need to be configured as **Edge Function Secrets** in your Supabase project.

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Log in to your project
   - Select your project

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Find the `ai-search` function
   - Click on it to open details

3. **Add Secrets**
   - Look for the "Secrets" section
   - Click "New Secret"
   - Add the first secret:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Paste your OpenAI API key
     - Click "Save secret"

   - Click "New Secret" again
   - Add the second secret:
     - **Name**: `SERP_API_KEY`
     - **Value**: Paste your SerpAPI key
     - Click "Save secret"

4. **Verify Secrets Are Set**
   - Both secrets should appear in the Secrets section
   - Refresh the page to confirm they're saved

## Testing the Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Create an account**
   - Use any email and password (email verification is disabled)
   - Sign up and log in

3. **Send a test message**
   - Try asking a simple question like "What is the capital of France?"
   - Wait for the response (may take 10-20 seconds for first request)
   - Check browser console (F12) for debugging info

4. **Test multiple languages**
   - Try: "¿Cuál es la capital de España?" (Spanish)
   - Try: "Qu'est-ce que l'intelligence artificielle?" (French)
   - Try: "日本の首都は何ですか?" (Japanese)

## Troubleshooting

### Issue: "API keys not configured"

**Solution**:
- Go back to Supabase dashboard
- Make sure you added both `OPENAI_API_KEY` and `SERP_API_KEY`
- The secrets are case-sensitive

### Issue: "OpenAI API error"

**Possible causes**:
- Invalid OpenAI API key
- Your OpenAI account doesn't have credits
- Rate limit exceeded

**Solution**:
- Verify the API key is correct
- Check your OpenAI account has available credits
- Wait a few minutes before retrying

### Issue: "SerpAPI error"

**Possible causes**:
- Invalid SerpAPI key
- Free tier quota exceeded (100 searches/month)

**Solution**:
- Verify the API key is correct
- Check your SerpAPI quota at [serpapi.com/dashboard](https://serpapi.com/dashboard)
- Upgrade to a paid plan if needed

### Issue: Slow responses

**Normal behavior**:
- First response takes 10-20 seconds (normal)
- This is because the function:
  1. Generates 3-5 search queries with AI
  2. Searches the web for each query
  3. Processes all results
  4. Generates a comprehensive answer

### Issue: Getting errors in browser console

**How to debug**:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Send a message and watch the logs
4. Look for error messages that explain what went wrong
5. Share the error message for help

## Local Development

For local testing without deploying to Supabase, you can add the keys to a `.env.local` file:

```env
OPENAI_API_KEY=your_key_here
SERP_API_KEY=your_key_here
```

However, **Edge Functions must be deployed** and secrets configured in Supabase for production use.

## Production Deployment

### Deploy to Vercel (Frontend)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Edge Functions (Backend)

Edge Functions are already deployed to Supabase. Just make sure:
- API secrets are configured in Supabase dashboard
- The `ai-search` function shows "Active" status

## Features Overview

Once properly configured, you can:

✅ Ask questions in any language
✅ Get real-time web search results
✅ See source links for transparency
✅ Have persistent chat history
✅ Use on mobile and desktop
✅ Copy and share responses

## Getting Help

If something isn't working:

1. **Check the error message** in the chat (it will tell you what's wrong)
2. **Open browser console** (F12) for detailed logs
3. **Verify API keys** are in Supabase secrets, not local .env
4. **Check API quotas** at OpenAI and SerpAPI dashboards
5. **Restart the dev server** after adding/updating secrets

## Security Notes

- Never commit API keys to version control
- API keys are stored as Supabase secrets (secure)
- Edge Functions use JWT verification for safety
- Database uses Row Level Security (RLS)
- All data is encrypted in transit
