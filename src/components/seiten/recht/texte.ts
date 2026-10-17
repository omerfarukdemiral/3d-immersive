import { company } from "@/content/site";

/**
 * Texte von Impressum und Datenschutzerklärung — Platzhalter für ein
 * fiktives Demo-Projekt. Alle Unternehmensdaten (siehe content/site.ts)
 * sind frei erfunden; die Texte sind keine geprüften Rechtstexte.
 */

/* ------------------------------------------------------------------ */
/* Impressum                                                           */
/* ------------------------------------------------------------------ */

/*
 * Fiktive Angaben aus content/site.ts. Für einen echten Einsatz sind
 * alle Felder durch die Daten des Betreibers zu ersetzen.
 */

export const impressumLead =
  "Legal notice under § 5 DDG (German Digital Services Act). Please note: this is a fictional demo project. The company, people, address and contact details are made up.";

const anschrift = `${company.address.street}, ${company.address.zip} ${company.address.city}`;

export const impressumDaten = [
  { k: "Company", v: company.legalName },
  { k: "Address", v: anschrift },
  { k: "Commercial register", v: company.tradeRegister },
  { k: "General partner", v: company.generalPartner },
  { k: "Managing director", v: company.managingDirector },
  { k: "VAT ID", v: company.vatId },
  { k: "Phone", v: company.phone.display },
  { k: "Email", v: company.email.display },
  {
    k: "Responsible for content",
    v: `${company.managingDirector}, ${anschrift}`,
  },
] as const;

