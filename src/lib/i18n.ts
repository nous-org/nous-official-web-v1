export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const defaultLocale: Locale = "en";

export function normalizeLocale(locale?: string): Locale {
  return locale === "es" ? "es" : "en";
}

export function isSpanishPath(pathname: string): boolean {
  return pathname === "/es" || pathname.startsWith("/es/");
}

export function stripLocalePrefix(pathname: string): string {
  const cleanPath = pathname.split("?")[0]?.split("#")[0] || "/";
  const withoutTrailingSlash =
    cleanPath.length > 1 ? cleanPath.replace(/\/+$/, "") : cleanPath;

  if (withoutTrailingSlash === "/es") return "/";
  if (withoutTrailingSlash.startsWith("/es/")) {
    return withoutTrailingSlash.slice(3) || "/";
  }

  return withoutTrailingSlash || "/";
}

export function localizePath(path: string, locale: Locale): string {
  if (!path || path.startsWith("#")) return path;
  if (/^(https?:|mailto:|tel:)/.test(path)) return path;

  const [rawPath, hash] = path.split("#");
  const basePath = stripLocalePrefix(rawPath || "/");
  const localizedPath =
    locale === "es" ? (basePath === "/" ? "/es" : `/es${basePath}`) : basePath;

  return hash ? `${localizedPath}#${hash}` : localizedPath;
}

export function alternateLocalePath(pathname: string, targetLocale: Locale): string {
  return localizePath(stripLocalePrefix(pathname), targetLocale);
}

export function getLocaleFromPath(pathname: string): Locale {
  return isSpanishPath(pathname) ? "es" : "en";
}

export const SITE_URL = "https://nous.cr";

export const commonCopy = {
  en: {
    skipLink: "Skip to main content",
    languageName: "English",
    alternateLanguageName: "Español",
    alternateLanguageAria: "View this page in Spanish",
    nav: {
      home: "Home",
      services: "Services",
      about: "About",
      blog: "Blog",
      talk: "Talk to NOUS",
    },
    navAria: {
      home: "Go to home page",
      services: "Explore NOUS AI and technology services",
      about: "Learn about NOUS",
      blog: "Read the NOUS blog",
      talk: "Get in touch with NOUS",
      mobile: "Mobile navigation",
      open: "Open mobile menu",
      close: "Close menu",
      main: "Main navigation",
      logo: "NOUS logo",
    },
    footer: {
      tagline: "Building a more intelligent world.",
      talk: "Talk to NOUS",
      services: "Explore services",
      contactHeading: "Contact",
      contactText:
        "Hermes will start the conversation, gather initial context, and route it to the right person at NOUS.",
      newsletterHeading: "Newsletter",
      newsletterLabel: "E-mail address",
      newsletterButton: "Subscribe",
      newsletterLoading: "Subscribing...",
      newsletterInvalid: "Please enter a valid e-mail address",
      newsletterMissing: "Please enter your e-mail address",
      newsletterSuccess: "Successfully subscribed!",
      newsletterFallbackError: "Something went wrong. Please try again.",
      newsletterNetworkError:
        "Network error. Please check your connection and try again.",
      newsletterDescription:
        "Field notes on the era of abundant intelligence: how intelligence on tap will reshape decisions, tools, infrastructure, and the organizations ready to use it.",
      newsletterConsentPrefix: "By subscribing you agree to our",
      servicesHeading: "Services",
      companyHeading: "Company",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
      rights: "NOUS 2026. All rights reserved.",
    },
    serviceLabels: {
      strategy: "AI Transformation Strategy",
      deployment: "Intelligence Deployment",
      systems: "AI-Ready Systems",
    },
  },
  es: {
    skipLink: "Saltar al contenido principal",
    languageName: "Español",
    alternateLanguageName: "English",
    alternateLanguageAria: "View this page in English",
    nav: {
      home: "Inicio",
      services: "Servicios",
      about: "Nosotros",
      blog: "Blog",
      talk: "Hablemos",
    },
    navAria: {
      home: "Ir a la página de inicio",
      services: "Explorar los servicios de IA y tecnología de NOUS",
      about: "Conocer más sobre NOUS",
      blog: "Leer el blog de NOUS",
      talk: "Contactar a NOUS",
      mobile: "Navegación móvil",
      open: "Abrir menú móvil",
      close: "Cerrar menú",
      main: "Navegación principal",
      logo: "Logo de NOUS",
    },
    footer: {
      tagline: "Construyendo un mundo más inteligente.",
      talk: "Habla con NOUS",
      services: "Explorar servicios",
      contactHeading: "Contacto",
      contactText:
        "Hermes iniciará la conversación, reunirá el contexto inicial y la dirigirá a la persona adecuada en NOUS.",
      newsletterHeading: "Newsletter",
      newsletterLabel: "Dirección de e-mail",
      newsletterButton: "Suscribirse",
      newsletterLoading: "Suscribiendo...",
      newsletterInvalid: "Ingresa una dirección de e-mail válida",
      newsletterMissing: "Ingresa tu dirección de e-mail",
      newsletterSuccess: "Suscripción completada.",
      newsletterFallbackError: "Algo salió mal. Inténtalo de nuevo.",
      newsletterNetworkError:
        "Error de red. Revisa tu conexión e inténtalo de nuevo.",
      newsletterDescription:
        "Notas de campo sobre la próxima era de inteligencia abundante: cómo la inteligencia disponible bajo demanda transformará decisiones, herramientas, infraestructura y las organizaciones listas para usarla.",
      newsletterConsentPrefix: "Al suscribirte aceptas nuestra",
      servicesHeading: "Servicios",
      companyHeading: "Compañía",
      privacy: "Política de Privacidad",
      terms: "Términos y Condiciones",
      rights: "NOUS 2026. Todos los derechos reservados.",
    },
    serviceLabels: {
      strategy: "Estrategia de Transformación con IA",
      deployment: "Despliegue de Inteligencia",
      systems: "Sistemas Listos para IA",
    },
  },
} as const;

export const localeMeta = {
  en: {
    ogLocale: "en_US",
    alternateOgLocale: "es_CR",
  },
  es: {
    ogLocale: "es_CR",
    alternateOgLocale: "en_US",
  },
} as const;
