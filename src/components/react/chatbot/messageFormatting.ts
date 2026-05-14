export type AssistantContentToken =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "strong"; text: string };

const MESSAGE_TOKEN_PATTERN =
  /\[([^\]\n]{1,96})\]\(((?:\/(?!\/)[^)\s]+|https:\/\/(?:www\.)?nous\.cr\/[^)\s]+|https:\/\/wa\.me\/50661865634|mailto:(?:hello|support)@nous\.cr))\)|\*\*([^*\n]{1,120})\*\*|\b((?:hello|support)@nous\.cr)\b|(?:\+506|\(\+506\))[\s-]*6186[\s-]*5634|https:\/\/(?:www\.)?nous\.cr\/[^\s<>()]+|https:\/\/wa\.me\/50661865634|(^|[\s([{"'“])((?:\/(?!\/)[A-Za-z0-9_~%-]+)(?:\/[A-Za-z0-9_~%-]+)*(?:#[A-Za-z0-9_-]+)?)/g;

const CONTACT_PHONE_LABEL = "+506 6186-5634";
const CONTACT_WHATSAPP_HREF = "https://wa.me/50661865634";

export function parseAssistantContent(content: string): AssistantContentToken[] {
  const tokens: AssistantContentToken[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(MESSAGE_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    const markdownLabel = match[1];
    const markdownHref = match[2];
    const strongText = match[3];
    const plainEmail = match[4];
    const pathPrefix = match[5] || "";
    const routePath = match[6];

    if (routePath) {
      const tokenStart = index + pathPrefix.length;
      pushText(tokens, content.slice(lastIndex, tokenStart));
      pushLink(tokens, routePath, routePath);
      lastIndex = index + match[0].length;
      continue;
    }

    pushText(tokens, content.slice(lastIndex, index));

    if (markdownLabel && markdownHref) {
      pushLink(tokens, markdownLabel, markdownHref);
    } else if (strongText) {
      tokens.push({ type: "strong", text: strongText });
    } else if (plainEmail) {
      pushLink(tokens, plainEmail, `mailto:${plainEmail.toLowerCase()}`);
    } else if (isContactPhone(match[0])) {
      tokens.push({
        type: "link",
        text: CONTACT_PHONE_LABEL,
        href: CONTACT_WHATSAPP_HREF,
      });
    } else {
      pushUrl(tokens, match[0]);
    }

    lastIndex = index + match[0].length;
  }

  pushText(tokens, content.slice(lastIndex));

  return tokens.length ? tokens : [{ type: "text", text: content }];
}

export function normalizeSafeChatHref(rawHref: string) {
  const href = rawHref.trim().replace(/[.,!?;:]+$/g, "");

  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }

  if (/^mailto:(hello|support)@nous\.cr$/i.test(href)) {
    return href;
  }

  if (href === CONTACT_WHATSAPP_HREF) {
    return href;
  }

  try {
    const parsed = new URL(href);
    if (parsed.hostname === "nous.cr" || parsed.hostname === "www.nous.cr") {
      return parsed.href;
    }
  } catch {
    return "";
  }

  return "";
}

function isContactPhone(value: string) {
  return /^(?:\+506|\(\+506\))[\s-]*6186[\s-]*5634$/.test(value.trim());
}

function pushText(tokens: AssistantContentToken[], text: string) {
  if (!text) return;
  tokens.push({ type: "text", text });
}

function pushLink(tokens: AssistantContentToken[], label: string, rawHref: string) {
  const href = normalizeSafeChatHref(rawHref);
  if (!href) {
    pushText(tokens, label);
    return;
  }

  tokens.push({ type: "link", text: label, href });
}

function pushUrl(tokens: AssistantContentToken[], rawUrl: string) {
  const href = normalizeSafeChatHref(rawUrl);
  const text = rawUrl.replace(/[.,!?;:]+$/g, "");
  const trailing = rawUrl.slice(text.length);

  if (!href) {
    pushText(tokens, rawUrl);
    return;
  }

  tokens.push({ type: "link", text, href });
  pushText(tokens, trailing);
}
