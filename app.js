import {
  bytesToHex, contactCodeExists, contactExists, contactNameConflict, decryptKey, encryptKey, hexToBytes,
  hasFreshProfile, isValidPubkey, loadContacts, loadKeyRecord, makeCallId, makeContactRecord,
  normalizeName, saveContacts, saveKeyRecord, deleteKeyRecord, verifyCallEvent,
  kódLétrehozása, hívásKódNormalizálása, névNormalizálása, frissProfilLétezik,
  kódÉrvényes
} from './security.js';

const alkalmazás = document.querySelector('#app');
const gyoker = alkalmazás;
const tároló = 'nostrcall-fiok-v1';
const alapRelékek = ['wss://relay.primal.net', 'wss://nos.lol', 'wss://relay.damus.io'];
const ikonok = {
  ember: '<svg class="avatar-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor"/><circle cx="12" cy="9" r="3" fill="none" stroke="currentColor"/><path d="M5.5 18.5c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
  mikro: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="9" y="3" width="6" height="12" fill="none" stroke="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
  hang: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 10.5c4.5-4 11.5-4 16 0v5l-4 2-3-4h-2l-3 4-4-2z" fill="none" stroke="currentColor" stroke-linejoin="round"/></svg>',
  nyil: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  marka: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 10h4l2-5 3 10 2-5h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>'
};
const jelek = ikonok;

