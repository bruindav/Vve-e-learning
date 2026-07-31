// fix 20
// Gedeelde Firebase Authentication + Firestore helpers.
// Gebruikt de modulaire Firebase Web SDK (v10) rechtstreeks vanaf de gstatic CDN,
// zodat er geen build-stap nodig is en dit gewoon op GitHub Pages werkt.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithEmailAndPassword,
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
  collection,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const EMAIL_STORAGE_KEY = "vveLoginEmail";

// Firestore document-ID's mogen geen '/' bevatten; we normaliseren het e-mailadres
// verder niet meer dan lowercasen, dat is voldoende voor een geldige doc-ID.
function emailToDocId(email) {
  return email.trim().toLowerCase();
}

/**
 * Registreert (indien nieuw) een VvE-document in Firestore en verstuurt de inloglink.
 */
export async function registerAndSendLink(email, vveName) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Vul een geldig e-mailadres in.");
  }
  const docId = emailToDocId(cleanEmail);
  const ref = doc(db, "vves", docId);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      email: cleanEmail,
      naam: vveName || "",
      moduleAccess: {},
      createdAt: serverTimestamp(),
    });
  }
  const actionCodeSettings = {
    url: window.location.origin + "/vve-e-learning/register.html",
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
  localStorage.setItem(EMAIL_STORAGE_KEY, cleanEmail);
}

/**
 * Als de huidige URL een magic-link inlog-URL is, rondt dit het inloggen af.
 * Geeft de ingelogde user terug, of null als er geen link was.
 */
export async function completeSignInIfLink() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!email) {
      email = window.prompt("Bevestig het e-mailadres waarmee je je hebt geregistreerd:");
    }
    if (!email) return null;
    const result = await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem(EMAIL_STORAGE_KEY);
    window.history.replaceState({}, document.title, window.location.pathname);
    return result.user;
  }
  return null;
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function adminSignIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function getVveDocForCurrentUser() {
  const user = auth.currentUser;
  if (!user || !user.email) return null;
  const ref = doc(db, "vves", emailToDocId(user.email));
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function hasModuleAccess(slug) {
  const vve = await getVveDocForCurrentUser();
  return !!(vve && vve.moduleAccess && vve.moduleAccess[slug] === true);
}

export async function getAllVves() {
  const snap = await getDocs(collection(db, "vves"));
  const out = [];
  snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
  out.sort((a, b) => (a.naam || a.email).localeCompare(b.naam || b.email));
  return out;
}

export async function setModuleAccess(vveDocId, slug, enabled) {
  const ref = doc(db, "vves", vveDocId);
  await updateDoc(ref, { [`moduleAccess.${slug}`]: enabled });
}

export function logout() {
  return signOut(auth);
}
