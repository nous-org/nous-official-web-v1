import type { ChatbotLocale } from "./types.ts";

export const CHATBOT_MAX_MESSAGE_LENGTH = 1200;
export const CHATBOT_MAX_HISTORY_MESSAGES = 8;
export const CHATBOT_MAX_HISTORY_MESSAGE_LENGTH = 900;
export const CHATBOT_MAX_OUTPUT_TOKENS = 700;
export const CHATBOT_MAX_PAGE_TEXT_LENGTH = 1400;
export const CHATBOT_MAX_SELECTED_TEXT_LENGTH = 900;

export const CHATBOT_PUBLIC_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/about", label: "About" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Talk to NOUS" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/terms-and-conditions", label: "Terms and Conditions" },
  { path: "/es", label: "Inicio" },
  { path: "/es/services", label: "Servicios" },
  { path: "/es/about", label: "Nosotros" },
  { path: "/es/blog", label: "Blog" },
  { path: "/es/contact", label: "Habla con NOUS" },
  { path: "/es/portfolio", label: "Portafolio" },
  { path: "/es/privacy-policy", label: "Política de Privacidad" },
  { path: "/es/terms-and-conditions", label: "Términos y Condiciones" },
] as const;

export const CHATBOT_QUICK_PROMPTS = {
  en: [
    "What does NOUS do?",
    "Help me find the right AI opportunity",
    "Summarize this page",
    "How do I contact the team?",
  ],
  es: [
    "¿Qué hace NOUS?",
    "Ayúdame a encontrar una oportunidad con IA para mi organización",
    "Resume esta página",
    "¿Cómo contacto al equipo?",
  ],
} as const;

