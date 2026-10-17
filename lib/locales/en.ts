/**
 * English is the source of truth: it defines every UI string and the MessageKey type.
 * Every other locale file must provide all keys (enforced by the compiler) and keep the same {placeholders}.
 */
export const en = {
  // Landing
  "landing.tagline": "Two languages. One real argument.",
  "landing.h1a": "Disagree in your language.",
  "landing.h1b": "Be understood",
  "landing.h1c": "in theirs.",
  "landing.body":
    "Most translation tools handle polite questions, not arguments. convoTalk translates every message as it lands, so two people can interrupt, ask for a second, say “that’s not what I meant,” and change their minds without anything getting lost.",
  "landing.byline": "Built for the ZERO ConvoTalk challenge",
  "landing.start": "Start a conversation",
  "landing.illustration": "Illustration, not live output",
  "landing.illustrationAria": "Illustration of a convoTalk exchange",
  "meta.title": "convoTalk: argue across languages, understand each other",

  "preview.speaker": "{name} · {lang}",

  // Integration status
  "status.aria": "Configuration status",
  "status.rt.ok": "Realtime messaging",
  "status.rt.okHint": "Supabase is configured. This is a setup check, not a live connection test.",
  "status.rt.demo": "Demo mode: realtime not configured",
  "status.rt.demoHint": "Without Supabase, rooms only work inside one browser. Add the Supabase variables to chat across devices.",
  "status.tr.ok": "AI-powered translation",
  "status.tr.okHint": "A translation key is configured on the server. This is a setup check, not a live test.",
  "status.tr.checking": "Checking translation setup…",
  "status.tr.off": "Translation not configured",
  "status.tr.offHint": "The server has no GEMINI_API_KEY, so messages will show original text only.",
  "status.tr.unknown": "Couldn’t check translation setup",
  "status.tr.unknownHint": "The setup check failed. Translation will be attempted anyway and errors will be shown per message.",

  // Profile forms
  "form.heading": "Create a room",
  "form.name": "Your name",
  "form.namePlaceholder": "e.g. Maya",
  "form.lang": "I speak",
  "form.create": "Create a room",
  "form.creating": "Creating room…",
  "form.noAccount": "No account. You’ll get a link to send to the other person.",
  "form.err.create": "We couldn’t create the room. Your details are saved, so try again.",
  "form.err.storage": "Your browser is blocking site storage, which convoTalk needs for this room. Allow storage for this site and try again.",
  "form.err.slow": "This is taking longer than expected. Try again.",
  "join.titleNamed": "{name} invited you to talk.",
  "join.title": "You’ve been invited to talk.",
  "join.bodyLang": "They’re writing in {lang}. Choose your language and everything they say will arrive in it.",
  "join.body": "Choose your language and everything the other person says will arrive in it.",
  "join.submit": "Join the conversation",
  "join.sameLang": "{name} already speaks {lang}. Pick a different language.",
  "join.theOther": "The other person",

  // Validation
  "err.nameEmpty": "Enter a display name.",
  "err.nameTooLong": "Keep your name under {maxName} characters.",
  "err.empty": "Write something first.",
  "err.tooLong": "Messages can be up to {maxMessage} characters.",

  // Room shell
  "room.loading": "Loading room",
  "room.invalid.title": "That link doesn’t look right.",
  "room.invalid.body": "Room links look like /room/k7x2m9pq4a. Ask for the invite again, or start a new room.",
  "room.invalid.cta": "Start a room",
  "room.full.title": "This room is full.",
  "room.full.body": "convoTalk rooms hold exactly two people, and both seats are taken. Ask your host for a new link.",
  "room.full.cta": "Start your own room",

  // Chat
  "chat.copy": "Copy invite link",
  "chat.copied": "Copied",
  "chat.copyShort": "Copy",
  "chat.inviteAria": "Invite link",
  "chat.myLang": "Your language",
  "chat.you": "you",
  "chat.waitingName": "Waiting…",
  "chat.waitingSub": "for the other person",
  "chat.conversation": "Conversation",
  "chat.typing": "{names} is typing…",
  "chat.typingBoth": "{names} is typing too. You’re about to talk over each other.",
  "chat.typingSr": "is typing",
  "banner.demo.title": "Demo mode.",
  "banner.demo.body":
    "Supabase isn’t configured, so nothing here is shared with another browser or device. You’re talking to a scripted sample partner, and the translations are pre-written samples, not live translation.",
  "banner.noTranslation":
    "Live sync is on, but translation isn’t: the server has no GEMINI_API_KEY. You’ll see original text only.",
  "banner.sameLang":
    "You both selected {lang}, so messages won’t be translated. Change your language above to try translation.",
  "hold.other": "{name} asked you to wait. They’re gathering their thoughts.",
  "hold.me": "You asked {name} to wait.",
  "hold.them": "them",
  "hold.release": "Go ahead",
  "empty.connecting": "Connecting to the room…",
  "empty.firstTitle": "Say the first thing.",
  "empty.firstBody": "Whatever you write will arrive in {lang}. Interrupting is allowed.",
  "empty.firstBodyGeneric": "Whatever you write will arrive in their language. Interrupting is allowed.",
  "empty.waitTitle": "Waiting for the other side.",
  "empty.waitBody":
    "Send this link to the person you want to talk with. They pick their own language when they open it.",
  "empty.clipboardFail": "Couldn’t access the clipboard. Select the link above and copy it manually.",

  // Connection
  "conn.connected": "Live",
  "conn.connecting": "Connecting…",
  "conn.reconnecting": "Reconnecting…",
  "conn.error": "Connection problem",
  "conn.demo": "Demo mode",
  "conn.err.presence": "Connected, but couldn’t announce your presence. The other person may not see you.",
  "conn.err.channel": "Realtime channel error. Check your Supabase URL and key, and that Realtime is enabled.",
  "conn.err.timeout": "Timed out connecting to Supabase Realtime. Retrying…",

  // Composer
  "composer.label": "Message",
  "composer.send": "Send",
  "composer.sendAnyway": "Send anyway",
  "composer.reactions": "Quick reactions",
  "composer.ph.default": "Say what you really think…",
  "composer.ph.clarify": "What you actually meant…",
  "composer.ph.revise": "Your new position…",
  "composer.disabled": "Not connected. Waiting for the connection…",
  "composer.intent.clarify": "Your next message will be sent as a clarification.",
  "composer.intent.revise": "Your next message will replace your earlier position.",
  "composer.cancel": "Cancel",
  "composer.counter": "{count} of {max} characters",
  "composer.help": "Enter to send · Shift+Enter for a new line",
  "composer.needMessage": "Send a message first",

  // Quick reactions: button label and the phrase shown in the conversation
  "react.wait": "Wait",
  "react.notMeant": "That’s not what I meant",
  "react.changed": "I changed my mind",
  "pill.wait": "Wait, hold on",
  "pill.notMeant": "That’s not what I meant",
  "pill.changed": "I changed my mind",
  "pill.failed": "Failed · Retry",

  // Messages
  "msg.you": "You",
  "msg.aria": "{name}, {time}",
  "msg.sending": "Sending…",
  "msg.sent": "Sent",
  "msg.failed": "Failed to send · Retry",
  "msg.clarifying": "Clarifying",
  "msg.newPosition": "New position, replaces",
  "msg.revised": "Changed their mind about this",
  "msg.flagged": "Flagged: “that’s not what I meant”",
  "msg.unavailable": "Translation unavailable: server has no GEMINI_API_KEY.",
  "msg.sameLang": "Same language, not translated",
  "msg.translating": "Translating…",
  "msg.sampleEn": "Sample translation (demo, pre-written)",
  "msg.sampleOther": "Sample translation (demo, English only)",
  "msg.retry": "Retry translation",
  "msg.original": "Original · {lang}",
  "msg.translation": "Translation · {lang}",

  // Translation errors (keyed by the server's error code)
  "tr.not_configured": "Translation isn’t configured on this server.",
  "tr.bad_request": "That message couldn’t be sent for translation.",
  "tr.timeout": "The translator took too long to respond. Try again.",
  "tr.network": "Could not reach the translation service. Try again.",
  "tr.rate_limited": "Translation is rate limited. Wait a moment and retry.",
  "tr.upstream_config": "The translation provider rejected this server’s configuration.",
  "tr.upstream_error": "The translation service had a problem. Try again.",
  "tr.blocked": "The translator declined to translate this message.",
  "tr.bad_response": "The translator returned an unexpected response. Try again.",
  "tr.client_network": "Network error while translating.",
  "tr.generic": "Translation failed.",
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
