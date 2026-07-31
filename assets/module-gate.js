// fix 20
import { watchAuth, hasModuleAccess, completeSignInIfLink } from "./vve-auth.js?v3";

function showDenied(reason) {
  document.documentElement.style.visibility = "";
  document.body.innerHTML =
    '<div style="min-height:100vh; display:flex; align-items:center; justify-content:center; ' +
    'padding:24px; background:#132228; font-family:\'IBM Plex Sans\',sans-serif;">' +
    '<div style="max-width:380px; width:100%; background:#ECE4D1; border-radius:4px; ' +
    'padding:32px 28px; text-align:center; box-shadow:0 20px 50px -20px #000000a0;">' +
    '<div style="font-family:\'IBM Plex Mono\',monospace; font-size:11px; letter-spacing:.14em; ' +
    'text-transform:uppercase; color:#a86f1c; margin-bottom:14px;">Digidave &middot; E-learning VvE-bestuur</div>' +
    '<h1 style="font-family:Georgia,serif; font-size:22px; color:#2A2118; margin:0 0 10px;">Geen toegang</h1>' +
    '<p style="font-size:13.5px; color:#5A5040; line-height:1.5; margin:0 0 20px;">' + reason + '</p>' +
    '<a href="../index.html" style="display:inline-block; padding:11px 18px; background:#C98A2C; ' +
    'color:#0d1a1f; font-weight:600; font-size:14px; border-radius:3px; text-decoration:none;">' +
    '&larr; Terug naar overzicht</a>' +
    '</div></div>';
}

export function guardModule(slug) {
  completeSignInIfLink().catch(() => {});

  watchAuth(async (user) => {
    if (!user) {
      window.location.href = "../register.html?module=" + encodeURIComponent(slug);
      return;
    }
    try {
      const ok = await hasModuleAccess(slug);
      if (ok) {
        document.documentElement.style.visibility = "";
      } else {
        showDenied(
          "Deze module is nog niet vrijgegeven voor jullie VvE. Neem contact op als jullie hier toegang toe willen."
        );
      }
    } catch (e) {
      showDenied("Er ging iets mis bij het controleren van je toegang. Probeer het later opnieuw.");
    }
  });
}
