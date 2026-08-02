// fix 34
// Gedeelde Firebase Authentication + Firestore helpers.
// Patroon: registratie met e-mail/wachtwoord -> pending-status -> admin keurt goed en
// wijst modules toe -> bevestigingsmail bij registratie én bij goedkeuring (via EmailJS).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  firebaseConfig,
  EMAILJS_SERVICE_ID,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_TEMPLATE_ID,
  ALL_MODULES,
} from "./firebase-config.js?v36";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ======================= Registratie / login (VvE) =======================

export async function registerVve(email, password, naam) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Vul een geldig e-mailadres in.");
  }
  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const ref = doc(db, "vves", cred.user.uid);
  await setDoc(ref, {
    email: cleanEmail,
    naam: naam || "",
    status: "pending",
    moduleAccess: {},
    createdAt: serverTimestamp(),
  });
  await sendRegistrationEmail(cleanEmail, naam);
  return cred.user;
}

export async function loginVve(email, password) {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function resetPasswordVve(email) {
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getVveDocForCurrentUser() {
  const user = auth.currentUser;
  if (!user) return null;
  const ref = doc(db, "vves", user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function hasModuleAccess(slug) {
  const vve = await getVveDocForCurrentUser();
  return !!(
    vve &&
    vve.status === "approved" &&
    vve.moduleAccess &&
    vve.moduleAccess[slug] === true
  );
}

export function logout() {
  return signOut(auth);
}

// ======================= Beheerder =======================

export async function adminSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function getAllVves() {
  const snap = await getDocs(collection(db, "vves"));
  const out = [];
  snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
  // Pending eerst, dan op naam/e-mail
  out.sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return (a.naam || a.email).localeCompare(b.naam || b.email);
  });
  return out;
}

/**
 * Keurt een VvE goed: zet status op 'approved', kent de gekozen modules toe,
 * en verstuurt de goedkeuringsmail.
 */
export async function approveVve(vveDocId, email, naam, moduleAccess) {
  const ref = doc(db, "vves", vveDocId);
  await updateDoc(ref, {
    status: "approved",
    moduleAccess,
    approvedAt: serverTimestamp(),
  });
  await sendApprovalEmail(email, naam, moduleAccess);
}

export async function setModuleAccess(vveDocId, slug, enabled) {
  const ref = doc(db, "vves", vveDocId);
  await updateDoc(ref, { [`moduleAccess.${slug}`]: enabled });
}

export async function deleteVve(vveDocId) {
  await deleteDoc(doc(db, "vves", vveDocId));
}

// ======================= EmailJS bevestigingsmails =======================

function _loginLink() {
  return window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "register.html";
}

function _loadEmailJs() {
  if (window.emailjs) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function sendRegistrationEmail(email, naam) {
  if (EMAILJS_SERVICE_ID === "VUL_IN") return; // EmailJS nog niet geconfigureerd
  if (!email) { console.warn("[vve-auth] registratiemail overgeslagen: geen e-mailadres"); return; }
  try {
    await _loadEmailJs();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      email: email,
      to_name: naam || email,
      email_subject: "Aanmelding ontvangen — VvE e-learning",
      email_body:
        "Bedankt voor je aanmelding bij de VvE e-learning!\n\n" +
        "Je aanvraag wordt nu bekeken. Zodra deze is goedgekeurd, ontvang je een bevestiging " +
        "met de modules die voor jullie VvE zijn vrijgegeven.\n\n" +
        "Goed om te weten: ieder bestuurslid kan zich met het eigen e-mailadres apart aanmelden " +
        "\u2014 je hoeft dit account dus niet te delen.\n\n" +
        "We wensen je veel succes met het bestuurswerk!\n\n" +
        "Inloggen kan hier zodra je bent goedgekeurd:\n" +
        _loginLink(),
    });
  } catch (e) {
    console.error("[vve-auth] registratiemail mislukt:", e);
  }
}

export async function sendModulesUpdatedEmail(email, naam, moduleAccess) {
  if (EMAILJS_SERVICE_ID === "VUL_IN") return; // EmailJS nog niet geconfigureerd
  if (!email) { console.warn("[vve-auth] update-mail overgeslagen: geen e-mailadres"); return; }
  try {
    await _loadEmailJs();
    const modulesText = ALL_MODULES
      .filter((mod) => moduleAccess && moduleAccess[mod.slug] === true)
      .map((mod) => "- " + mod.title)
      .join("\n") || "(op dit moment geen modules)";
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      email: email,
      to_name: naam || email,
      email_subject: "Je moduletoegang is bijgewerkt \u2014 VvE e-learning",
      email_body:
        "Je toegang tot de VvE e-learning is zojuist aangepast. Je hebt nu toegang tot de volgende modules:\n\n" +
        modulesText +
        "\n\nInloggen kan hier:\n" +
        _loginLink(),
    });
  } catch (e) {
    console.error("[vve-auth] update-mail mislukt:", e);
  }
}

export async function sendApprovalEmail(email, naam, moduleAccess) {
  if (EMAILJS_SERVICE_ID === "VUL_IN") return; // EmailJS nog niet geconfigureerd
  if (!email) { console.warn("[vve-auth] goedkeuringsmail overgeslagen: geen e-mailadres"); return; }
  try {
    await _loadEmailJs();
    const modulesText = ALL_MODULES
      .filter((mod) => moduleAccess && moduleAccess[mod.slug] === true)
      .map((mod) => "- " + mod.title)
      .join("\n") || "(nog geen modules toegekend)";
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      email: email,
      to_name: naam || email,
      email_subject: "Je hebt toegang tot de VvE e-learning!",
      email_body:
        "Goed nieuws \u2014 je aanmelding voor de VvE e-learning is goedgekeurd. Je hebt nu toegang tot de volgende modules:\n\n" +
        modulesText +
        "\n\nWe wensen je veel succes en plezier met het bestuurswerk!\n\n" +
        "Inloggen kan hier:\n" +
        _loginLink(),
    });
  } catch (e) {
    console.error("[vve-auth] goedkeuringsmail mislukt:", e);
  }
}