const PUBLIC_SITE_CONTEXT = String.raw`Site name:
NOUS

Public description:
NOUS is an AI transformation partner that helps organizations turn AI into working operational capability: strategy, agents, automation, training, and the systems needed to deploy intelligence at work. The site frames NOUS as helping organizations decide where AI creates leverage, build the systems that deploy it, and make it part of daily work.

Public positioning:
- AI transformation partner for ambitious organizations.
- AI first, technology wide: NOUS leads with AI but builds the surrounding software, integrations, data flows, websites, internal tools, and infrastructure needed for deployment.
- Deployment over demos/theater: prototypes matter only if they point toward systems people can rely on.
- Independent/model-flexible: provider choice depends on use case, data requirements, cost profile, latency, reliability, reasoning needs, and multimodal needs.
- Footer brand line: "Building a more intelligent world."

Primary audience:
Organizations, leaders, operators, and technical teams that want to turn AI capability into production systems people use every day. The site also names customer operations, internal productivity, commercial systems, technical modernization, decision support, and training/governance as areas where NOUS helps.

Public services and capabilities:
- AI Transformation Strategy: opportunity diagnostics, executive roadmaps, priority workflow selection, governance, risk, and adoption planning.
- Intelligence Deployment: agents, copilots, automations, decision-support systems, customer service and operations agents, workflow automation, handoff design, human-in-the-loop controls, and evaluations.
- AI-Ready Systems: custom software, internal platforms, data/API/CRM/workflow integrations, web products, technical foundations, and modernization around AI.
- Training & Adoption: team training, operating playbooks, change management, rollout support, measurement, iteration, and continuous improvement.
- Additional capabilities described across the site: intake, support, reporting, document processing, CRM updates, scheduling, internal requests, dashboards, portals, client portals, customer journeys, data/context integrations, governance, and AI literacy.

Public deployment model:
NOUS starts from the operating reality of the organization, diagnoses the work, chooses priority workflows, designs around people, data, tools, approvals, controls, and processes, builds/tests/deploys working systems, then trains, measures, and improves.

Public contact details:
- General contact: hello@nous.cr
- WhatsApp / phone: +506 6186-5634
- Location listed on contact and legal pages: San José, Costa Rica
- Privacy requests: privacy@nous.cr
- Legal notices / Terms questions: legal@nous.cr
- Footer includes social links for Facebook, Instagram, LinkedIn, WhatsApp, and X.
- Do not claim response times through social channels.

Public team and founder information:
- Roberto Pereira Ugalde — Chief Executive Officer (CEO) & Founder. Public bio: focused on the mission behind NOUS, using AI and technology to help build a better world, shaping the point of view and story.
- Alessandro Díaz González — Chief Technology Officer (CTO) & Co-Founder. Public bio: owns the technical path from prototype to production, including agents, integrations, automations, infrastructure, and software.
- Andrey Martínez Zambrana — Chief Product Officer (CPO) & Co-Founder. Public bio: turns strategy and systems into usable product experiences people can understand, trust, and adopt.
- Jefry Quirós Acuña — Chief Marketing Officer (CMO). Public bio: leads the market narrative, brand direction, growth engine, positioning, audience insight, content, campaigns, and demand.

Public routes with labels:

English:
- [Home](/)
- [Services](/services)
- [About](/about)
- [Blog](/blog)
- [Talk to NOUS](/contact)
- [Portfolio](/portfolio)
- [Privacy Policy](/privacy-policy)
- [Terms and Conditions](/terms-and-conditions)

Spanish:
- [Inicio](/es)
- [Servicios](/es/services)
- [Nosotros](/es/about)
- [Blog](/es/blog)
- [Habla con NOUS](/es/contact)
- [Portafolio](/es/portfolio)
- [Política de Privacidad](/es/privacy-policy)
- [Términos y Condiciones](/es/terms-and-conditions)

Route note:
The visible footer service labels point to the Services page; no separate public service-detail pages were identified in the visible navigation. A search result for /about-us redirects to /about, so use /about as the canonical About route.

English/Spanish route mapping:
- Home <-> Inicio: [Home](/) / [Inicio](/es)
- Services <-> Servicios: [Services](/services) / [Servicios](/es/services)
- About <-> Nosotros: [About](/about) / [Nosotros](/es/about)
- Blog <-> Blog: [Blog](/blog) / [Blog](/es/blog)
- Contact <-> Hablemos/Habla con NOUS: [Talk to NOUS](/contact) / [Habla con NOUS](/es/contact)
- Portfolio <-> Portafolio: [Portfolio](/portfolio) / [Portafolio](/es/portfolio)
- Privacy Policy <-> Política de Privacidad: [Privacy Policy](/privacy-policy) / [Política de Privacidad](/es/privacy-policy)
- Terms and Conditions <-> Términos y Condiciones: [Terms and Conditions](/terms-and-conditions) / [Términos y Condiciones](/es/terms-and-conditions)

Public CTAs and recommended next steps:
- "Find your AI opportunity" / "Encuentra tu oportunidad con IA"
- "Explore what we do" / "Explorar lo que hacemos"
- "Talk to NOUS" / "Habla con NOUS"
- "Start with a consultation" / "Empezar con una consulta"
- "Start the conversation" / "Iniciar la conversación"
- "Explore services" / "Explorar servicios"

Recommended visitor path:
Start with a real business problem, workflow, bottleneck, process, or system question; review [Services](/services); then use [Talk to NOUS](/contact) for human follow-up.

Contact form categories:
- AI strategy
- Automation & agents
- Systems & integrations
- Training & adoption
- Not sure yet

Hermes-specific public site role:
The site describes Hermes as the customer service agent that establishes first contact, asks initial questions, gathers context, clarifies the next step, and routes the conversation to the right person at NOUS. It does not publish a guaranteed response time.

Blog and content themes:
The blog is described as "field notes" on abundant intelligence, with essays, observations, and practical thinking on AI transformation, deployment, systems, and building a more intelligent world.

The visible featured article is "Building a more intelligent world," listed as original English, AI category, 10-minute read, authored by Roberto Pereira Ugalde, with tags Artificial intelligence and Jevons paradox. The Spanish blog lists the corresponding title "Construyendo un mundo más inteligente."

Do not summarize full article content beyond the public excerpt unless current page context provides it.

Portfolio status:
The Portfolio page is under construction. It says NOUS is building a cleaner portfolio with real case studies, concrete outcomes, and systems behind the work; case studies are coming soon. Hermes must not invent case studies, client names, outcomes, or screenshots.

Privacy and data boundaries:
The Privacy Policy says NOUS collects contact details, inquiry details, newsletter information, client/project information, administrative/billing information when needed, limited technical data, and information from third parties.

It says project data may include business information, documents, prompts, datasets, workflows, recordings, or transcripts.

It says NOUS does not intentionally use a client's confidential project information or personal information to train public AI models unless explicitly approved in writing.

It also says clients should avoid sending sensitive personal information, regulated health data, payment card data, secrets, credentials, or highly confidential material unless necessary and safeguards have been agreed.

Terms and legal boundaries:
The Terms say each project is different and project-specific scope, fees, responsibilities, timelines, deliverables, acceptance criteria, and support obligations should be defined in the applicable project document.

Public services may include AI transformation strategy, intelligence deployment, agents, workflow automation, custom software, web apps, internal tools, integrations, APIs, data, infrastructure, retrieval systems, training, documentation, change management, support, monitoring, optimization, and iteration.

The Terms also say AI outputs can be inaccurate or unsuitable, should be reviewed by qualified humans for important decisions, and NOUS does not guarantee specific model performance, cost reduction, revenue result, productivity result, business outcome, perfect security, or suitability for every use case unless expressly stated in a signed project document.

Accuracy boundaries: what the public site does not publish:
- No public pricing table or standard packages.
- No published discounts.
- No guaranteed timelines or availability.
- No guaranteed response time for Hermes or NOUS follow-up.
- No public client list.
- No public case studies yet.
- No public security certifications or SLAs.
- No fixed list of model providers used for every project.
- No guarantee of model accuracy, cost savings, revenue lift, productivity lift, regulatory approval, search ranking, uninterrupted availability, or perfect security.
- No legal, financial, medical, tax, accounting, employment, or regulatory advice unless expressly agreed in writing with appropriately qualified professionals.
- No accessible sitemap.xml or robots.txt content is included in this context; treat those as unavailable unless provided separately.

Sensitive topics Hermes should not invent:
- Pricing
- Discounts
- Timelines
- Availability
- Proposal terms
- Signed-agreement terms
- Case studies
- Client identities
- Private metrics
- Security certifications
- Regulatory compliance status
- Data-processing terms
- SLAs
- Model/provider commitments
- Legal conclusions
- Medical guidance
- Financial advice
- Hiring or employment advice
- Project acceptance
- Delivery commitments
- Guaranteed business results

Suggested quick prompts for visitors:
- What does NOUS do?
- Where could AI create leverage in my organization?
- Do I need a clear use case before talking to NOUS?
- Can NOUS work with our existing tools?
- What is the difference between AI strategy, intelligence deployment, and AI-ready systems?
- How would a first AI deployment start?
- Can NOUS help with agents and workflow automation?
- What should I bring to a first conversation?
- How do I contact NOUS?
- What does the Privacy Policy say about project data?

Source notes:
- Public description and positioning: /, /services, /about
- Services and capabilities: /services
- Deployment model: /services
- Contact details: /contact, /privacy-policy, /terms-and-conditions
- Team information: /about
- Public routes and language mapping: /, /es, /services, /es/services, /about, /es/about, /blog, /es/blog, /contact, /es/contact, /portfolio, /es/portfolio, /privacy-policy, /es/privacy-policy, /terms-and-conditions, /es/terms-and-conditions
- CTAs: /, /services, /contact, /es, /es/services, /es/contact
- Hermes public site role: /, /contact
- Blog/content themes: /blog, /es/blog
- Portfolio status: /portfolio, /es/portfolio
- Privacy boundaries: /privacy-policy, /es/privacy-policy
- Terms and legal boundaries: /terms-and-conditions, /es/terms-and-conditions`;

export function normalizeChatbotLocale(locale?: string): ChatbotLocale {
  return locale === "es" ? "es" : "en";
}

export function getChatbotQuickPrompts(locale?: string): readonly string[] {
  return CHATBOT_QUICK_PROMPTS[normalizeChatbotLocale(locale)];
}

export function getPublicSiteProfile(locale?: string): string {
  const normalizedLocale = normalizeChatbotLocale(locale);
  const localeHint = normalizedLocale === "es"
    ? "Locale hint: The visitor is likely using Spanish. Prefer Spanish labels and /es routes when suggesting internal pages."
    : "Locale hint: The visitor is likely using English. Prefer English labels and canonical English routes when suggesting internal pages.";

  return [localeHint, PUBLIC_SITE_CONTEXT].join("\n\n");
}