const üzenetek = {
  en: {
    app: 'NostrCall', tag: 'VOICE OVER NOSTR', homeTitle: 'Make a private call.', homeLead: 'Enter a contact code to look up who you want to reach.', codeLabel: 'CONTACT CODE', codePlaceholder: 'For example, 7K4Q9M', next: 'Continue', yourCode: 'YOUR CALLING CODE', copy: 'Copy', copied: 'Copied', settings: 'Settings', relays: 'relays connected', unavailable: 'Nostr library unavailable. Check your connection and reload.',
    welcome: 'Your voice, your keys.', welcomeLead: 'Create a local account to get a short code people can call.', név: 'DISPLAY NAME', namePlaceholder: 'How should people see you?', customCode: 'CUSTOM CALLING CODE', customCodePlaceholder: 'Leave blank to generate one', start: 'Start', agree: 'By continuing, you agree to the', terms: 'Terms of Service', privacy: 'Privacy Policy', and: 'and', codeIntro: 'Your calling code', codeHelp: 'You can share this code with people you trust.',
    lookupTitle: 'Call this person?', call: 'Call', cancel: 'Cancel', unknown: 'No account found for this code. The person may be offline or not published to these relays.',
    calling: 'Calling', ringing: 'Ringing', connecting: 'Connecting', connected: 'Connected', busy: 'Busy', noanswer: 'No answer', rejected: 'Call declined', ended: 'Call ended', incoming: 'Incoming call', from: 'is calling you', accept: 'Accept', decline: 'Decline', hangup: 'End call', mute: 'Mute microphone', unmute: 'Unmute microphone', deafen: 'Silence audio', undeafen: 'Restore audio', input: 'Microphone', output: 'Speaker', quality: 'Connection quality',
    account: 'Account', save: 'Save changes', saved: 'Saved', display: 'Display name', language: 'Language', english: 'English', hungarian: 'Hungarian', relaySettings: 'Nostr relays', relayHelp: 'One secure WebSocket relay URL per line.', reconnect: 'Save and reconnect', erase: 'Delete account', eraseWarn: 'This permanently removes your local key and settings. Your published relay profile may remain until relays remove it.', eraseFirst: 'Delete this account?', eraseSecond: 'This cannot be undone. Type DELETE to confirm.', typeDelete: 'Type DELETE', deleteNow: 'Delete permanently', back: 'Back', close: 'Close', legal: 'Legal',
    termsTitle: 'Terms of Service', privacyTitle: 'Privacy Policy', lastUpdated: 'Last updated: October 6, 2026', termsP1: 'NostrCall is an experimental, peer-to-peer voice calling demo. By using it, you agree to use it lawfully and respectfully. You are responsible for the display name and calling code you share.', termsP2: 'Calls are not guaranteed to connect, remain private from your device or network provider, or be available at any time. Do not use NostrCall for emergency calls or for information whose loss or disclosure could cause harm.', termsP3: 'You are responsible for protecting access to your device and browser profile. Anyone with access to this browser storage may be able to use your account. Deleting the account removes its key from this browser but cannot recall events already distributed to relays.', termsP4: 'The software is provided as-is, without warranties or service-level commitments, to the extent permitted by law. These terms may be updated with the published application. Applicable mandatory consumer rights remain unaffected.', privacyP1: 'NostrCall has no application server and does not collect analytics. Your private key, display name, settings, and language choice are stored in this browser using local storage or IndexedDB. The private key is used locally to sign and encrypt Nostr events and is never intentionally sent to a relay.', privacyP2: 'Your short code, public key, and display name are published in a public Nostr event so other users can find you. Relay operators may store, copy, index, or disclose that event under their own policies. Anyone who knows your code can look up the public profile and try to call.', privacyP3: 'Call setup messages are encrypted between Nostr keys using NIP-44 v2. Relays can still observe event timing, size, and routing metadata. Voice media is sent directly between browsers with WebRTC, not through the Nostr relays. Your network may observe the peer connection. This demo does not include a TURN relay.', privacyP4: 'The browser asks for microphone permission only when you place or accept a call. Available device labels and selections are handled by the browser. Calls and incoming call alerts work only while the page is open and connected.', privacyP5: 'You can change your name, relay list, or language in Settings and delete the local account there. Clearing site data also removes the locally stored key. Public relay events may persist after either action. For questions, contact the person or organization that hosts this copy of the static site.',
    micDenied: 'Microphone access was not granted. Check your browser permission.', callFail: 'Could not establish the call. Check microphone access and relay connectivity.', relayFail: 'Could not publish to a relay. Check the relay list and connection.', invalidCode: 'Enter a code with 4–24 letters or numbers.', badName: 'Enter a display name.', connectedHint: 'Peer-to-peer audio is active.', notSupported: 'Device selection is not supported by this browser.', noDevice: 'No audio device found.'
  },
  hu: {
    app: 'NostrCall', tag: 'HANGHÍVÁS NOSTR-RELÉKEN', homeTitle: 'Indíts privát hívást.', homeLead: 'Írd be annak a kódját, akit el szeretnél érni.', codeLabel: 'HÍVÁSKÓD', codePlaceholder: 'Például: 7K4Q9M', next: 'Tovább', yourCode: 'A TE HÍVÁSKÓD', copy: 'Másolás', copied: 'Kimásolva', settings: 'Beállítások', relays: 'kapcsolódó relé', unavailable: 'A Nostr-könyvtár nem érhető el. Ellenőrizd a kapcsolatot, majd töltsd újra az oldalt.',
    welcome: 'A hangod, a kulcsaid.', welcomeLead: 'Hozz létre egy helyi fiókot, hogy mások egy rövid kóddal hívhassanak.', név: 'MEGJELENŐ NÉV', namePlaceholder: 'Milyen néven lássanak?', customCode: 'SAJÁT HÍVÁSKÓD', customCodePlaceholder: 'Hagyjál üresen a generáláshoz', start: 'Indítás', agree: 'A folytatással elfogadod a', terms: 'Felhasználási feltételeket', privacy: 'Adatvédelmi irányelveket', and: 'és az', codeIntro: 'A híváskódod', codeHelp: 'Ezt a kódot azokkal oszd meg, akikben megbízol.',
    lookupTitle: 'Felhívod őt?', call: 'Hívás', cancel: 'Mégse', unknown: 'Ehhez a kódhoz nem található fiók. Lehet, hogy a másik fél offline, vagy nincs kint a reléken.',
    calling: 'Hívás', ringing: 'Kicseng', connecting: 'Kapcsolódás', connected: 'Kapcsolódva', busy: 'Foglalt', noanswer: 'Nincs válasz', rejected: 'A hívást elutasították', ended: 'Hívás vége', incoming: 'Bejövő hívás', from: 'hív téged', accept: 'Elfogadás', decline: 'Elutasítás', hangup: 'Hívás befejezése', mute: 'Mikrofon némítása', unmute: 'Mikrofon bekapcsolása', deafen: 'Hang elnémítása', undeafen: 'Hang visszakapcsolása', input: 'Mikrofon', output: 'Hangszóró', quality: 'Kapcsolat minősége',
    account: 'Fiók', save: 'Mentés', saved: 'Mentve', display: 'Megjelenő név', language: 'Nyelv', english: 'Angol', hungarian: 'Magyar', relaySettings: 'Nostr-relék', relayHelp: 'Soronként egy biztonságos WebSocket-relé címe.', reconnect: 'Mentés és újracsatlakozás', erase: 'Fiók törlése', eraseWarn: 'Ez végleg törli a helyi kulcsot és beállításokat. A közzétett reléprofil a relékről még megmaradhat.', eraseFirst: 'Törlöd ezt a fiókot?', eraseSecond: 'Ez nem vonható vissza. A megerősítéshez írd be: DELETE.', typeDelete: 'Írd be: DELETE', deleteNow: 'Végleges törlés', back: 'Vissza', close: 'Bezárás', legal: 'Jogi információk',
    termsTitle: 'Felhasználási feltételek', privacyTitle: 'Adatvédelmi irányelvek', lastUpdated: 'Utolsó frissítés: 2026. október 6.', termsP1: 'A NostrCall egy kísérleti, közvetlen hanghívásra szolgáló bemutató. Használatával vállalod, hogy jogszerűen és másokat tiszteletben tartva használod. Te felelsz a megosztott megjelenő nevedért és híváskódodért.', termsP2: 'A hívás kapcsolódása, a készüléked és hálózati szolgáltatód előtti adatvédelem, illetve a szolgáltatás folyamatos elérhetősége nem garantált. Ne használd segélyhívásra, vagy olyan információhoz, amelynek elvesztése vagy nyilvánosságra kerülése kárt okozhat.', termsP3: 'Te felelsz a készüléked és böngészőprofilod védelméért. A böngészőtárhelyhez hozzáférő személy használhatja a fiókodat. A fiók törlése eltávolítja a kulcsot erről a böngészőről, de a relékre már továbbított eseményeket nem vonja vissza.', termsP4: 'A szoftver a jogszabályok által megengedett mértékig jelen állapotában, garancia és rendelkezésreállási vállalás nélkül használható. A feltételek a közzétett alkalmazással frissülhetnek. A kötelező fogyasztói jogokat ez nem érinti.', privacyP1: 'A NostrCallnak nincs alkalmazásszervere, és nem gyűjt analitikai adatokat. A privát kulcs, a megjelenő név, a beállítások és a nyelv a böngésző helyi tárhelyén vagy IndexedDB-ben maradnak. A privát kulcsot az alkalmazás helyben használja Nostr-események aláírására és titkosítására; szándékosan nem küldi relére.', privacyP2: 'A rövid kód, a nyilvános kulcs és a megjelenő név nyilvános Nostr-eseményként kerül ki, hogy mások megtalálhassanak. A relé üzemeltetője a saját szabályai szerint tárolhatja, másolhatja, indexelheti vagy közzéteheti az eseményt. A kód ismeretében bárki megkeresheti a nyilvános profilt és hívást kezdeményezhet.', privacyP3: 'A hívásjelzés NIP-44 v2 szerint titkosítva halad a Nostr-kulcsok között. A relék ettől még láthatják az események időpontját, méretét és útválasztási adatait. A hang WebRTC-vel közvetlenül a böngészők között utazik, nem a Nostr-reléken. A hálózatod láthatja a partnerkapcsolatot. Ez a bemutató nem használ TURN-relét.', privacyP4: 'A böngésző csak hívás indításakor vagy fogadásakor kér mikrofonengedélyt. Az eszközneveket és választásokat a böngésző kezeli. A hívás és a bejövő hívásjelzés csak nyitott, kapcsolódó oldal mellett működik.', privacyP5: 'A nevedet, reléidet és a nyelvet a Beállításokban módosíthatod, a helyi fiókot pedig ott törölheted. A webhelyadatok törlése szintén eltávolítja a helyben tárolt kulcsot. A nyilvános reléesemények mindkét esetben megmaradhatnak. Kérdés esetén keresd a statikus oldal üzemeltetőjét.',
    micDenied: 'Nem kaptunk hozzáférést a mikrofonhoz. Ellenőrizd a böngésző engedélyeit.', callFail: 'Nem sikerült létrehozni a hívást. Ellenőrizd a mikrofon engedélyét és a relékapcsolatot.', relayFail: 'Nem sikerült relére közzétenni. Ellenőrizd a relélistát és a kapcsolatot.', invalidCode: 'Legalább 4 karakteres kódot adj meg.', badName: 'Adj meg egy nevet.', connectedHint: 'A közvetlen hangkapcsolat aktív.', notSupported: 'A böngésző nem támogatja az eszközválasztást.', noDevice: 'Nem található hangeszköz.'
  }
};

