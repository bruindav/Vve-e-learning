// fix 20
// VUL HIERONDER JE EIGEN FIREBASE-CONFIGURATIE IN
// (Firebase Console > Projectinstellingen > Jouw apps > Web app > SDK setup and configuration)
export const firebaseConfig = {
  apiKey: "VUL_IN",
  authDomain: "VUL_IN",
  projectId: "VUL_IN",
  storageBucket: "VUL_IN",
  messagingSenderId: "VUL_IN",
  appId: "VUL_IN",
};

// E-mailadres van de beheerder. Dit bepaalt alleen of de beheerpagina in de UI wordt getoond —
// de echte beveiliging zit in de Firestore-regels (zie firestore.rules).
export const ADMIN_EMAIL = "VUL_IN@voorbeeld.nl";

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