/** Abschnitte des Impressums; `id` ist zugleich Kapitel und Sprungziel. */
export const impressumAbschnitte = [
  {
    id: "demo",
    h: "Demo project",
    p: [
      `This website is a fictional demo project that showcases an immersive 3D web interface. ${company.legalName} does not exist. All names, figures, addresses and register details are placeholders.`,
      "No contracts are concluded and no services are offered through this site. Form submissions are not passed on to any company.",
    ],
  },
  {
    id: "haftung-inhalte",
    h: "Liability for content",
    p: [
      "As a service provider, we are responsible for our own content on these pages under general German law. We are not, however, obliged to monitor third-party information that is transmitted or stored, or to look for circumstances that indicate unlawful activity.",
      "This does not affect obligations to remove or block the use of information under general law. Liability in this respect only applies from the moment we become aware of a specific infringement. Once we learn of such an infringement, we will remove the content without delay.",
    ],
  },
  {
    id: "haftung-links",
    h: "Liability for links",
    p: [
      "Our site contains links to external third-party websites whose content we do not control. We therefore cannot accept any liability for that content. The respective provider or operator is always responsible for the content of linked pages. The linked pages were checked for possible legal violations at the time of linking. No unlawful content was apparent at that time.",
      "Ongoing monitoring of linked pages is not reasonable without specific evidence of an infringement. Once we learn of an infringement, we will remove such links without delay.",
    ],
  },
  {
    id: "urheberrecht",
    h: "Copyright",
    p: [
      "Content and works created by the site operators on these pages are subject to German copyright law. Any reproduction, editing, distribution or other use beyond the limits of copyright law requires the written consent of the respective author or creator.",
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/* Datenschutz                                                         */
/* ------------------------------------------------------------------ */

/*
 * Platzhalter-Datenschutzerklärung für das Demo-Projekt. Sie beschreibt
 * den technischen Stand dieser Seite (keine Cookies, keine Analyse,
 * lokale Schriften, Karte als statisches SVG), ersetzt aber keine
 * juristische Prüfung.
 */

export const datenschutzLead =
  "What data is collected when you visit this website, what it is used for and what rights you have. Please note: this is a fictional demo project with placeholder details.";

/**
 * Abschnitte der Datenschutzerklärung. Die Sprungziele `ds-0` … `ds-9`
 * sind dieselben wie auf der alten Seite, damit bestehende Links auf
 * einen Abschnitt weiter treffen.
 */
export const datenschutzAbschnitte = [
  {
    h: "Data controller",
    inhalt: [
      `${company.legalName}, ${company.address.street}, ${company.address.zip} ${company.address.city}. Phone ${company.phone.display}, email ${company.email.display}. Represented by ${company.managingDirector}.`,
      "The data controller is the natural or legal person who, alone or jointly with others, decides on the purposes and means of processing personal data.",
    ],
  },
  {
    h: "Inquiries and forms",
    inhalt: [
      "When you contact us through a form on this website, by email or by phone, we process your details to handle your inquiry and any follow-up questions. This includes your title, name, email address, phone number and the content of your message. The turbine sales form also collects the optional turbine details.",
      "The legal basis is Art. 6(1)(b) GDPR where the inquiry relates to entering into a contract, and otherwise Art. 6(1)(f) GDPR, based on our legitimate interest in responding.",
      "We delete this data once it is no longer needed for that purpose. Where an inquiry leads to a contract, statutory retention periods under commercial and tax law apply.",
    ],
  },
  {
    h: "Server logs",
    inhalt: [
      "When you visit this website, the server automatically records data sent by your browser: the page requested, date and time, amount of data transferred, referrer, browser type, operating system and IP address.",
      "This processing is technically necessary to deliver the site and keep it stable and secure. The legal basis is Art. 6(1)(f) GDPR. This data is not combined with other data sources.",
    ],
  },
  {
    h: "Cookies and analytics",
    inhalt: [
      "This website sets no cookies that are not required for it to work. We use no analytics, tracking or advertising tools, and we do not build profiles. That is why you see no consent banner.",
    ],
  },
  {
    h: "Fonts and external content",
    inhalt: [
      "All fonts are served from our own server. There is no connection to Google Fonts or any other font service, and no data is sent to third parties in the process.",
      "No maps, video platforms or social media elements are embedded. The map of Germany on the references page is a static graphic hosted on our own server and does not call any map service. The map link on the contact page only takes you to OpenStreetMap once you click it. From then on, the OpenStreetMap Foundation's privacy policy applies.",
    ],
  },
  {
    h: "Hosting",
    inhalt: [
      "This website is hosted by a service provider within the European Union. We have a data processing agreement with the provider under Art. 28 GDPR, and processing takes place only on our instructions.",
      "The provider processes the server logs described above on our behalf to deliver the site and keep it running securely. The logs are deleted automatically after a short time and are not combined with other data sources. The legal basis is our legitimate interest in secure and stable operation under Art. 6(1)(f) GDPR.",
    ],
  },
  {
    h: "Sending form messages",
    inhalt: [
      "In this demo, form submissions are neither sent nor stored. The site only confirms receipt so you can see how the process works.",
      "One form field is hidden from you and serves to block automated submissions. If a program fills it in, we discard the message. Your behavior is not analyzed, and nothing is passed on to third parties.",
      "You can always reach us by phone or email instead of using the form. Our contact details are on the contact page and in the imprint.",
    ],
  },
  {
    h: "Recipients of data",
    inhalt: [
      "We do not sell your data or share it for advertising purposes. Data is only passed on to service providers who help us run the website and send messages, and only under a data processing agreement pursuant to Art. 28 GDPR.",
    ],
  },
  {
    h: "Your rights",
    inhalt: [
      "You have the right to access the data stored about you (Art. 15 GDPR), and to rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18) and data portability (Art. 20).",
      "You may object at any time to processing based on a legitimate interest (Art. 21 GDPR). You may withdraw any consent you have given at any time, with effect for the future.",
      `To exercise these rights, simply send a message to ${company.email.display}. You also have the right to lodge a complaint with a data protection supervisory authority, usually the one where you live or where our company is based.`,
    ],
  },
  {
    h: "Data security",
    inhalt: [
      "This website is served exclusively over an encrypted connection (TLS), shown by the padlock icon in your browser's address bar. This protects the data you send us from being intercepted in transit.",
    ],
  },
].map((a, i) => ({ ...a, id: `ds-${i}` }));

/** Überschrift und Einleitung des Schlussteils „was fehlt". */
export const nichtTitel = "What this website doesn't do";
export const nichtEinleitung =
  "In short: we do not use any of the following tools or services on this website.";
export const nichtSchluss =
  "That is why the website shows no consent banner when you visit.";

/** Negativliste – was hier bewusst nicht eingebunden ist. */
export const nichtEingesetzt = [
  "No analytics or statistics tools, not even self-hosted ones",
  "No cookies other than strictly necessary ones, and currently the site sets none",
  "No fonts from Google Fonts or any other external service",
  "No embedded maps, video platforms, social media buttons or chat widgets",
  "No advertising or retargeting pixels, no profiling",
  "No sharing of your details for advertising purposes",
] as const;

/* ------------------------------------------------------------------ */
/* 404                                                                 */
/* ------------------------------------------------------------------ */

/** [NEU] Titel der 404-Seite. */
export const fehlerTitel = "No turbine stands here.";
/** Zweiter Titel der 404-Seite; steht als Zeile darunter. */
export const fehlerAlt = "This page doesn't exist.";
export const fehlerText =
  "There is no page at this address. The link may come from our previous website or contain a typo. You can reach everything through the sections below.";

/* ------------------------------------------------------------------ */
/* Abspann                                                             */
/* ------------------------------------------------------------------ */

/*
 * Für Rechtsseiten gibt es keinen eigenen Abspann-Titel. Es gilt darum der Schluss der
 * Startseite (src/app/(site)/_start/Kapitelfolge.tsx), wortgleich.
 */
export const schlussTitel = "Talk to us about your turbine.";
export const schlussLead =
  "For a first assessment, we need the turbine model, rated output, year of construction and location. We'll get back to you with a concrete answer.";
