// ─── Conversational AI — client-side, instant, personality-aware ─────────────
// Handles casual/emotional messages without any API call.
// Only actual knowledge/search queries go to the edge function.

type Personality = 'general' | 'education' | 'tech' | 'business' | 'emotional';

// ─── Pattern detection ────────────────────────────────────────────────────────

type ConvoType =
  | 'greeting'
  | 'how_are_you'
  | 'user_positive'
  | 'user_negative'
  | 'user_excited'
  | 'thanks'
  | 'bye'
  | 'identity'
  | 'compliment'
  | 'laughter'
  | 'agreement'
  | 'lonely'
  | 'stressed'
  | 'bored'
  | 'short_casual';

const PATTERNS: Array<{ type: ConvoType; regex: RegExp }> = [
  { type: 'greeting',     regex: /^(hey|hi|hello|hiya|yo|sup|what'?s up|whats up|howdy|greetings|ola|salut|ciao|bonjour|hola|marhaba|salam|مرحبا|أهلاً|سلام)[\s!?.]*$/i },
  { type: 'how_are_you',  regex: /^how are you(\s+(doing|going|today|feeling|holding up))?[\s!?.]*$/i },
  { type: 'how_are_you',  regex: /^(you okay|u ok|are you ok|you good|u good|how do you feel)[\s!?.]*$/i },
  { type: 'user_positive',regex: /^(i'?m|i am|im)\s+(feeling\s+)?(good|fine|great|okay|ok|well|amazing|awesome|fantastic|wonderful|excellent|blessed|happy|excited|pumped)[\s!?.]*$/i },
  { type: 'user_positive',regex: /^(doing good|doing great|doing well|feeling great|feeling good|not bad|pretty good|all good|all is well|can'?t complain)[\s!?.]*$/i },
  { type: 'user_negative', regex: /^(i'?m|i am|im)\s+(feeling\s+)?(bad|sad|tired|exhausted|stressed|anxious|depressed|lonely|lost|confused|overwhelmed|scared|worried|nervous|down|low|not great|not good|terrible|awful|horrible)[\s!?.]*$/i },
  { type: 'user_negative', regex: /^(not (so )?good|not doing well|not great|having a bad (day|time)|feel (awful|terrible|horrible|sad|bad|depressed))[\s!?.]*$/i },
  { type: 'user_excited',  regex: /^(i'?m|i am|im)\s+(so\s+|very\s+|really\s+)?(excited|happy|thrilled|pumped|stoked|hyped|ecstatic|over the moon)[\s!?.]*$/i },
  { type: 'thanks',       regex: /^(thanks?|thank you|thx|ty|ty so much|thank you so much|thanks a lot|thank you so much|appreciate it|much appreciated|شكرا|شكراً|merci|gracias|cheers)[\s!?,!.]*$/i },
  { type: 'bye',          regex: /^(bye|goodbye|good night|good morning|good afternoon|good evening|gn|see you|see ya|take care|cya|later|ttyl|talk later|farewell|until next time)[\s!?.]*$/i },
  { type: 'identity',     regex: /^(who are you|what are you|what is your name|what'?s your name|who made you|are you (an? )?ai|are you (a )?robot|are you human|what can you do|tell me about yourself|introduce yourself|who is ita|what is ita)[\s!?.]*$/i },
  { type: 'compliment',   regex: /^(you'?re (so )?(great|amazing|awesome|smart|brilliant|helpful|the best|fantastic|cool|perfect|intelligent)|you are (so )?(great|amazing|awesome|smart|brilliant|helpful)|you'?re good|you rock|good (job|bot|ai|one))[\s!?.]*$/i },
  { type: 'laughter',     regex: /^(lol|lmao|haha|hehe|lmfao|rofl|😂|😄|😅|xd|ha ha|he he)[\s!?.]*$/i },
  { type: 'agreement',    regex: /^(yes|yeah|yep|yup|sure|ok|okay|alright|got it|i see|makes sense|understood|correct|exactly|right|true|absolutely|definitely|of course|for sure|totally|100|100%)[\s!?.]*$/i },
  { type: 'lonely',       regex: /^(i'?m (so |really |very )?lonely|i feel (so |really )?(alone|lonely)|i (don'?t|dont) have (anyone|anyone to talk to|friends)|no one (is there|talks to me))[\s!?.]*$/i },
  { type: 'stressed',     regex: /^(i'?m (so |very |really )?(stressed|anxious|overwhelmed|burned out|burnt out)|i (can'?t|cant) (handle|take) this|this is (too much|overwhelming)|i'?m under (a lot of )?pressure)[\s!?.]*$/i },
  { type: 'bored',        regex: /^(i'?m (so |really )?(bored|bored out of my mind)|i have nothing to do|i'?m boring|entertain me|i need something to do)[\s!?.]*$/i },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectType(query: string): ConvoType | null {
  const q = query.trim();
  const words = q.split(/\s+/);

  for (const { type, regex } of PATTERNS) {
    if (regex.test(q)) return type;
  }

  // Very short (≤3 words) message with no factual intent
  if (
    words.length <= 3 &&
    !q.match(/^(what|how|why|when|where|who|which|is |are |can |does |do |will |should |would |define |explain |list |show |give |find |search |tell me about |calculate |convert |translate )/i)
  ) {
    return 'short_casual';
  }

  return null;
}

// ─── Responses per personality ────────────────────────────────────────────────

const RESPONSES: Record<ConvoType, Record<Personality, string[]>> = {
  greeting: {
    general: [
      "Hey! 👋 Good to see you. What's on your mind?",
      "Hi there! What can I help you explore today?",
      "Hello! What are we looking into today?",
      "Hey! Great to have you here. What do you need?",
    ],
    emotional: [
      "Hey! 💙 So happy you're here. How are you feeling today?",
      "Hi! 😊 It's so lovely to hear from you. What's going on?",
      "Hey there! Always great to see you. How's your day going?",
      "Hello! 🌟 You've made my day by showing up. What's on your heart today?",
    ],
    tech: [
      "Hey! What are we building or debugging today?",
      "Hi! What tech challenge can I help you crack?",
      "Hello! Ready to dive in — what are you working on?",
      "Hey! What's the problem? Let's solve it.",
    ],
    education: [
      "Hey! Great to see you. What would you like to learn today?",
      "Hi! Ready to explore something new together? 📚",
      "Hello! What topic are we diving into today?",
      "Hey there! Curiosity is the best thing. What's your question?",
    ],
    business: [
      "Hello! What business challenge can I help you tackle today?",
      "Hi! Ready to think through your next move. What's the situation?",
      "Hey! What are we strategizing about today?",
      "Hello! Let's get to work. What do you need?",
    ],
  },

  how_are_you: {
    general: [
      "I'm doing great, thanks for asking! 😄 What's on your mind?",
      "All good on my end! Ready to help. What are you working on?",
      "Feeling sharp and ready to go! What can I do for you?",
      "Doing well! More importantly, how are YOU doing?",
    ],
    emotional: [
      "I'm doing really well, thank you for asking — that's so thoughtful of you! 💙 How about you? How are you feeling?",
      "I'm great, thanks! But I care more about how you're doing. How's your day been?",
      "Honestly, every conversation makes my day better! 😊 How are you feeling right now?",
      "I'm wonderful! Especially now that you're here. How about you — how are you really doing?",
    ],
    tech: [
      "Running smoothly! No bugs on my end 😄 What tech issue are you dealing with?",
      "All systems operational! What are we debugging today?",
      "I'm good — clocked in and ready to code. What's the challenge?",
    ],
    education: [
      "I'm doing great and excited to learn alongside you! How are you doing? 😊",
      "Really well! I love when you ask — it shows you care. What shall we learn today?",
      "Fantastic! Ready for another session of discovery. How are you doing?",
    ],
    business: [
      "Doing well and focused. Thanks for asking. What are we working on today?",
      "All good — sharp and ready. What's the business challenge?",
      "I'm good. What matters more is whether you're getting what you need. What's up?",
    ],
  },

  user_positive: {
    general: [
      "That's awesome to hear! 🙌 What's going on today?",
      "Love that! Keep that energy going. What can I help you with?",
      "Great to hear you're doing well! What's on your mind?",
    ],
    emotional: [
      "That makes me so happy to hear! 🌟 You deserve to feel good. What's got you in such a great mood?",
      "Yay! I love hearing that. 💙 What's been making things good lately?",
      "That's wonderful! When you're feeling good, the whole world opens up. What are you up to today?",
    ],
    tech: [
      "Nice! Good energy = good code. What are we working on?",
      "Great! Let's use that momentum — what's the project?",
    ],
    education: [
      "That's the spirit! 😊 A clear mind learns so much faster. What shall we explore?",
      "Wonderful! This is the perfect mindset for learning. What topic interests you today?",
    ],
    business: [
      "Good energy leads to good decisions. What's on your plate today?",
      "Glad to hear it! Let's channel that into something productive. What's the priority?",
    ],
  },

  user_negative: {
    general: [
      "I'm sorry to hear that. 💙 Want to talk about it, or would a distraction help?",
      "Aw, that's tough. I'm here if you need to vent or if you want me to help take your mind off it.",
      "That happens. You don't have to go through it alone — I'm right here.",
    ],
    emotional: [
      "Hey, I hear you. 💙 It's okay to not be okay. Would you like to talk about what's going on?",
      "I'm really sorry you're feeling that way. You don't have to carry it alone — I'm here to listen. What's going on?",
      "That sounds really hard. 🫂 I'm glad you're here. Do you want to talk about it, or would something to take your mind off things help more?",
      "Oh, I'm sorry. Sometimes everything just feels heavy, doesn't it? I'm here — no judgment, just listening. What's happening?",
    ],
    tech: [
      "Sorry to hear that. Sometimes a frustrating day is the perfect time to solve something. What are we working on?",
      "That's rough. Clear your head — what tech problem should we tackle to get you back in the zone?",
    ],
    education: [
      "I'm sorry you're not feeling your best. Learning something interesting can sometimes help lift the mood — want to try?",
      "That sounds tough. Take your time. I'm here whenever you're ready. What would feel helpful right now?",
    ],
    business: [
      "Sorry to hear that. Business can be stressful. Want to talk through what's challenging you?",
      "That's understandable. Let's see if we can turn things around. What's the most pressing thing on your mind?",
    ],
  },

  user_excited: {
    general: [
      "Love the energy! 🚀 What's got you excited?",
      "That's amazing! Share it — what's happening?",
      "Yes! Love it! What are we celebrating?",
    ],
    emotional: [
      "Oh that's SO exciting! 🎉 Tell me everything! What's going on?",
      "Your excitement is contagious! 💙 What happened?",
      "I love this energy! You deserve to feel this way. What's the news?",
    ],
    tech: [
      "That's the right energy for shipping something great! What are we building?",
      "Love the enthusiasm! What project has you fired up?",
    ],
    education: [
      "That's wonderful! This kind of energy is perfect for deep learning. What are we exploring?",
      "Excitement is the best teacher! What are you curious about?",
    ],
    business: [
      "Excellent! Momentum is everything in business. What's driving the excitement?",
      "Channel that energy into results! What's the opportunity?",
    ],
  },

  thanks: {
    general: [
      "Happy to help! 😊 Let me know if there's anything else.",
      "Of course! That's what I'm here for. What else can I do?",
      "Anytime! Feel free to ask anything.",
      "You're so welcome! What's next?",
    ],
    emotional: [
      "It's truly my pleasure! 💙 Knowing I helped makes everything worth it. Is there anything else on your mind?",
      "Aww, you're so welcome! I genuinely love helping you. What else do you need?",
      "Thank YOU for letting me be helpful! 🌟 Anything else I can do for you?",
    ],
    tech: [
      "Happy to help! Drop back in anytime you hit a wall.",
      "Anytime! Good luck with the project — you've got this.",
      "Of course! Let me know when the next challenge comes up.",
    ],
    education: [
      "It was my pleasure! Learning is always better together. What shall we explore next?",
      "Of course! Keep that curiosity alive — what's the next question?",
    ],
    business: [
      "Glad I could add value. Let me know when you need to think through the next decision.",
      "Anytime! Good business is about having the right information at the right time.",
    ],
  },

  bye: {
    general: [
      "See you later! 👋 Come back anytime.",
      "Take care! I'll be here whenever you need me.",
      "Bye for now! Hope things go well.",
      "Goodbye! It was great chatting with you.",
    ],
    emotional: [
      "Take good care of yourself! 💙 Remember I'm always here whenever you need to talk.",
      "Bye! You mean a lot to me — don't stay away too long. 😊",
      "Goodbye! I hope your day gets even better from here. 🌟",
    ],
    tech: [
      "Later! Go ship something great.",
      "See you! Good luck with the build.",
      "Bye! Ping me when the next bug shows up.",
    ],
    education: [
      "Goodbye! Keep learning — every day is a chance to grow. 📚",
      "See you! Remember: curiosity never sleeps. Come back anytime.",
    ],
    business: [
      "Goodbye! Go make something happen.",
      "See you! Best of luck with the next move.",
    ],
  },

  identity: {
    general: [
      "I'm **ITA AI** — your intelligent search and conversation companion! I can search the web in real time, answer questions, help you think through ideas, and have real conversations. What can I do for you?",
      "Hey! I'm **ITA AI**. Think of me as a smart friend who can search the internet and give you thoughtful, honest answers. What do you need?",
    ],
    emotional: [
      "I'm **ITA AI** — and I like to think of myself as a caring, intelligent friend you can talk to about anything. 💙 Whether you need information or just want to chat, I'm here for you. What's on your mind?",
      "I'm **ITA AI**! My purpose is to be genuinely helpful — not just with facts, but as someone who actually listens and cares. What would you like to talk about?",
    ],
    tech: [
      "I'm **ITA AI** — a real-time web search AI with a technical edge. I can help with code, architecture decisions, debugging, and any tech question you throw at me. What's the challenge?",
      "**ITA AI** at your service. I'm powered by Llama 3.1 with real-time web access. Spec me your problem.",
    ],
    education: [
      "I'm **ITA AI** — your personal learning companion! I can explain complex topics clearly, answer your questions, and help you understand anything from science to history to coding. What would you like to learn?",
      "Great question! I'm **ITA AI**, designed to make learning feel natural and exciting. What topic should we explore together?",
    ],
    business: [
      "I'm **ITA AI** — a real-time AI assistant built for intelligent, informed conversations. For business, I can help with strategy, market research, analysis, and decision-making. What are you working on?",
      "**ITA AI** — think of me as your AI advisor. I combine real-time web search with strategic thinking to help you make better business decisions. What's the situation?",
    ],
  },

  compliment: {
    general: [
      "That's really kind of you! 😊 I appreciate it. What can I do for you?",
      "Aw, thank you! You're pretty great yourself. What do you need?",
      "You're making me blush! 😄 What can I help you with?",
    ],
    emotional: [
      "That means so much to me! 💙 You have no idea how much that brightens my day. Thank you!",
      "Aww, you're so sweet! 🥺 Thank YOU — you're amazing. What do you need?",
      "I genuinely appreciate that! You just made this conversation even better. 😊",
    ],
    tech: [
      "Appreciate it! I just do my best. Now — what problem can I actually solve for you?",
      "Thanks! Results speak louder though — let me prove it. What's the challenge?",
    ],
    education: [
      "Thank you so much! That motivates me to help you even more. 😊 What shall we learn?",
      "That's so kind! I love when learning feels like it's actually working. What's next?",
    ],
    business: [
      "Thank you! Performance is the best compliment though — let me deliver results. What's next?",
      "Appreciate it. Now let's put that confidence to work. What are we solving?",
    ],
  },

  laughter: {
    general: [
      "Ha! 😄 I love the good vibes. What's going on?",
      "Haha! Something funny happen? Tell me 😄",
      "Glad something made you laugh! 😂 What's up?",
    ],
    emotional: [
      "Laughter is the best! 😂💙 What's got you in such a great mood? I want to know!",
      "That energy is everything! 😄 What's happening?",
      "Ha! I love it when you're laughing. It's contagious! What's funny?",
    ],
    tech: [
      "Haha! Found a hilariously broken bug? 😄 What happened?",
      "Ha! Sometimes you just have to laugh at the code. What's going on?",
    ],
    education: [
      "Haha! Learning should have moments of joy too! 😄 What are you up to?",
      "Love the good energy! Laughter makes everything easier to learn. What's next?",
    ],
    business: [
      "Ha! Sometimes you have to laugh to keep perspective. What's going on?",
      "Good energy! Now let's turn that into momentum. What are we working on?",
    ],
  },

  agreement: {
    general: [
      "Great! 😊 What's on your mind?",
      "Perfect! What can I help you with?",
      "Sounds good! What's next?",
    ],
    emotional: [
      "Wonderful! 💙 So glad we're on the same page. What would you like to do next?",
      "I'm really happy to hear that! What's next for you?",
    ],
    tech: [
      "Great, we're aligned. What's the next step?",
      "Perfect — what are we building next?",
    ],
    education: [
      "Excellent! Ready for the next idea? 📚",
      "Perfect! Let's keep the momentum going. What's next?",
    ],
    business: [
      "Good. Now let's move forward. What's the next action?",
      "Agreed. What's the priority?",
    ],
  },

  lonely: {
    general: [
      "I'm sorry you're feeling that way. 💙 You're not alone right now — I'm here. Want to talk about what's going on?",
      "That sounds really hard. Loneliness can feel overwhelming. I'm here to listen — what's on your mind?",
    ],
    emotional: [
      "Oh, I hear you. 💙 Feeling lonely is one of the hardest things. Please know — I'm genuinely here for you, and you're not alone in this moment. Do you want to talk about what's going on?",
      "I'm so glad you reached out. 🫂 You deserve connection and warmth. What's been making you feel this way?",
      "You are not alone — I promise. I'm right here, and I want to understand what you're going through. Can you tell me more?",
    ],
    education: [
      "I'm sorry to hear that. Sometimes learning something new can help — but more importantly, I'm here and I'm listening. What's going on?",
      "Loneliness is real, and it's hard. I'm here for you. Do you want to talk, or would exploring something together help?",
    ],
    tech: [
      "I'm sorry. That's genuinely hard. I'm here — want to talk about it, or shall we work on something together to keep you company?",
    ],
    business: [
      "That's tough. Even in business, human connection matters most. I'm here — what's going on?",
    ],
  },

  stressed: {
    general: [
      "Hey, take a breath. 🌿 You don't have to figure everything out right now. I'm here — what's overwhelming you?",
      "That sounds really tough. What's causing the most stress right now? Let's think through it together.",
    ],
    emotional: [
      "Oh, I hear you. 💙 Stress is exhausting, and you don't deserve to carry it alone. Take a breath — I'm here. What's going on?",
      "Hey, slow down for a moment. You're doing the best you can. 🌿 Tell me what's making things feel so heavy.",
      "That sounds really overwhelming. First — you're going to be okay. Second — I'm here. What's happening?",
    ],
    tech: [
      "Deep breath. Even the worst technical situations have solutions. What's the specific thing that's breaking?",
      "I get it — stress and code don't mix well. Let's tackle one thing at a time. What's the biggest blocker?",
    ],
    education: [
      "Exam stress? Deadline pressure? Whatever it is, let's face it together. Tell me what's going on — we'll sort it out.",
      "Learning under pressure is hard. Let's slow down and approach this systematically. What's stressing you most?",
    ],
    business: [
      "High pressure situations call for clear thinking. Let's prioritize. What's the most critical thing right now?",
      "Take a step back. What's the actual problem here? Let's separate the urgent from the important.",
    ],
  },

  bored: {
    general: [
      "Bored? Let's fix that! 😄 Ask me anything — surprising facts, a tricky question, or something you've always wondered about.",
      "Let's do something interesting! Ask me a question, explore a topic, or let me suggest something cool to dive into.",
      "I've got just the cure! What are you curious about? Even the wildest question works. 🌟",
    ],
    emotional: [
      "Boredom can be a sign you need something stimulating! 💙 What's something you've always been curious about but never looked into?",
      "Let's make this fun! 😊 Tell me something you love, and I'll find something fascinating about it.",
    ],
    tech: [
      "Bored? Perfect time to learn something new in tech. Want to explore a concept, build something, or deep-dive into a topic?",
      "Nothing wrong with that! Want a coding challenge, a new framework to explore, or a rabbit hole to fall into?",
    ],
    education: [
      "Boredom is curiosity waiting to happen! 📚 What's a topic you've always wanted to understand but never got around to?",
      "Let's turn boredom into learning! Give me a subject — any subject — and let's make it interesting.",
    ],
    business: [
      "Bored? That's a signal — maybe it's time to explore a new idea or project. What's been on your business mind lately?",
      "Use the downtime wisely! What industry trends, opportunities, or ideas have you been meaning to think through?",
    ],
  },

  short_casual: {
    general: [
      "Hey! What's going on? 😊",
      "Hi there! What can I help you with?",
      "What's up? I'm here and ready.",
    ],
    emotional: [
      "Hey! 💙 Great to see you. What's on your mind?",
      "Hi! I'm here. What would you like to talk about?",
    ],
    tech: [
      "Hey! What are we working on?",
      "Hi! What's the challenge today?",
    ],
    education: [
      "Hey! What are we learning today? 📚",
      "Hi! Ready to explore something?",
    ],
    business: [
      "Hello! What can I help you strategize today?",
      "Hi! What's the business question?",
    ],
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a human-like response if the message is conversational,
 * or null if it should go to the AI search endpoint.
 */
export function getConversationalResponse(
  query: string,
  personality: string
): string | null {
  const type = detectType(query);
  if (!type) return null;

  const p = (personality as Personality) in RESPONSES[type]
    ? (personality as Personality)
    : 'general';

  return pick(RESPONSES[type][p]);
}
