const adatBázisNév = 'nostrcall-security-v1';
const adatBázisVerzió = 1;
const kulcsTároló = 'keys';
const kontaktTároló = 'contacts';
const metaTároló = 'meta';
const MAX_EVENT_AGE = 60 * 60;
const MAX_EVENT_FUTURE = 60;
const nyilvanosMinta = /^[a-f0-9]{64}$/;
const kulcsMinta = /^[a-f0-9]{64}$/;

let adatBázisPromise;

function adatBázisMegnyitása() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('indexedDB unavailable'));
  if (!adatBázisPromise) {
    adatBázisPromise = new Promise((resolve, reject) => {
      const kérés = indexedDB.open(adatBázisNév, adatBázisVerzió);
      kérés.onupgradeneeded = event => {
        const db = event.target.result;
        for (const név of [kulcsTároló, kontaktTároló, metaTároló]) {
          if (!db.objectStoreNames.contains(név)) db.createObjectStore(név);
        }
      };
      kérés.onsuccess = event => resolve(event.target.result);
      kérés.onerror = () => reject(kérés.hiba || new Error('IndexedDB open failed'));
    });
  }
  return adatBázisPromise;
}

function kérésBetöltése(kérés) {
  return new Promise((resolve, reject) => {
    kérés.onsuccess = () => resolve(kérés.result);
    kérés.onerror = () => reject(kérés.hiba || new Error('IndexedDB request failed'));
  });
}

export async function adatTárolása(tároló, érték, key = null) {
  const db = await adatBázisMegnyitása();
  const transaction = db.transaction(tároló, 'readwrite');
  const request = key === null ? transaction.objectStore(tároló).put(érték) : transaction.objectStore(tároló).put(érték, key);
  return kérésBetöltése(request);
}

export async function adatLeránása(tároló, key) {
  const db = await adatBázisMegnyitása();
  return kérésBetöltése(db.transaction(tároló, 'readonly').objectStore(tároló).get(key));
}

export async function adatTörlése(tároló, key) {
  const db = await adatBázisMegnyitása();
  return kérésBetöltése(db.transaction(tároló, 'readwrite').objectStore(tároló).delete(key));
}

export async function adatLista(tároló) {
  const db = await adatBázisMegnyitása();
  return kérésBetöltése(db.transaction(tároló, 'readonly').objectStore(tároló).getAll());
}

export async function kulcsFelvételMentése(nyilvanos, felvétel) {
  await adatTárolása(kulcsTároló, { nyilvanos, ...felvétel, frissítve: Math.floor(Date.now() / 1000) }, nyilvanos);
}

export async function kulcsFelvételBetöltése(nyilvanos) {
  return adatLeránása(kulcsTároló, nyilvanos);
}

export async function kulcsFelvételTörlése(nyilvanos) {
  await adatTörlése(kulcsTároló, nyilvanos);
}

export async function kontaktokMentése(records) {
  await adatTárolása(kontaktTároló, { id: 'contacts', records, frissítve: Math.floor(Date.now() / 1000) }, 'contacts');
}

export async function kontaktokBetöltése() {
  const tárolt = await adatLeránása(kontaktTároló, 'contacts');
  if (!Array.isArray(tárolt?.records)) return [];
  return tárolt.records.map(kontakt => {
    if (kontakt.kód) return kontakt;
    const nyilvanos = kontakt.nyilvanos?.trim().toLowerCase();
    if (!nyilvanosÉrvényes(nyilvanos)) return kontakt;
    return { ...kontakt, kód: nyilvanos.slice(0, 8).toUpperCase(), nyilvanos };
  });
}