let fiok = null;
let pool = null;
let nyelv = 'en';
let rel = [...alapRelékek];
let nézet = 'home';
let jog = 'terms';
let újKód = kódLétrehozása();
let tarolo = 'nostrcall-fiok-v1';
let találat = null;
let hívás = null;
let aláirtEsemények = new Set();
let aktivRelékek = [];
let nyitott = null;
let hangKép = null;
let könyvtárHiba = false;
let feliratás = null;
let kontaktok = [];
let keyInMemory = null;
let keyPassword = '';
let keyMode = 'plain';
let keyRecord = null;
let keyUnlockTimer = null;
let dependencyCheck = false;
let feldolgozottEsemények = new Set();
let kapottHívásAzonosítók = new Set();
let várakozóJelzés = new Map();

function üzenet(k) { return üzenetek[nyelv]?.[k] || üzenetek.en[k] || k; }
function t(k) { return üzenet(k); }
function esc(v = '') { return kimenetiBiztosít(v); }
function kimenetiBiztosít(v = '') { return String(v).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]); }
function veletlen() { return makeCallId(); }
function ment() { localStorage.setItem(tarolo, JSON.stringify({ pubkey: fiok?.nyilvanos, nev: fiok?.nev, kod: fiok?.kod, nyelv: fiok?.nyelv, rel: fiok?.rel, keyMode, keyRecord: keyRecord?.id || null })); }
function clearKeyMemory() {
  keyInMemory = null;
  keyPassword = '';
  if (keyUnlockTimer) clearTimeout(keyUnlockTimer);
  keyUnlockTimer = null;
}
async function loadKey(keyModeToUse, password = '') {
  clearKeyMemory();
  if (keyModeToUse === 'plain') {
    const stored = await loadKeyRecord(fiok.nyilvanos);
    const keyHex = stored?.keyHex;
    if (!keyHex) throw new Error('missing-key');
    keyInMemory = hexToBytes(keyHex);
    keyRecord = { id: fiok.nyilvanos, mode: 'plain', keyHex, updatedAt: Math.floor(Date.now() / 1000) };
    return;
  }
  if (keyModeToUse !== 'password') throw new Error('unsupported-key-mode');
  const stored = await loadKeyRecord(fiok.nyilvanos);
  if (!stored?.encrypted || !password) throw new Error('missing-password');
  const keyHex = await decryptKey(stored.encrypted, password);
  keyInMemory = hexToBytes(keyHex);
  keyRecord = { ...stored, mode: 'password' };
  keyPassword = password;
  keyUnlockTimer = setTimeout(clearKeyMemory, 15 * 60 * 1000);
  return;
}
async function migrateLegacyKey() {
  const stored = localStorage.getItem(tarolo);
  if (!stored) return false;
  try {
    const parsed = JSON.parse(stored);
    if (!parsed?.titok || !isValidPubkey(parsed.nyilvanos)) return false;
    await saveKeyRecord(parsed.nyilvanos, { mode: 'plain', keyHex: parsed.titok, migrated: true });
    delete parsed.titok;
    localStorage.setItem(tarolo, JSON.stringify(parsed));
    return true;
  } catch { return false; }
}
async function setKeyMode(mode, password = '', confirmation = '') {
  if (!fiok || !keyInMemory) throw new Error('unlock-first');
  if (mode === 'password') {
    if (!password || password.length < 10) throw new Error('weak-password');
    if (password !== confirmation) throw new Error('password-mismatch');
    const encrypted = await encryptKey(bytesToHex(keyInMemory), password);
    await saveKeyRecord(fiok.nyilvanos, { mode: 'password', encrypted });
    keyRecord = { id: fiok.nyilvanos, mode: 'password', encrypted };
    keyMode = 'password';
  } else if (mode === 'plain') {
    const keyHex = bytesToHex(keyInMemory);
    await saveKeyRecord(fiok.nyilvanos, { mode: 'plain', keyHex });
    keyRecord = { id: fiok.nyilvanos, mode: 'plain', keyHex };
    keyMode = 'plain';
  } else throw new Error('unsupported-key-mode');
  clearKeyMemory();
  await loadKey(keyMode, mode === 'password' ? password : '');
  ment();
}
async function deleteKey() {
  if (!fiok) return;
  await deleteKeyRecord(fiok.nyilvanos);
  clearKeyMemory();
  fiok = null;
  localStorage.removeItem(tarolo);
  if (pool && aktivRelékek.length) pool.close(aktivRelékek);
  aktivRelékek = [];
  nézet = 'home';
  render();
}
function jelszam() { return pool?.listConnectionStatus ? [...pool.listConnectionStatus().values()].filter(Boolean).length : 0; }
async function profilEsemeny() {
  if (!fiok || !pool || !window.nostrEszkoz || !keyInMemory) return;
  const { finalizeEvent, verifyEvent } = window.nostrEszkoz;
  const es = finalizeEvent({ kind: 30078, created_at: Math.floor(Date.now() / 1000), tags: [['d', `nostrcall:${fiok.kod}`], ['expiration', String(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30)]], content: JSON.stringify({ kod: fiok.kod, nev: fiok.nev }) }, keyInMemory);
  if (!verifyEvent(es)) throw new Error('invalid-profile-event');
  await Promise.any(pool.publish(rel, es)).catch(() => hiba(t('relayFail')));
}
function hiba(uzenet) {
  const elem = document.querySelector('#hiba');
  if (elem) elem.textContent = uzenet;
}
function meret() {
  const elem = document.querySelector('#relayszam');
  if (elem) elem.textContent = `${jelszam()} ${t('relays')}`;
}
function kapcsol() {
  const ujRel = [...new Set(rel.map(x => x.trim()).filter(x => /^wss:\/\//i.test(x)))];
  if (!ujRel.length) ujRel.push(...alapRel);
  const valtozott = ujRel.join('\n') !== aktivRelékek.join('\n');
  if (feliratás) { try { feliratás.close(); } catch {} feliratás = null; }
  if (pool && valtozott && aktivRelékek.length) pool.close(aktivRelékek);
  rel = ujRel;
  if (pool) {
    pool.trackRelays = true;
    if (valtozott) {
      aktivRelékek = [...rel];
      Promise.allSettled(rel.map(cim => pool.ensureRelay(cim))).then(meret);
    }
    if (fiok) {
      feliratás = pool.subscribeMany(rel, [{ kinds: [25050], '#p': [fiok.nyilvanos], since: Math.floor(Date.now() / 1000) - 90 }], { onevent: es => bejovo(es) });
      profilEsemeny();
    }
  }
  meret();
}
async function esemény(kulcs, cel, tipus, adat) {
  if (!pool || !window.nostrEszkoz || !keyInMemory) throw new Error('nostr');
  const { finalizeEvent, verifyEvent, nip44 } = window.nostrEszkoz;
  const conversationKey = nip44.getConversationKey(keyInMemory, cel);
  const tart = nip44.encrypt(JSON.stringify({ tipus, ...adat }), conversationKey);
  const es = finalizeEvent({ kind: 25050, created_at: Math.floor(Date.now() / 1000), tags: [['p', cel], ['t', 'nostrcall'], ['call', kulcs], ['message', veletlen()]], content: tart }, keyInMemory);
  if (!verifyEvent(es)) throw new Error('invalid-signing-event');
  await Promise.any(pool.publish(rel, es));
}
async function kodKeres(kod) {
  if (!pool || !window.nostrEszkoz?.verifyEvent) throw new Error('nostr');
  const esek = await pool.querySync(rel, { kinds: [30078], '#d': [`nostrcall:${kod}`], limit: 20 });
  const jo = esek.filter(es => es.pubkey !== fiok?.nyilvanos && hasFreshProfile(es)).sort((a, b) => b.created_at - a.created_at);
  for (const es of jo) {
    try {
      const ad = JSON.parse(es.content);
      const valid = window.nostrEszkoz.verifyEvent(es);
      if (valid && ad.kod === kod && ad.nev && isValidPubkey(es.pubkey)) return { nev: ad.nev, nyilvanos: es.pubkey, kod, verified: true };
    } catch {}
  }
  return null;
}
async function bejovo(es) {
  if (es.pubkey === fiok?.nyilvanos || aláirtEsemények.has(es.id) || !window.nostrEszkoz || !keyInMemory || !window.nostrEszkoz.verifyEvent(es)) return;
  aláirtEsemények.add(es.id);
  const context = verifyCallEvent(es, fiok.nyilvanos);
  if (!context.valid || feldolgozottEsemények.has(es.id)) return;
  feldolgozottEsemények.add(es.id);
  try {
    const { nip44 } = window.nostrEszkoz;
    const conversationKey = nip44.getConversationKey(keyInMemory, context.context.sender);
    const adat = JSON.parse(nip44.decrypt(es.content, conversationKey));
    if (!adat?.tipus || !adat.hívás || !isValidPubkey(context.context.sender)) return;
    await jelKezel(context.context.sender, adat, context.context.callId, es.id);
  } catch {}
}
async function jelKezel(peer, adat, callId, eventId) {  if (callId && kapottHívásAzonosítók.has(callId)) return;
  if (callId && hívás?.callId && hívás.callId !== callId) return;
  if (callId) kapottHívásAzonosítók.add(callId);  if (adat.tipus === 'jelolt' && (!hívás || adat.hívás !== hívás.id)) {
    const elozo = várakozóJelzés.get(adat.hívás);
    if (!elozo || elozo.peer === peer) {
      const lista = elozo?.lista || [];
      lista.push(adat.jelolt);
      if (lista.length > 24) lista.shift();
      várakozóJelzés.set(adat.hívás, { peer, lista });
    }
    return;
  }
  if (adat.tipus === 'ajanlat') {
    if (hívás) {
      await esemény(adat.hívás, peer, 'foglalt', { hívás: adat.hívás });
      return;
    }
    const elozo = várakozóJelzés.get(adat.hívás);
    const jeloltek = elozo?.peer === peer ? elozo.lista.map(x => new RTCIceCandidate(x)) : [];
    várakozóJelzés.delete(adat.hívás);
    hívás = { id: adat.hívás, peer, nev: adat.nev || 'Nostr user', irany: 'bejovo', allapot: 'bejovo', ajanlat: adat.sdp, pc: null, stream: null, tavoli: null, zar: jeloltek, nemit: false, siket: false, callId, eventId, verified: true };
    idoLejar(45000);
    render();
  } else if (!hívás || adat.hívás !== hívás.id || peer !== hívás.peer) return;
  else if (adat.tipus === 'valasz' && hívás.irany === 'kimeno') {
    clearTimeout(hívás.ido);
    hívás.allapot = 'kapcsolodas';
    await hívás.pc.setRemoteDescription(adat.sdp);
    await jelSor();
    render();
  } else if (adat.tipus === 'jelolt') {
    const jelolt = new RTCIceCandidate(adat.jelolt);
    if (hívás.pc?.remoteDescription) await hívás.pc.addIceCandidate(jelolt);
    else hívás.zar.push(jelolt);
  } else if (adat.tipus === 'nincsvalasz') hivasLezar('nincsvalasz', false);
  else if (adat.tipus === 'elutasit') hivasLezar('elutasitva', false);
  else if (adat.tipus === 'foglalt') hivasLezar('foglalt', false);
  else if (adat.tipus === 'befejez') hivasLezar('vege', false);
}
async function jelSor() {
  if (!hívás?.pc || !hívás.zar.length) return;
  for (const jelolt of hívás.zar.splice(0)) await hívás.pc.addIceCandidate(jelolt);
}
async function pcLetrehoz() {
  const hc = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
  hívás.stream = hc;
  hívás.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  hc.getTracks().forEach(s => hívás.pc.addTrack(s, hc));
  hívás.pc.onicecandidate = e => { if (e.candidate && hívás) esemény(hívás.id, hívás.peer, 'jelolt', { hívás: hívás.id, jelolt: e.candidate.toJSON() }); };
  hívás.pc.ontrack = e => {
    hangKép = e.streams[0];
    if (hívás) { hívás.tavoli = hangKép; hívás.allapot = 'kapcsolodva'; render(); }
  };
  hívás.pc.onconnectionstatechange = () => {
    if (!hívás?.pc) return;
    const all = hívás.pc.connectionState;
    if (all === 'connected') { hívás.allapot = 'kapcsolodva'; hívás.minoseg = 'good'; }
    else if (all === 'failed' || all === 'closed') { if (all === 'failed') hivasLezar('vege', false); }
    else if (all === 'disconnected' && hívás.allapot === 'kapcsolodva') hívás.minoseg = 'bad';
    render();
  };
  hívás.statisztika = setInterval(async () => {
    if (!hívás?.pc) return;
    try {
      const adatok = await hívás.pc.getStats();
      let rtt = null;
      adatok.forEach(x => { if (x.type === 'candidate-pair' && x.state === 'succeeded' && (x.selected || x.nominated)) rtt = x.currentRoundTripTime; });
      const min = rtt === null ? 'mid' : rtt < 0.18 ? 'good' : rtt < 0.4 ? 'mid' : 'bad';
      if (hívás && hívás.minoseg !== min) {
        hívás.minoseg = min;
        const jelzo = document.querySelector('.quality');
        if (jelzo) jelzo.className = `quality ${min}`;
      }
    } catch {}
  }, 2500);
}
function idoLejar(ms) {
  if (hívás.ido) clearTimeout(hívás.ido);
  hívás.ido = setTimeout(() => {
    if (!hívás) return;
    if (hívás.irany === 'kimeno' && ['hívás', 'cseng', 'kapcsolodas'].includes(hívás.allapot)) esemény(hívás.id, hívás.peer, 'nincsvalasz', { hívás: hívás.id }).catch(() => {});
    hivasLezar('nincsvalasz', false);
  }, ms);
}
async function hiv(ind, nev) {
  if (!pool) { hiba(t('unavailable')); return; }
  hívás = { id: veletlen(), peer: ind, nev, irany: 'kimeno', allapot: 'hívás', pc: null, stream: null, tavoli: null, zar: [], nemit: false, siket: false };
  render();
  idoLejar(45000);
  try {
    await pcLetrehoz();
    const ajanlat = await hívás.pc.createOffer();
    await hívás.pc.setLocalDescription(ajanlat);
    await esemény(hívás.id, ind, 'ajanlat', { hívás: hívás.id, nev: fiok.nev, sdp: hívás.pc.localDescription });
    if (hívás) { hívás.allapot = 'cseng'; render(); }
  } catch {
    hivasLezar('vege', false);
    hiba(t('callFail'));
  }
}
async function fogad() {
  if (!hívás) return;
  clearTimeout(hívás.ido);
  try {
    await pcLetrehoz();
    await hívás.pc.setRemoteDescription(hívás.ajanlat);
    await jelSor();
    const val = await hívás.pc.createAnswer();
    await hívás.pc.setLocalDescription(val);
    hívás.allapot = 'kapcsolodas';
    await esemény(hívás.id, hívás.peer, 'valasz', { hívás: hívás.id, sdp: hívás.pc.localDescription });
    render();
  } catch {
    hivasLezar('vege', true);
    hiba(t('callFail'));
  }
}
function hivasLezar(allapot, kuld) {
  if (!hívás) return;
  const regi = hívás;
  clearTimeout(regi.ido);
  clearInterval(regi.statisztika);
  if (kuld && pool) esemény(regi.id, regi.peer, 'befejez', { hívás: regi.id }).catch(() => {});
  regi.stream?.getTracks().forEach(x => x.stop());
  regi.pc?.close();
  hívás = null;
  hangKép = null;
  nézet = allapot === 'elutasitva' || allapot === 'foglalt' || allapot === 'nincsvalasz' || allapot === 'vege' ? allapot : 'home';
  render();
  if (nézet !== 'home') setTimeout(() => { if (!hívás && ['elutasitva', 'foglalt', 'nincsvalasz', 'vege'].includes(nézet)) { nézet = 'home'; render(); } }, 2600);
}
function minosegRajz() {
  let oszt = hívás?.minoseg || (hívás?.pc?.connectionState === 'connected' ? 'good' : 'mid');
  return `<span class="quality ${osztály}" aria-label="${kimenetiBiztosít(üzenet('quality'))}"><i></i><i></i><i></i></span>`;
}
function kodDoboz(kod, feliratKod) {
  return `<div class="code-box"><span class="code-text">${esc(kod)}</span><button class="copy-btn" data-action="masol" data-kod="${kimenetiBiztosít(kod)}">${esc(t('copy'))}</button></div>`;
}
function fejlec() {
  return `<header class="topbar"><div class="wrap top-inner"><div class="brand"><span class="brand-mark">${jelek.marka}</span>${esc(t('app'))}</div><div class="top-actions"><span class="relay-count"><i class="relay-dot"></i><span id="relayszam">${jelszam()} ${esc(t('relays'))}</span></span>${fiok ? `<button class="icon-btn" data-action="beall" aria-label="${kimenetiBiztosít(üzenet('settings'))}" title="${kimenetiBiztosít(üzenet('settings'))}">${jelek.ember}</button>` : ''}</div></div></header>`;
}
function kezdolap() {
  if (!fiok) return `<section class="home"><div class="eyebrow">${esc(t('tag'))}</div><h1>${esc(t('welcome'))}</h1><p class="lead">${esc(t('welcomeLead'))}</p><form id="kezdo"><label class="field-label" for="név">${esc(t('name'))}</label><input class="text-input" id="név" name="név" maxlength="32" autocomplete="nickname" placeholder="${kimenetiBiztosít(üzenet('namePlaceholder'))}" required><label class="field-label" for="saját-kód">${esc(t('customCode'))}</label><input class="text-input" id="saját-kód" name="saját-kód" maxlength="24" autocomplete="off" placeholder="${kimenetiBiztosít(üzenet('customCodePlaceholder'))}"><p class="form-hiba" id="hiba"></p><div class="profile-code"><div class="profile-code-head"><span>${esc(t('codeIntro'))}</span></div>${kodDoboz(újKód, 'new')}</div><p class="notice">${esc(t('codeHelp'))}</p><div class="divider"></div><button class="primary full" type="submit">${esc(t('start'))}</button><p class="legal-jegyzet">${esc(t('agree'))} <button type="button" data-action="jog" data-jog="terms">${esc(t('terms'))}</button> ${esc(t('and'))} <button type="button" data-action="jog" data-jog="privacy">${esc(t('privacy'))}</button>.</p></form></section>`;
  const status = nézet === 'elutasitva' ? t('rejected') : nézet === 'foglalt' ? t('busy') : nézet === 'nincsvalasz' ? t('noanswer') : nézet === 'vege' ? t('ended') : '';
  return `<section class="home"><div class="eyebrow">${esc(t('tag'))}</div><h1>${esc(t('homeTitle'))}</h1><p class="lead">${esc(t('homeLead'))}</p><form id="keres"><label class="field-label" for="kód">${esc(t('codeLabel'))}</label><input class="text-input" id="kód" name="kód" maxlength="24" autocomplete="off" placeholder="${kimenetiBiztosít(üzenet('codePlaceholder'))}" required><p class="form-hiba" id="hiba">${status ? esc(status) : könyvtárHiba ? esc(t('unavailable')) : ''}</p><button class="primary full" type="submit">${esc(t('next'))}</button></form><div class="profile-code"><div class="profile-code-head"><span>${esc(t('yourCode'))}</span></div>${kodDoboz(fiok.kod)}</div><p class="notice">${esc(t('codeHelp'))}</p></section>`;
}
function jogSzoveg() {
  if (jog === 'terms') return `<h3>${esc(t('termsTitle'))}</h3><p>${esc(t('termsP1'))}</p><p>${esc(t('termsP2'))}</p><p>${esc(t('termsP3'))}</p><p>${esc(t('termsP4'))}</p>`;
  return `<h3>${esc(t('privacyTitle'))}</h3><p>${esc(t('privacyP1'))}</p><p>${esc(t('privacyP2'))}</p><p>${esc(t('privacyP3'))}</p><p>${esc(t('privacyP4'))}</p><p>${esc(t('privacyP5'))}</p>`;
}
function jogNezet() { return `<div class="overlay"><article class="dialog"><div class="settings-head"><div><div class="eyebrow">${esc(t('legal'))}</div><h2>${esc(t(jog === 'terms' ? 'termsTitle' : 'privacyTitle'))}</h2></div><button class="icon-btn" data-action="vissza" aria-label="${kimenetiBiztosít(üzenet('back'))}">×</button></div><p>${esc(t('lastUpdated'))}</p><div class="legal-body">${jogSzoveg()}</div><div class="dialog-actions"><button class="secondary" data-action="vissza">${esc(t('back'))}</button></div></article></div>`; }
function eszkozSor() {
  if (!hívás?.stream) return '';
  return `<div class="device-tools"><button class="secondary" data-action="eszkoz" data-tipus="be">${esc(t('input'))} ${jelek.nyil}</button><button class="secondary" data-action="eszkoz" data-tipus="ki">${esc(t('output'))} ${jelek.nyil}</button></div><div id="eszkozok"></div>`;
}
function hivasAblak() {
  if (!hívás) return '';
  const bej = hívás.irany === 'bejovo';
  const csatl = hívás.allapot === 'kapcsolodva';
  const all = hívás.allapot === 'hívás' ? t('calling') : hívás.allapot === 'cseng' ? t('ringing') : hívás.allapot === 'bejovo' ? t('incoming') : hívás.allapot === 'kapcsolodva' ? t('connected') : t('connecting');
  const identity = `<div class="identity-card"><span>Pubkey</span><strong>${esc(hívás.peer)}</strong><small>${hívás.verified ? 'Signature and call context verified' : 'Identity not verified'}</small></div>`;
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(bej ? t('incoming') : t('app'))}</div><h2>${esc(bej ? hívás.nev : t('lookupTitle'))}</h2><p>${esc(bej ? t('from') : `${t('calling')} ${hívás.nev}`)}</p>${identity}<div class="call-status"><i class="status-pip ${csatl ? '' : 'pulse'}"></i><span>${esc(all)}</span>${csatl ? minosegRajz() : ''}</div>${csatl ? `<p>${esc(t('connectedHint'))}</p><div class="call-toolbar"><button class="icon-btn ${hívás.nemit ? 'active' : ''}" data-action="nemit" aria-label="${kimenetiBiztosít(hívás.nemit ? üzenet('unmute') : üzenet('mute'))}" title="${kimenetiBiztosít(hívás.nemit ? üzenet('unmute') : üzenet('mute'))}">${jelek.mikro}</button><button class="icon-btn ${hívás.siket ? 'active' : ''}" data-action="siket" aria-label="${kimenetiBiztosít(hívás.siket ? üzenet('undeafen') : üzenet('deafen'))}" title="${kimenetiBiztosít(hívás.siket ? üzenet('undeafen') : üzenet('deafen'))}">${jelek.hang}</button><button class="secondary hang" data-action="letesz">${esc(t('hangup'))}</button></div>${eszkozSor()}` : bej ? `<div class="dialog-actions"><button class="danger" data-action="elutasit">${esc(t('decline'))}</button><button class="primary" data-action="fogad">${esc(t('accept'))}</button></div>` : `<div class="dialog-actions"><button class="secondary" data-action="letesz">${esc(t('cancel'))}</button></div>`}</article></div>`;
}
function talalatAblak() {
  if (!találat) return '';
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('lookupTitle'))}</div><h2>${esc(találat.nev)}</h2><p>${esc(találat.kod)}</p><div class="dialog-actions"><button class="secondary" data-action="megse">${esc(t('cancel'))}</button><button class="primary" data-action="hiv">${esc(t('call'))}</button></div></article></div>`;
}
function beallitas() {
  const joNyelv = nyelv;
  const keyWarning = keyMode === 'password' ? 'The private key is kept encrypted in IndexedDB and is unlocked only with the account password.' : 'The private key is stored in IndexedDB in plain form. It is not protected by a password.';
  const contactRows = kontaktok.map(contact => `<div class="settings-row"><span><strong>${esc(contact.név)}</strong><small>${esc(contact.kód)}${contact.nyilvanos ? `  ·  ${esc(contact.nyilvanos)}` : ''}</small></span><div class="kontakt-actions"><button class="icon-btn" data-action="call-contact" data-contact-kód="${kimenetiBiztosít(contact.kód)}" aria-label="Call ${kimenetiBiztosít(contact.név)}">${jelek.marka}</button><button class="icon-btn" data-action="remove-contact" data-contact-id="${kimenetiBiztosít(contact.id)}" aria-label="Remove ${kimenetiBiztosít(contact.név)}">×</button></div></div>`).join('');
  return `<div class="overlay"><article class="dialog"><div class="settings-head"><div><div class="eyebrow">${esc(t('account'))}</div><h2>${esc(t('settings'))}</h2></div><button class="icon-btn" data-action="megse" aria-label="${kimenetiBiztosít(üzenet('close'))}">×</button></div><section class="settings-section"><h3>${esc(t('account'))}</h3><label class="field-label" for="nevbe">${esc(t('display'))}</label><input class="text-input" id="nevbe" maxlength="32" value="${kimenetiBiztosít(fiok.név)}"><div class="settings-row"><span>${esc(t('language'))}</span><select id="nyelv"><option value="en" ${joNyelv === 'en' ? 'selected' : ''}>${esc(t('english'))}</option><option value="hu" ${joNyelv === 'hu' ? 'selected' : ''}>${esc(t('hungarian'))}</option></select></div><div class="settings-links"><button class="text-link" data-action="jog" data-jog="terms">${esc(t('terms'))}</button><button class="text-link" data-action="jog" data-jog="privacy">${esc(t('privacy'))}</button></div><button class="secondary full" style="margin-top:14px" data-action="nevment">${esc(t('save'))}</button></section><section class="settings-section"><h3>Contacts</h3><p class="hint">Calling codes are required. Public keys are optional, so a new contact can be saved without entering one.</p>${contactRows}<label class="field-label" for="kontakt-név">Display name</label><input class="text-input" id="kontakt-név" maxlength="32"><label class="field-label" for="kontakt-kód">Calling code</label><input class="text-input" id="kontakt-kód" maxlength="24" autocomplete="off"><label class="field-label" for="contact-pubkey">Public key (optional)</label><input class="text-input" id="contact-pubkey" maxlength="64" autocomplete="off"><button class="secondary full" data-action="add-contact">Add contact</button></section><section class="settings-section"><h3>Private key storage</h3><p class="hint">${esc(keyWarning)}</p><select class="select-input" id="key-mode"><option value="plain" ${keyMode === 'plain' ? 'selected' : ''}>Plaintext storage</option><option value="password" ${keyMode === 'password' ? 'selected' : ''}>Password protected</option></select><input class="text-input" id="key-password" type="password" autocomplete="new-password" placeholder="Enter a password of at least 10 characters"><input class="text-input" id="key-password-confirm" type="password" autocomplete="new-password" placeholder="Confirm the password"><button class="secondary full" data-action="save-key-mode">Save key protection</button></section><section class="settings-section"><h3>${esc(t('relaySettings'))}</h3><p class="hint">${esc(t('relayHelp'))}</p><textarea class="text-area" id="relbe" rows="4">${esc(rel.join('
'))}</textarea><button class="secondary full" data-action="relment">${esc(t('reconnect'))}</button></section><section class="settings-section"><h3>${esc(t('erase'))}</h3><p class="hint">${esc(t('eraseWarn'))}</p><button class="danger full" data-action="reset-all">Reset all data</button></section></article></div>`;
}function torolAblak(masodik = false) {
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('erase'))}</div><h2>${esc(t(masodik ? 'eraseSecond' : 'eraseFirst'))}</h2>${masodik ? `<input class="text-input" id="torolmez" placeholder="${kimenetiBiztosít(üzenet('typeDelete'))}" autocomplete="off"><p class="form-hiba" id="hiba"></p>` : `<p>${esc(t('eraseWarn'))}</p>`}<div class="dialog-actions"><button class="secondary" data-action="torolmegse">${esc(t('cancel'))}</button><button class="danger" data-action="${masodik ? 'torolveg' : 'torol2'}">${esc(masodik ? t('deleteNow') : t('erase'))}</button></div></article></div>`;
}
function unlockAblak() {
  return `<div class="overlay"><article class="dialog"><div class="settings-head"><div><div class="eyebrow">Private key</div><h2>Unlock account</h2></div></div><p class="hint">This account uses password-protected storage. Enter the password used when the key was protected.</p><input class="text-input" id="key-unlock-password" type="password" autocomplete="current-password" placeholder="Account password"><p class="form-hiba" id="hiba"></p><div class="dialog-actions"><button class="secondary" data-action="megse">Cancel</button><button class="primary" data-action="unlock">Unlock</button></div></article></div>`;
}
function render() {
  document.documentElement.lang = nyelv;
  const modal = nézet === 'legal' ? jogNezet() : nézet === 'settings' ? beallitas() : nézet === 'unlock' ? unlockAblak() : nézet === 'torol1' ? torolAblak(false) : nézet === 'torol2' ? torolAblak(true) : hívás ? hivasAblak() : találat ? talalatAblak() : '';
  gyoker.innerHTML = `${fejlec()}<main class="wrap main">${kezdolap()}</main>${modal}<audio id="hang" autoplay playsinline></audio>`;
  const audio = document.querySelector('#hang');
  if (audio && hangKép) { audio.srcObject = hangKép; audio.muted = Boolean(hívás?.siket); audio.play().catch(() => {}); }
  meret();
}
function devices(tipus) {
  const box = document.querySelector('#eszkozok');
  if (!box) return;
  if (tipus === 'ki' && typeof document.querySelector('#hang')?.setSinkId !== 'function') { box.innerHTML = `<p class="hint">${esc(t('notSupported'))}</p>`; return; }
  navigator.mediaDevices.enumerateDevices().then(dev => {
    const lista = dev.filter(x => tipus === 'be' ? x.kind === 'audioinput' : x.kind === 'audiooutput');
    if (!lista.length) { box.innerHTML = `<p class="hint">${esc(t('noDevice'))}</p>`; return; }
    box.innerHTML = `<select class="select-input" id="eszkval"><option value="">${esc(tipus === 'be' ? t('input') : t('output'))}</option>${lista.map((x, i) => `<option value="${kimenetiBiztosít(x.deviceId)}">${esc(x.label || `${tipus === 'be' ? t('input') : t('output')} ${i + 1}`)}</option>`).join('')}</select>`;
    document.querySelector('#eszkval').addEventListener('change', async e => {
      try {
        if (tipus === 'be') {
          const uj = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: e.target.value }, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
          const sav = uj.getAudioTracks()[0];
          const kuldo = hívás?.pc?.getSenders().find(x => x.track?.kind === 'audio');
          if (kuldo) await kuldo.replaceTrack(sav);
          hívás.stream?.getAudioTracks().forEach(x => x.stop());
          hívás.stream = uj;
          sav.enabled = !hívás.nemit;
        } else await document.querySelector('#hang').setSinkId(e.target.value);
      } catch { hiba(t('notSupported')); }
    });
  }).catch(() => { box.innerHTML = `<p class="hint">${esc(t('notSupported'))}</p>`; });
}

gyoker.addEventListener('submit', async e => {
  e.preventDefault();
  if (e.target.id === 'kezdo') {
    const formData = new FormData(e.target);
    const nev = formData.get('név')?.toString().trim() || '';
    const sajátKód = hívásKódNormalizálása(formData.get('saját-kód') || '');
    if (!nev) { hiba(t('badName')); return; }
    if (sajátKód && !kódÉrvényes(sajátKód)) { hiba(t('invalidCode')); return; }
    if (!window.nostrEszkoz) { hiba(t('unavailable')); return; }
    const { generateSecretKey, getPublicKey } = window.nostrEszkoz;
    const titok = generateSecretKey();
    const kod = sajátKód || újKód;
    fiok = { nyilvanos: getPublicKey(titok), nev, kod, nyelv, rel };
    const keyHex = bytesToHex(titok);
    keyMode = 'plain';
    keyRecord = { id: fiok.nyilvanos, mode: 'plain', keyHex };
    await saveKeyRecord(fiok.nyilvanos, keyRecord);
    keyInMemory = titok;
    ment();
    nézet = 'home';
    render();
    kapcsol();
  } else if (e.target.id === 'keres') {
    const kod = document.querySelector('#kod').value.trim().toUpperCase();
    if (kod.length < 4) { hiba(t('invalidCode')); return; }
    try {
      const tal = await kodKeres(kod);
      if (!tal) { hiba(t('unknown')); return; }
      találat = tal;
      render();
    } catch { hiba(t('unavailable')); }
  }
});

gyoker.addEventListener('click', async e => {
  const g = e.target.closest('[data-action]');
  if (!g) return;
  const a = g.dataset.action;
  if (a === 'masol') { try { await navigator.clipboard.writeText(g.dataset.kod === 'new' ? újKód : g.dataset.kod); g.textContent = t('copied'); } catch {} }
  if (a === 'beall') { nézet = 'settings'; render(); }
  if (a === 'jog') { jog = g.dataset.jog; nyitott = nézet; nézet = 'legal'; render(); }
  if (a === 'vissza') { nézet = fiok ? 'settings' : 'home'; render(); }
  if (a === 'megse') { találat = null; if (hívás?.irany === 'kimeno') hivasLezar('vege', true); else { nézet = 'home'; render(); } }
  if (a === 'hiv' && találat) { const c = találat; találat = null; hiv(c.nyilvanos, c.nev); }
  if (a === 'fogad') await fogad();
  if (a === 'elutasit' && hívás) {
    const adat = { id: hívás.id, peer: hívás.peer };
    let elkuld = true;
    try { await esemény(adat.id, adat.peer, 'elutasit', { hívás: adat.id }); } catch { elkuld = false; }
    hivasLezar('vege', false);
    if (!elkuld) hiba(t('relayFail'));
  }
  if (a === 'letesz') hivasLezar('vege', true);
  if (a === 'nemit' && hívás) { hívás.nemit = !hívás.nemit; hívás.stream?.getAudioTracks().forEach(x => { x.enabled = !hívás.nemit; }); render(); }
  if (a === 'siket' && hívás) { hívás.siket = !hívás.siket; render(); }
  if (a === 'eszkoz') devices(g.dataset.tipus);
  if (a === 'save-key-mode') {
    const mode = document.querySelector('#key-mode').value;
    const password = document.querySelector('#key-password').value;
    const confirmation = document.querySelector('#key-password-confirm').value;
    try {
      await setKeyMode(mode, password, confirmation);
      g.textContent = t('saved');
      render();
    } catch (error) { hiba(error.message); }
  }
  if (a === 'add-contact') {
    const name = normalizeName(document.querySelector('#kontakt-név').value);
    const code = hívásKódNormalizálása(document.querySelector('#kontakt-kód').value);
    const pubkey = document.querySelector('#contact-pubkey').value.trim().toLowerCase();
    if (!name || !kódÉrvényes(code)) { hiba('Enter a valid name and calling code.'); return; }
    if (pubkey && !isValidPubkey(pubkey)) { hiba('Enter a valid 64-character public key.'); return; }
    if (contactNameConflict(kontaktok, name) || contactCodeExists(kontaktok, code) || (pubkey && contactExists(kontaktok, pubkey))) { hiba('A contact with this name, calling code, or public key already exists.'); return; }
    try {
      kontaktok.push(makeContactRecord({ name, kód: code, nyilvanos: pubkey || null }));
      await saveContacts(kontaktok);
      render();
    } catch (error) { hiba(error.message); }
  }
  if (a === 'call-contact') {
    const contact = kontaktok.find(item => item.kód === g.dataset.contactKód);
    if (contact) {
      if (contact.nyilvanos) {
        találat = { nev: contact.név, nyilvanos: contact.nyilvanos, kod: contact.kód, verified: true };
        render();
      } else {
        const found = await kodKeres(contact.kód);
        if (found) { találat = found; render(); }
        else { hiba(t('unknown')); }
      }
    }
  }
  if (a === 'remove-contact') {
    const id = g.dataset.contactId;
    kontaktok = kontaktok.filter(contact => contact.id !== id);
    await saveContacts(kontaktok);
    render();
  }
  if (a === 'unlock') {
    try {
      await loadKey('password', document.querySelector('#key-unlock-password').value);
      nézet = 'settings';
      render();
    } catch (error) { hiba(error.message); }
  }
  if (a === 'nevment') {
    const nev = document.querySelector('#nevbe').value.trim();
    if (!nev) { hiba(t('badName')); return; }
    fiok.nev = nev; fiok.nyelv = nyelv; ment(); profilEsemeny(); g.textContent = t('saved');
  }
  if (a === 'relment') {
    rel = [...new Set(document.querySelector('#relbe').value.split(/\r?\n/).map(x => x.trim()).filter(x => /^wss:\/\//i.test(x)))];
    if (!rel.length) rel = [...alapRel];
    fiok.rel = rel; ment(); kapcsol(); g.textContent = t('saved');
  }
  if (a === 'reset-all') {
    if (!window.confirm(t('eraseWarn'))) return;
    const accountPubkey = fiok?.nyilvanos;
    if (accountPubkey) await deleteKeyRecord(accountPubkey);
    if (pool && aktivRelékek.length) pool.close(aktivRelékek);
    clearKeyMemory();
    await saveContacts([]);
    localStorage.clear();
    fiok = null;
    hívás = null;
    találat = null;
    nézet = 'home';
    window.location.reload();
  }
  if (a === 'torol1') { nézet = 'torol1'; render(); }
  if (a === 'torol2') { nézet = 'torol2'; render(); }
  if (a === 'torolmegse') { nézet = 'settings'; render(); }
  if (a === 'torolveg') {
    if (document.querySelector('#torolmez')?.value !== 'DELETE') { hiba(t('eraseSecond')); return; }
    await deleteKey();
    if (hívás) hivasLezar('vege', false);
    fiok = null; rel = [...alapRel]; nézet = 'home'; kapcsol(); render();
  }
});

gyoker.addEventListener('change', e => {
  if (e.target.id === 'nyelv') { nyelv = e.target.value; if (fiok) { fiok.nyelv = nyelv; ment(); } render(); }
  if (e.target.id === 'key-mode') render();
});

async function indul() {
  try {
    const n = await import('https://esm.sh/nostr-tools@2.10.4?bundle');
    window.nostrEszkoz = n;
    pool = new n.SimplePool();
  } catch { könyvtárHiba = true; }
  try {
    fiok = JSON.parse(localStorage.getItem(tarolo) || 'null');
    if (fiok) {
      nyelv = fiok.nyelv === 'hu' ? 'hu' : 'en';
      kontaktok = await loadContacts();
      const regiRel = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'];
      if (JSON.stringify(fiok.rel) === JSON.stringify(regiRel)) { rel = [...alapRel]; fiok.rel = rel; ment(); }
      else rel = Array.isArray(fiok.rel) && fiok.rel.length ? fiok.rel : [...alapRel];
      const stored = await loadKeyRecord(fiok.nyilvanos);
      if (stored?.mode === 'password') {
        keyMode = 'password';
        keyRecord = stored;
        nézet = 'unlock';
      } else if (stored?.mode === 'plain') {
        keyMode = 'plain';
        keyRecord = stored;
        await loadKey('plain');
      } else {
        const legacy = JSON.parse(localStorage.getItem(tarolo) || '{}');
        if (legacy.titok) {
          await migrateLegacyKey();
          keyMode = 'plain';
          keyRecord = await loadKeyRecord(fiok.nyilvanos);
          await loadKey('plain');
        } else {
          keyMode = 'plain';
          nézet = 'unlock';
        }
      }
    }
  } catch { fiok = null; }
  if (pool) kapcsol();
  render();
  setInterval(meret, 3000);
  if (fiok && pool) setInterval(profilEsemeny, 12 * 60 * 60 * 1000);
}

indul();
