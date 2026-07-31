// fix 21
// VUL HIERONDER JE EIGEN FIREBASE-CONFIGURATIE IN
// (Firebase Console > Projectinstellingen > Jouw apps > Web app > SDK setup and configuration)
export const firebaseConfig = {
  apiKey: "AIzaSyBMKmzFlWhetUjb7NoxanWAS9gT-VEhDrs",
  authDomain: "vve-elearning.firebaseapp.com",
  projectId: "vve-elearning",
  storageBucket: "vve-elearning.firebasestorage.app",
  messagingSenderId: "345240440061",
  appId: "1:345240440061:web:22523f00da850b9dbec294",
};

// E-mailadres van de beheerder. Dit bepaalt alleen of de beheerpagina in de UI wordt getoond —
// de echte beveiliging zit in de Firestore-regels (zie firestore.rules).
export const ADMIN_EMAIL = "davedebruin123@gmail.com";

// EmailJS-configuratie voor bevestigingsmails (registratie + goedkeuring).
// Aanmaken op https://www.emailjs.com (gratis tot 200 mails/maand):
// 1. Account aanmaken, Email Service koppelen (bv. Gmail)
// 2. Twee templates aanmaken: één voor 'registratie ontvangen', één voor 'goedgekeurd'
// 3. Service ID, beide Template ID's en de Public Key hieronder invullen
export const EMAILJS_SERVICE_ID = "VUL_IN";
export const EMAILJS_PUBLIC_KEY = "VUL_IN";
export const EMAILJS_TEMPLATE_REGISTERED = "VUL_IN";
export const EMAILJS_TEMPLATE_APPROVED = "VUL_IN";

// Alle modules die in het systeem bestaan. slug moet overeenkomen met de bestandsnaam
// (zonder .html) in de map modules/.
export const ALL_MODULES = [
  { slug: "basis", title: "Module 1 — Grip op de VvE-boekhouding" },
  { slug: "gevorderden", title: "Module 2 — VvE-boekhouding voor gevorderden" },
  { slug: "overeenkomsten-alv", title: "Module 3 — Overeenkomsten, offertes & de ALV" },
  { slug: "mjop", title: "Module 4 — Het MJOP begrijpen en beoordelen" },
  { slug: "geld-risico", title: "Module 5 — Lenen, verzekeren, aansprakelijkheid" },
  { slug: "verduurzaming", title: "Module 6 — Verduurzaming van het gebouw" },
  { slug: "statuten-reglementen", title: "Module 7 — Statuten en reglementen" },
  { slug: "kascommissie", title: "Module 8 — Wat doe je als kascommissie" },
  { slug: "ledenadministratie-privacy", title: "Module 9 — Ledenadministratie en privacy" },
  { slug: "bijdragen-incasso", title: "Module 10 — Bijdragen, incasso en achterstanden" },
  { slug: "vve-en-omgeving", title: "Module 11 — VvE en omgeving" },
  { slug: "conflict-burenruzies", title: "Module 12 — Conflict, burenruzies en overlast" },
];