export function névNormalizálása(érték) {
  return String(érték || '').normalize('NFC').replace(/\s+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function hívásKódNormalizálása(érték) {
  return String(érték || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function nyilvanosÉrvényes(érték) {
  return typeof érték === 'string' && nyilvanosMinta.test(érték);
}

export function isValidPubkey(érték) {
  return nyilvanosÉrvényes(érték);
}

export function normalizeName(érték) {
  return névNormalizálása(érték);
}

export function kulcsÉrvényes(érték) {
  return typeof érték === 'string' && kulcsMinta.test(érték);
}

export function hívásKódÉrvényes(érték) {
  return typeof érték === 'string' && érték.length >= 4 && érték.length <= 24 && /^[A-Z0-9]+$/.test(érték);
}

export function eseményÉrvényesítése(esemény, expectedPubkey = null) {
  if (!esemény || typeof esemény !== 'object') return false;
  if (!nyilvanosÉrvényes(esemény.nyilvanos) || !nyilvanosÉrvényes(esemény.id) || typeof esemény.content !== 'string') return false;
  if (!Number.isFinite(esemény.created_at) || !Array.isArray(esemény.tags)) return false;
  if (expectedPubkey && esemény.nyilvanos !== expectedPubkey) return false;
  const most = Math.floor(Date.now() / 1000);
  if (esemény.created_at < most - MAX_EVENT_AGE || esemény.created_at > most + MAX_EVENT_FUTURE) return false;
  return true;
}

export function eseményHívásKontextusa(esemény, hívásAzonosító, senderPubkey, recipientPubkey) {
  if (!eseményÉrvényesítése(esemény)) return false;
  if (!hívásAzonosítóÉrvényes(hívásAzonosító) || esemény.nyilvanos !== senderPubkey) return false;
  const hívásCímkék = esemény.tags.filter(([tag]) => tag === 'call');
  if (hívásCímkék.length && !hívásCímkék.some(([, érték]) => érték === hívásAzonosító)) return false;
  const címkék = esemény.tags.filter(([tag]) => tag === 'p');
  if (!címkék.some(([, érték]) => érték === recipientPubkey)) return false;
  return true;
}

export function hívásAzonosítóÉrvényes(érték) {
  return typeof érték === 'string' && /^[a-f0-9-]{16,128}$/.test(érték);
}

export function címkeLeránása(esemény, név) {
  return esemény?.tags?.find(([tag]) => tag === név)?.[1];
}

export function hívásKontextusLeránása(esemény) {
  const hívásAzonosító = címkeLeránása(esemény, 'call');
  const üzenetAzonosító = címkeLeránása(esemény, 'message');
  const type = címkeLeránása(esemény, 'type');
  const sender = esemény?.nyilvanos;
  const címzett = címkeLeránása(esemény, 'p');
  return { hívásAzonosító, üzenetAzonosító, type, sender, címzett };
}

export function validateCallEvent(esemény, helyiNyilvanos, vártHívásAzonosító = null) {
  if (!eseményÉrvényesítése(esemény, esemény.nyilvanos)) return { valid: false, ok: 'invalid-event' };
  const kontextus = hívásKontextusLeránása(esemény);
  if (!kontextus.hívásAzonosító || !hívásAzonosítóÉrvényes(kontextus.hívásAzonosító)) return { valid: false, ok: 'invalid-call-id' };
  if (vártHívásAzonosító && kontextus.hívásAzonosító !== vártHívásAzonosító) return { valid: false, ok: 'wrong-call-id' };
  if (!kontextus.sender || !nyilvanosÉrvényes(kontextus.sender)) return { valid: false, ok: 'invalid-sender' };
  if (!kontextus.címzett || kontextus.címzett !== helyiNyilvanos) return { valid: false, ok: 'wrong-recipient' };
  return { valid: true, context: kontextus };
}

export function verifyCallEvent(esemény, helyiNyilvanos, vártHívásAzonosító = null) {
  return validateCallEvent(esemény, helyiNyilvanos, vártHívásAzonosító);
}

export function makeCallId() {
  return crypto.randomUUID();
}

export function hívásAzonosítóLétrehozása() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  const bájt = crypto.getRandomValues(new Uint8Array(16));
  return [...bájt].map((érték) => érték.toString(16).padStart(2, '0')).join('');
}

export function kódLétrehozása(length = 8) {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const eredmény = [];
  while (eredmény.length < length) {
    const bájt = crypto.getRandomValues(new Uint8Array(1))[0];
    if (bájt < Math.floor(256 / alphabet.length) * alphabet.length) {
      eredmény.push(alphabet[bájt % alphabet.length]);
    }
  }
  return eredmény.join('');
}

export function kódÉrvényes(érték) {
  return hívásKódÉrvényes(hívásKódNormalizálása(érték)) && hívásKódNormalizálása(érték).length >= 4;
}

export function hexToBájt(érték) {
  return Uint8Array.from(érték.match(/.{2}/g) || [], hex => parseInt(hex, 16));
}

export function bájtToHex(bájt) {
  return [...bájt].map(érték => érték.toString(16).padStart(2, '0')).join('');
}

export function kontaktFelvételLétrehozása(kontakt) {
  const név = névNormalizálása(kontakt.név);
  const kód = hívásKódNormalizálása(kontakt.kód);
  const nyilvanos = kontakt.nyilvanos?.trim().toLowerCase();
  if (!név || !kódÉrvényes(kód)) throw new Error('invalid-contact');
  if (nyilvanos && !nyilvanosÉrvényes(nyilvanos)) throw new Error('invalid-contact');
  return { id: kontakt.id || crypto.randomUUID(), név, kód, nyilvanos: nyilvanos || null, jegyzet: String(kontakt.jegyzet || '').trim().slice(0, 500), createdAt: kontakt.createdAt || Math.floor(Date.now() / 1000), frissítve: Math.floor(Date.now() / 1000) };
}

export function contactNameMatches(kontakt, név) {
  return névNormalizálása(kontakt.név).toLocaleLowerCase() === névNormalizálása(név).toLocaleLowerCase();
}

export function contactNameConflict(contacts, név, ignoreId = null) {
  return kontaktNévKonfliktusa(contacts, név, ignoreId);
}

export function contactExists(contacts, nyilvanos, ignoreId = null) {
  return kontaktLétezik(contacts, nyilvanos, ignoreId);
}

export function contactCodeExists(contacts, kód, ignoreId = null) {
  return kontaktKódLétezik(contacts, kód, ignoreId);
}

export function makeContactRecord(contact) {
  return kontaktFelvételLétrehozása(contact);
}

export function kontaktLétezik(contacts, nyilvanos, ignoreId = null) {
  return contacts.some(kontakt => kontakt.nyilvanos === nyilvanos && kontakt.id !== ignoreId);
}

export function kontaktKódLétezik(contacts, kód, ignoreId = null) {
  return contacts.some(kontakt => kontakt.kód === kód && kontakt.id !== ignoreId);
}

export function kontaktNévKonfliktusa(contacts, név, ignoreId = null) {
  const normalized = névNormalizálása(név).toLocaleLowerCase();
  return contacts.some(kontakt => kontakt.id !== ignoreId && névNormalizálása(kontakt.név).toLocaleLowerCase() === normalized);
}

export function hasFreshProfile(esemény) {
  return frissProfilLétezik(esemény);
}

export function frissProfilLétezik(esemény) {
  if (!esemény || !esemény.tags || !Array.isArray(esemény.tags)) return false;
  const lejárás = esemény.tags.find(([tag]) => tag === 'expiration')?.[1];
  if (!lejárás || !/^\d+$/.test(lejárás)) return false;
  return Number(lejárás) > Math.floor(Date.now() / 1000);
}

export async function saveKeyRecord(nyilvanos, record) {
  return kulcsFelvételMentése(nyilvanos, record);
}

export async function loadKeyRecord(nyilvanos) {
  return kulcsFelvételBetöltése(nyilvanos);
}

export async function deleteKeyRecord(nyilvanos) {
  return kulcsFelvételTörlése(nyilvanos);
}

export async function saveContacts(records) {
  return kontaktokMentése(records);
}

export async function loadContacts() {
  return kontaktokBetöltése();
}

export function bytesToHex(bytes) {
  return bájtToHex(bytes);
}

export function hexToBytes(value) {
  return hexToBájt(value);
}
