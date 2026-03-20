# AI Search Assistant

A full-stack AI-powered web application similar to ChatGPT, enhanced with real-time search capabilities. This application combines the power of OpenAI's GPT models with live web search to provide accurate, up-to-date answers with sources.

## Features

- **AI-Powered Responses**: Uses OpenAI GPT-4 for intelligent, context-aware answers
- **Real-Time Web Search**: Integrates SerpAPI for live search results
- **Smart Query Generation**: Automatically generates multiple optimized search queries
- **Source Attribution**: Shows relevant sources with each answer
- **Chat History**: Persistent conversation storage with Supabase
- **Beautiful UI**: Modern, dark-mode ChatGPT-style interface
- **Responsive Design**: Works seamlessly on mobile and desktop
- **User Authentication**: Secure email/password authentication with Supabase

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Search**: SerpAPI
- **Authentication**: Supabase Auth

## Setup Instructions

### Prerequisites

1. OpenAI API Key - [Get one here](https://platform.openai.com/api-keys)
2. SerpAPI Key - [Get one here](https://serpapi.com/)

### Environment Variables

The `.env` file contains placeholders for your API keys. You need to add:

```env
OPENAI_API_KEY=your_openai_api_key_here
SERP_API_KEY=your_serpapi_key_here
```

### Configure Edge Function Secrets

You need to set up the API keys for the edge function. The edge function requires:
- `OPENAI_API_KEY` - Your OpenAI API key
- `SERP_API_KEY` - Your SerpAPI key

These secrets need to be configured in your Supabase project dashboard.

### Installation

```bash
npm install
npm run dev
```

## How It Works

1. **User Query**: User enters a question in the chat interface
2. **Query Generation**: AI generates 3-5 optimized search queries
3. **Web Search**: Queries are sent to SerpAPI to fetch real-time results
4. **Data Processing**: Results are filtered, deduplicated, and merged
5. **AI Response**: OpenAI processes the search data and generates a structured answer
6. **Display**: Response is shown with sources in a beautiful chat UI

## Database Schema

### Conversations Table
- `id`: Unique conversation identifier
- `user_id`: Reference to authenticated user
- `title`: Auto-generated from first message
- `created_at`, `updated_at`: Timestamps

### Messages Table
- `id`: Unique message identifier
- `conversation_id`: Reference to conversation
- `role`: 'user' or 'assistant'
- `content`: Message text
- `sources`: JSON array of search sources (optional)
- `created_at`: Timestamp

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own conversations and messages
- JWT-based authentication
- API keys stored securely as environment variables

## Architecture

```
User Input → Edge Function → [
  1. Generate Search Queries (OpenAI)
  2. Search Web (SerpAPI)
  3. Process & Filter Results
  4. Generate Response (OpenAI)
] → Display with Sources
```

## API Endpoints

### POST `/functions/v1/ai-search`
- **Description**: Main AI search endpoint
- **Body**: `{ query: string, conversationId: string }`
- **Response**: `{ response: string, sources: SearchSource[] }`

## Components

- **Auth**: Login/signup interface
- **ChatContainer**: Main chat interface with history
- **ChatMessage**: Individual message display with sources
- **ChatInput**: Message input with send button
- **ChatSidebar**: Conversation history and navigation
- **LoadingMessage**: Animated loading indicator

## Deployment

This application is optimized for deployment on:
- **Frontend**: Vercel, Netlify, or any static host
- **Backend**: Supabase (Edge Functions already deployed)
- **Database**: Supabase PostgreSQL

## Performance Optimizations

- Efficient search result deduplication
- Caching mechanisms in search API
- Optimized database queries with indexes
- Lazy loading of conversation history
- Real-time updates with Supabase subscriptions

## Future Enhancements

- Markdown and code block formatting in responses
- Copy response button
- Advanced typing animation
- Voice input support
- Export chat history
- Custom search sources
- Multi-language support
