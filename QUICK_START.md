# Quick Start - Get Your AI Search Working in 5 Minutes

## What Changed

Your app now uses **Groq** instead of OpenAI. This is better because:
- ✅ **FREE** - No credit card needed
- ✅ **Unlimited** - No quota limits
- ✅ **Fast** - Super quick responses
- ✅ **Always works** - No billing issues

## Step 1: Get Groq API Key (1 minute)

1. Go to: https://console.groq.com/keys
2. Sign up (use your email, super quick)
3. Click "Create API Key"
4. Copy your key (starts with `gsk_`)

## Step 2: Add Key to Supabase (2 minutes)

1. Go to your Supabase Dashboard: https://supabase.com
2. Select your project
3. Click **Edge Functions** (left sidebar)
4. Find **ai-search** function
5. Look for **Secrets** section
6. Click **New Secret**
   - Name: `GROQ_API_KEY`
   - Value: Paste your Groq key
   - Click Save

You should now have 3 secrets:
- `GROQ_API_KEY` ← New one
- `SERP_API_KEY` ← Already there
- (Plus other Supabase defaults)

## Step 3: Test It! (2 minutes)

1. Go back to your app
2. Sign in (any email/password)
3. Ask a question:
   - "What is artificial intelligence?"
   - "¿Cuál es la capital de Francia?" (Spanish)
   - "日本について教えてください" (Japanese)

4. Wait 10-15 seconds for response
5. Check the browser console (F12) for logs if something seems slow

## What Happens When You Ask a Question

1. **Your message** → Sent to our AI
2. **Search queries generated** → AI creates 3-5 smart searches
3. **Google search** → Real-time data from SerpAPI
4. **Results processed** → Filtered and formatted
5. **AI response** → Groq generates answer with sources
6. **Display** → Beautiful chat format with links

## Features That Work

✅ **Any language** - English, Spanish, French, Japanese, Arabic, etc.
✅ **Real-time search** - Fresh data from Google
✅ **Source links** - See where info comes from
✅ **Chat history** - All conversations saved
✅ **Mobile friendly** - Works on phone too
✅ **Beautiful UI** - Dark mode, smooth animations

## If Something Goes Wrong

### "API keys not configured" error
- **Fix**: Make sure you added `GROQ_API_KEY` to Supabase secrets
- **Check**: Go to Edge Functions > ai-search > Secrets tab

### "Groq API error" message
- **Fix**: Make sure your Groq key is correct
- **Check**: Copy-paste from https://console.groq.com/keys again

### "No search results"
- This is okay! The AI will still answer based on its knowledge
- Some topics may have limited search results

### App is slow
- **First request**: 10-20 seconds is normal
- **Subsequent requests**: 5-10 seconds
- This is normal as it searches the web

## API Keys Summary

| Service | Key Name | Status | Cost |
|---------|----------|--------|------|
| Groq (AI) | `GROQ_API_KEY` | Required | FREE |
| SerpAPI (Search) | `SERP_API_KEY` | Required | FREE (100/month) |
| Supabase | Auto configured | Required | FREE |

## Need Help?

1. **Check browser console** - F12 → Console tab → Look for error messages
2. **Check Supabase secrets** - Make sure both keys are saved
3. **Restart app** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check your internet** - Make sure you're connected

## That's It!

Your AI search assistant is ready to use. Start asking questions and enjoy accurate, real-time answers with sources!

---

**Pro tip**: You can run multiple queries and have full conversations. Each chat is saved in your sidebar so you can come back to them anytime.
