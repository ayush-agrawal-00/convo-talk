import { LANGUAGES, type LanguageCode } from "./languages";
import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from "./limits";

/** UI languages. Independent of the language a person writes in, and never sent to the other participant. */
export type Locale = "en" | "es";
export const LOCALES: Locale[] = ["en", "es"];
export const isLocale = (v: unknown): v is Locale => v === "en" || v === "es";

const en = {
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
  "locale.label": "Interface language",
  "locale.en": "Switch interface to English",
  "locale.es": "Switch interface to Spanish",

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

const es: Record<MessageKey, string> = {
  "landing.tagline": "Dos idiomas. Una discusión de verdad.",
  "landing.h1a": "Discute en tu idioma.",
  "landing.h1b": "Que te entiendan",
  "landing.h1c": "en el suyo.",
  "landing.body":
    "La mayoría de los traductores sirven para preguntas educadas, no para discusiones. convoTalk traduce cada mensaje al instante, así que dos personas pueden interrumpirse, pedir un momento, decir «eso no es lo que quise decir» y cambiar de opinión sin que se pierda nada.",
  "landing.byline": "Creado para el reto ConvoTalk de ZERO",
  "landing.start": "Empieza una conversación",
  "landing.illustration": "Ilustración, no es una salida real",
  "landing.illustrationAria": "Ilustración de un intercambio en convoTalk",
  "meta.title": "convoTalk: discute entre idiomas y entiéndanse",

  "preview.speaker": "{name} · {lang}",

  "status.aria": "Estado de la configuración",
  "status.rt.ok": "Mensajería en tiempo real",
  "status.rt.okHint": "Supabase está configurado. Es una comprobación de la configuración, no una prueba de conexión en vivo.",
  "status.rt.demo": "Modo demo: tiempo real sin configurar",
  "status.rt.demoHint": "Sin Supabase, las salas solo funcionan dentro de un mismo navegador. Añade las variables de Supabase para chatear entre dispositivos.",
  "status.tr.ok": "Traducción con IA",
  "status.tr.okHint": "El servidor tiene una clave de traducción configurada. Es una comprobación de la configuración, no una prueba en vivo.",
  "status.tr.checking": "Comprobando la traducción…",
  "status.tr.off": "Traducción sin configurar",
  "status.tr.offHint": "El servidor no tiene GEMINI_API_KEY, así que los mensajes solo mostrarán el texto original.",
  "status.tr.unknown": "No se pudo comprobar la traducción",
  "status.tr.unknownHint": "Falló la comprobación. Se intentará traducir de todos modos y los errores aparecerán en cada mensaje.",

  "form.heading": "Crear una sala",
  "form.name": "Tu nombre",
  "form.namePlaceholder": "p. ej. Maya",
  "form.lang": "Hablo",
  "form.create": "Crear una sala",
  "form.creating": "Creando sala…",
  "form.noAccount": "Sin cuenta. Recibirás un enlace para enviar a la otra persona.",
  "form.err.create": "No pudimos crear la sala. Tus datos siguen ahí, inténtalo de nuevo.",
  "form.err.storage": "Tu navegador está bloqueando el almacenamiento del sitio, que convoTalk necesita para esta sala. Permítelo para este sitio e inténtalo de nuevo.",
  "form.err.slow": "Está tardando más de lo esperado. Inténtalo de nuevo.",
  "join.titleNamed": "{name} te invitó a conversar.",
  "join.title": "Te invitaron a conversar.",
  "join.bodyLang": "Escribe en {lang}. Elige tu idioma y todo lo que diga te llegará en él.",
  "join.body": "Elige tu idioma y todo lo que diga la otra persona te llegará en él.",
  "join.submit": "Unirme a la conversación",
  "join.sameLang": "{name} ya habla {lang}. Elige otro idioma.",
  "join.theOther": "La otra persona",
  "locale.label": "Idioma de la interfaz",
  "locale.en": "Cambiar la interfaz a inglés",
  "locale.es": "Cambiar la interfaz a español",

  "err.nameEmpty": "Escribe un nombre para mostrar.",
  "err.nameTooLong": "Tu nombre debe tener menos de {maxName} caracteres.",
  "err.empty": "Escribe algo primero.",
  "err.tooLong": "Los mensajes pueden tener hasta {maxMessage} caracteres.",

  "room.loading": "Cargando la sala",
  "room.invalid.title": "Ese enlace no parece correcto.",
  "room.invalid.body": "Los enlaces de sala se ven así: /room/k7x2m9pq4a. Pide la invitación de nuevo o crea una sala nueva.",
  "room.invalid.cta": "Crear una sala",
  "room.full.title": "Esta sala está llena.",
  "room.full.body": "Las salas de convoTalk admiten exactamente dos personas y ya están ocupados los dos lugares. Pide un enlace nuevo a quien te invitó.",
  "room.full.cta": "Crea tu propia sala",

  "chat.copy": "Copiar enlace de invitación",
  "chat.copied": "Copiado",
  "chat.copyShort": "Copiar",
  "chat.inviteAria": "Enlace de invitación",
  "chat.myLang": "Tu idioma",
  "chat.you": "tú",
  "chat.waitingName": "Esperando…",
  "chat.waitingSub": "a la otra persona",
  "chat.conversation": "Conversación",
  "chat.typing": "{names} está escribiendo…",
  "chat.typingBoth": "{names} también está escribiendo. Están a punto de hablar al mismo tiempo.",
  "chat.typingSr": "está escribiendo",
  "banner.demo.title": "Modo demo.",
  "banner.demo.body":
    "Supabase no está configurado, así que nada de esto se comparte con otro navegador o dispositivo. Hablas con una interlocutora de ejemplo con guion, y las traducciones son muestras escritas de antemano, no traducción real.",
  "banner.noTranslation":
    "La sincronización en vivo funciona, pero la traducción no: el servidor no tiene GEMINI_API_KEY. Solo verás el texto original.",
  "banner.sameLang":
    "Ambos eligieron {lang}, así que los mensajes no se traducirán. Cambia tu idioma arriba para probar la traducción.",
  "hold.other": "{name} te pidió que esperes. Está ordenando sus ideas.",
  "hold.me": "Le pediste a {name} que espere.",
  "hold.them": "la otra persona",
  "hold.release": "Adelante",
  "empty.connecting": "Conectando con la sala…",
  "empty.firstTitle": "Di lo primero.",
  "empty.firstBody": "Lo que escribas le llegará en {lang}. Se permite interrumpir.",
  "empty.firstBodyGeneric": "Lo que escribas le llegará en su idioma. Se permite interrumpir.",
  "empty.waitTitle": "Esperando a la otra parte.",
  "empty.waitBody":
    "Envía este enlace a la persona con quien quieres hablar. Elegirá su propio idioma al abrirlo.",
  "empty.clipboardFail": "No se pudo acceder al portapapeles. Selecciona el enlace de arriba y cópialo a mano.",

  "conn.connected": "En vivo",
  "conn.connecting": "Conectando…",
  "conn.reconnecting": "Reconectando…",
  "conn.error": "Problema de conexión",
  "conn.demo": "Modo demo",
  "conn.err.presence": "Conectado, pero no se pudo anunciar tu presencia. Es posible que la otra persona no te vea.",
  "conn.err.channel": "Error en el canal de tiempo real. Revisa la URL y la clave de Supabase, y que Realtime esté activado.",
  "conn.err.timeout": "Se agotó el tiempo al conectar con Supabase Realtime. Reintentando…",

  "composer.label": "Mensaje",
  "composer.send": "Enviar",
  "composer.sendAnyway": "Enviar igualmente",
  "composer.reactions": "Reacciones rápidas",
  "composer.ph.default": "Di lo que de verdad piensas…",
  "composer.ph.clarify": "Lo que realmente querías decir…",
  "composer.ph.revise": "Tu nueva postura…",
  "composer.disabled": "Sin conexión. Esperando la conexión…",
  "composer.intent.clarify": "Tu próximo mensaje se enviará como aclaración.",
  "composer.intent.revise": "Tu próximo mensaje reemplazará tu postura anterior.",
  "composer.cancel": "Cancelar",
  "composer.help": "Intro para enviar · Mayús+Intro para una nueva línea",
  "composer.needMessage": "Envía un mensaje primero",

  "react.wait": "Espera",
  "react.notMeant": "No quise decir eso",
  "react.changed": "Cambié de opinión",
  "pill.wait": "Espera, un momento",
  "pill.notMeant": "No quise decir eso",
  "pill.changed": "Cambié de opinión",
  "pill.failed": "Falló · Reintentar",

  "msg.you": "Tú",
  "msg.aria": "{name}, {time}",
  "msg.sending": "Enviando…",
  "msg.sent": "Enviado",
  "msg.failed": "No se envió · Reintentar",
  "msg.clarifying": "Aclarando",
  "msg.newPosition": "Nueva postura, reemplaza",
  "msg.revised": "Cambió de opinión sobre esto",
  "msg.flagged": "Marcado: «no es lo que quise decir»",
  "msg.unavailable": "Traducción no disponible: el servidor no tiene GEMINI_API_KEY.",
  "msg.sameLang": "Mismo idioma, sin traducir",
  "msg.translating": "Traduciendo…",
  "msg.sampleEn": "Traducción de muestra (demo, escrita de antemano)",
  "msg.sampleOther": "Traducción de muestra (demo, solo en inglés)",
  "msg.retry": "Reintentar traducción",
  "msg.original": "Original · {lang}",
  "msg.translation": "Traducción · {lang}",

  "tr.not_configured": "La traducción no está configurada en este servidor.",
  "tr.bad_request": "Ese mensaje no se pudo enviar a traducir.",
  "tr.timeout": "El traductor tardó demasiado en responder. Inténtalo de nuevo.",
  "tr.network": "No se pudo conectar con el servicio de traducción. Inténtalo de nuevo.",
  "tr.rate_limited": "La traducción está limitada por exceso de uso. Espera un momento y reintenta.",
  "tr.upstream_config": "El proveedor de traducción rechazó la configuración de este servidor.",
  "tr.upstream_error": "El servicio de traducción tuvo un problema. Inténtalo de nuevo.",
  "tr.blocked": "El traductor se negó a traducir este mensaje.",
  "tr.bad_response": "El traductor devolvió una respuesta inesperada. Inténtalo de nuevo.",
  "tr.client_network": "Error de red al traducir.",
  "tr.generic": "Falló la traducción.",
};

export const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = { en, es };

export type Vars = Record<string, string | number>;

export function translate(locale: Locale, key: MessageKey, vars?: Vars): string {
  const all: Vars = { maxMessage: MAX_MESSAGE_LENGTH, maxName: MAX_NAME_LENGTH, ...vars };
  return DICTIONARIES[locale][key].replace(/\{(\w+)\}/g, (m, k: string) => (k in all ? String(all[k]) : m));
}

/** Language names for prose and option labels, in the interface language. */
const LANGUAGE_NAMES: Record<Locale, Record<LanguageCode, string>> = {
  en: { en: "English", es: "Spanish", fr: "French", de: "German", pt: "Portuguese", it: "Italian", nl: "Dutch", ru: "Russian", tr: "Turkish", ar: "Arabic", hi: "Hindi", zh: "Chinese (Simplified)", ja: "Japanese", ko: "Korean" },
  es: { en: "inglés", es: "español", fr: "francés", de: "alemán", pt: "portugués", it: "italiano", nl: "neerlandés", ru: "ruso", tr: "turco", ar: "árabe", hi: "hindi", zh: "chino (simplificado)", ja: "japonés", ko: "coreano" },
};

export function languageName(locale: Locale, code: string): string {
  return LANGUAGE_NAMES[locale][code as LanguageCode] ?? code;
}

/** Option label: native name plus the name in the interface language, e.g. "Español · Spanish". */
export function languageOptionLabel(locale: Locale, code: string): string {
  const native = LANGUAGES.find((l) => l.code === code)?.native ?? code;
  const local = languageName(locale, code);
  return native.toLowerCase() === local.toLowerCase() ? native : `${native} · ${local}`;
}

export function formatTime(locale: Locale, ts: number): string {
  return new Date(ts).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

/** Maps the translate API's error code to a localized message key. */
export function translationErrorKey(code: string | undefined): MessageKey {
  const key = `tr.${code}` as MessageKey;
  return code && key in en ? key : "tr.generic";
}
