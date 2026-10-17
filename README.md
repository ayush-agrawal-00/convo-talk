# convoTalk

Two people who speak different languages, one real argument. convoTalk translates every message as it lands, and adds the things real
arguments need: typing/speaking indicators, "Wait", "That's not what I meant", and "I changed my mind", all with real behavior.

Built for the ZERO ConvoTalk challenge. Next.js (App Router) · TypeScript · Tailwind v4 · Lucide · Supabase Realtime Broadcast · Gemini.
No database, no accounts.

## How it works

- **Rooms** are just a random ID in the URL (`/room/k7x2m9pq4a`). No server state.
- **Messages** travel over a Supabase Realtime channel (`convotalk:<roomId>`) using *Broadcast*; *Presence* shows who's in the room.
- **Translation**: each browser translates *incoming* messages into its own selected language by calling `/api/translate`, a server route that
  holds `GEMINI_API_KEY`. The last few messages are sent as context so pronouns and references translate correctly.
- The invite link carries the host's name and language (`?l=es&n=Sofia`) so the guest can't pick the same language by accident.
- Rooms hold exactly two people; a third visitor sees a "room full" screen.

### The conversation controls

| Control | What it does |
| --- | --- |
| Typing indicator | Avatar pulses and "X is typing…" shows for the other person. If you're both typing it says you're about to talk over each other. |
| **Wait** | Posts a "Wait" marker (shown in the viewer's UI language) and shows the other person a banner while they compose; their send button becomes "Send anyway". Releases on "Go ahead", when you next speak, or after 20s. |
| **That's not what I meant** | Flags your last message on both screens and arms the composer so your next message is sent as a quoted *clarification*. |
| **I changed my mind** | Strikes through your last message on both screens and arms the composer so your next message is sent as a *new position* quoting the old one. |

The last two need you to have sent a message first, so they're disabled until then.

## Setup

Requires Node 20.9+ (tested on Node 24).

```bash
npm install
cp .env.example .env.local   # then fill in values (see below)
npm run dev                  # http://localhost:3000
```

With no env vars the app runs in **demo mode** (see below). Each integration is independent.

### Supabase (realtime sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. **Project Settings → API**: copy the **Project URL** into `NEXT_PUBLIC_SUPABASE_URL` and the **anon / publishable** key into
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put the `service_role` / secret key in a `NEXT_PUBLIC_` variable.
3. Nothing else is required: no tables, no auth. The app uses public Broadcast/Presence channels with the anon key. If your project
   enforces private-only Realtime channels, connection will fail with a visible error in the room's status banner.

### Translation (Gemini)

1. Create a key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Set `GEMINI_API_KEY` (server-only; there is no `NEXT_PUBLIC_` variant and the browser never sees it).
3. Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`).

Without a key, the room still syncs but incoming messages show original text only, with a visible "Translation unavailable" notice.
The landing page shows the live status of both integrations.

### Demo mode

If the Supabase variables are missing the app shows a **Demo mode** badge and banner. You chat with a scripted sample partner (Sofía, Spanish).
Her translations are **pre-written samples labeled as such**; nothing is sent to any service, and **nothing syncs between browsers or devices**.

## Testing with two browsers

1. `npm run dev` with both Supabase and Gemini configured.
2. Window A: open `http://localhost:3000`, enter a name, pick *English*, **Create a room**.
3. Click **Copy invite link**.
4. Window B (a different browser, or a private window; a second tab of the same browser also works): paste the link, enter a name, pick *Spanish*, **Join**.
5. Send messages both ways and check the checklist below.

Each tab keeps its own identity (via `sessionStorage`), so two tabs of one browser behave as two people.

### Test checklist

- [ ] Both windows show **Live** (green) and each shows the other's name and language.
- [ ] A message from A appears in B in Spanish, with the English original beneath it. And vice-versa.
- [ ] While typing in A, B shows "A is typing…" and A's avatar pulses on B's screen.
- [ ] **Wait** in A: a pill appears on both screens; B sees the orange hold banner and a "Send anyway" button; A can click **Go ahead**.
- [ ] Send a message in A, then **That's not what I meant**: the message is flagged on both screens; the next message is shown as "Clarifying" with a quote.
- [ ] Send a message in A, then **I changed my mind**: the message is struck through on both; the next message is a "New position".
- [ ] Switch B's language in the header: new messages translate to the new language.
- [ ] Set A's interface to ES and B's to EN: each UI is in its own language, and toggling one never changes the other's. Messages show "Original · <source>" and "Translation · <your language>".
- [ ] Message of 501+ characters is rejected with an error; Enter sends, Shift+Enter adds a newline.
- [ ] Unset `GEMINI_API_KEY` and restart: "Translation unavailable" notice appears; with an invalid key, a per-message error and **Retry translation** button appear.
- [ ] Open the link in a third window: "This room is full."
- [ ] Narrow a window to phone width: layout and composer remain usable.

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel (framework: Next.js, defaults are fine).
2. Add environment variables under **Project Settings → Environment Variables** (all environments):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`).
3. Deploy. Note `NEXT_PUBLIC_*` values are inlined at **build time**, so redeploy after changing them.
4. Open the deployed URL in two browsers and run the checklist above.

Or with the CLI: `npx vercel` then `npx vercel --prod`.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Known limitations

- **No history.** There is no database by design. Messages exist only in the browsers that were in the room. A refresh keeps your tab's copy
  (`sessionStorage`), but someone who joins later doesn't see earlier messages, and closing the tab loses the conversation.
- **Public rooms.** Anyone with the room link can join (until it holds two people). Room IDs are random, not secret-grade, and there's no
  authentication, as the challenge specified. Broadcasts are not encrypted beyond transport.
- **Seat enforcement is client-side.** The two-person limit relies on Presence ordering, so a determined user can bypass it. Fine for an MVP, not for a security boundary.
- **The translation endpoint is unauthenticated and not rate-limited**, so anyone who finds your deployment can spend your Gemini quota. Add
  a rate limiter (e.g. Upstash) or Vercel firewall rules before sharing widely.
- **Each viewer translates separately**, so two browsers can render slightly different wordings of the same message, and each message costs one API call per receiving viewer.
- **Interface languages are English and Spanish only.** The UI language (`EN | ES` toggle) is per browser, stored in `localStorage`, and never
  sent to the other participant. It is independent of the language you *speak* (the "I speak" selector): changing one never changes the other.
  Speakers of other languages still get translated messages, with the UI in whichever of EN/ES they choose. The UI is translated from a typed
  dictionary (`lib/i18n.ts`), never through the AI API; adding a key without a Spanish entry fails the TypeScript build.
- **Landing status chips are setup checks, not health checks.** "Realtime messaging" / "AI-powered translation" mean the variables are present; they don't prove
  Supabase or Gemini are reachable. Missing configuration is flagged in amber. The room's own badge shows the real connection state.
- Page title and Open Graph tags are English (they're rendered on the server, which doesn't know the visitor's UI language); the browser tab title follows the UI language on the landing page.
- Timestamps use the sender's clock. Message order is arrival order, so two near-simultaneous messages may appear in different order on each screen.
- Supabase free-tier Realtime limits (concurrent connections, messages/second) apply.
- Machine translation can be wrong, especially with slang and idioms. The original is always shown beside the translation for that reason.
