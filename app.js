import {
  bytesToHex, hexToBytes,
  hasFreshProfile, isValidPubkey, loadContacts, loadKeyRecord, makeCallId, makeContactRecord,
  normalizeName, saveContacts, saveKeyRecord, deleteKeyRecord, verifyCallEvent,
  kódLétrehozása, hívásKódNormalizálása, névNormalizálása, frissProfilLétezik,
  kódÉrvényes, adatLista
} from './security.js';

const alkalmazás = document.querySelector('#app');
const gyoker = alkalmazás;
const tároló = 'nostrcall-fiok-v1';
const lezártHívásTároló = 'nostrcall-lezart-hivasok-v1';
const turnTároló = 'nostrcall-turn-servers-v1';
const alapRelékek = ['wss://relay.primal.net', 'wss://nos.lol', 'wss://relay.damus.io'];
const ikonok = {
  ember: '<svg class="avatar-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor"/><circle cx="12" cy="9" r="3" fill="none" stroke="currentColor"/><path d="M5.5 18.5c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
  mikro: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="9" y="3" width="6" height="12" fill="none" stroke="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
  hang: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 10.5c4.5-4 11.5-4 16 0v5l-4 2-3-4h-2l-3 4-4-2z" fill="none" stroke="currentColor" stroke-linejoin="round"/></svg>',
  feltoltes: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 16V4m-5 5 5-5 5 5M4 20h16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  letoltes: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4v12m-5-5 5 5 5-5M4 20h16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
    micDenied: 'Microphone access was not granted. Check your browser permission.', callFail: 'Could not establish the call. Check microphone access and relay connectivity.', relayFail: 'Could not publish to a relay. Check the relay list and connection.', invalidCode: 'Enter a code with 4–24 letters or numbers.', codeTaken: 'This calling code is already in use and cannot be used until the current profile expires.', codeCheckFailed: 'Could not check whether this calling code is available. Check your relay connection and try again.', badName: 'Enter a display name.', connectedHint: 'Peer-to-peer audio is active.', notSupported: 'Device selection is not supported by this browser.', noDevice: 'No audio device found.'
  },
  hu: {
    app: 'NostrCall', tag: 'HANGHÍVÁS NOSTR-RELÉKEN', homeTitle: 'Indíts privát hívást.', homeLead: 'Írd be annak a kódját, akit el szeretnél érni.', codeLabel: 'HÍVÁSKÓD', codePlaceholder: 'Például: 7K4Q9M', next: 'Tovább', yourCode: 'A TE HÍVÁSKÓD', copy: 'Másolás', copied: 'Kimásolva', settings: 'Beállítások', relays: 'kapcsolódó relé', unavailable: 'A Nostr-könyvtár nem érhető el. Ellenőrizd a kapcsolatot, majd töltsd újra az oldalt.',
    welcome: 'A hangod, a kulcsaid.', welcomeLead: 'Hozz létre egy helyi fiókot, hogy mások egy rövid kóddal hívhassanak.', név: 'MEGJELENŐ NÉV', namePlaceholder: 'Milyen néven lássanak?', customCode: 'SAJÁT HÍVÁSKÓD', customCodePlaceholder: 'Hagyjál üresen a generáláshoz', start: 'Indítás', agree: 'A folytatással elfogadod a', terms: 'Felhasználási feltételeket', privacy: 'Adatvédelmi irányelveket', and: 'és az', codeIntro: 'A híváskódod', codeHelp: 'Ezt a kódot azokkal oszd meg, akikben megbízol.',
    lookupTitle: 'Felhívod őt?', call: 'Hívás', cancel: 'Mégse', unknown: 'Ehhez a kódhoz nem található fiók. Lehet, hogy a másik fél offline, vagy nincs kint a reléken.',
    calling: 'Hívás', ringing: 'Kicseng', connecting: 'Kapcsolódás', connected: 'Kapcsolódva', busy: 'Foglalt', noanswer: 'Nincs válasz', rejected: 'A hívást elutasították', ended: 'Hívás vége', incoming: 'Bejövő hívás', from: 'hív téged', accept: 'Elfogadás', decline: 'Elutasítás', hangup: 'Hívás befejezése', mute: 'Mikrofon némítása', unmute: 'Mikrofon bekapcsolása', deafen: 'Hang elnémítása', undeafen: 'Hang visszakapcsolása', input: 'Mikrofon', output: 'Hangszóró', quality: 'Kapcsolat minősége',
    account: 'Fiók', save: 'Mentés', saved: 'Mentve', display: 'Megjelenő név', language: 'Nyelv', english: 'Angol', hungarian: 'Magyar', relaySettings: 'Nostr-relék', relayHelp: 'Soronként egy biztonságos WebSocket-relé címe.', reconnect: 'Mentés és újracsatlakozás', erase: 'Fiók törlése', eraseWarn: 'Ez végleg törli a helyi kulcsot és beállításokat. A közzétett reléprofil a relékről még megmaradhat.', eraseFirst: 'Törlöd ezt a fiókot?', eraseSecond: 'Ez nem vonható vissza. A megerősítéshez írd be: DELETE.', typeDelete: 'Írd be: DELETE', deleteNow: 'Végleges törlés', back: 'Vissza', close: 'Bezárás', legal: 'Jogi információk',
    termsTitle: 'Felhasználási feltételek', privacyTitle: 'Adatvédelmi irányelvek', lastUpdated: 'Utolsó frissítés: 2026. október 6.', termsP1: 'A NostrCall egy kísérleti, közvetlen hanghívásra szolgáló bemutató. Használatával vállalod, hogy jogszerűen és másokat tiszteletben tartva használod. Te felelsz a megosztott megjelenő nevedért és híváskódodért.', termsP2: 'A hívás kapcsolódása, a készüléked és hálózati szolgáltatód előtti adatvédelem, illetve a szolgáltatás folyamatos elérhetősége nem garantált. Ne használd segélyhívásra, vagy olyan információhoz, amelynek elvesztése vagy nyilvánosságra kerülése kárt okozhat.', termsP3: 'Te felelsz a készüléked és böngészőprofilod védelméért. A böngészőtárhelyhez hozzáférő személy használhatja a fiókodat. A fiók törlése eltávolítja a kulcsot erről a böngészőről, de a relékre már továbbított eseményeket nem vonja vissza.', termsP4: 'A szoftver a jogszabályok által megengedett mértékig jelen állapotában, garancia és rendelkezésreállási vállalás nélkül használható. A feltételek a közzétett alkalmazással frissülhetnek. A kötelező fogyasztói jogokat ez nem érinti.', privacyP1: 'A NostrCallnak nincs alkalmazásszervere, és nem gyűjt analitikai adatokat. A privát kulcs, a megjelenő név, a beállítások és a nyelv a böngésző helyi tárhelyén vagy IndexedDB-ben maradnak. A privát kulcsot az alkalmazás helyben használja Nostr-események aláírására és titkosítására; szándékosan nem küldi relére.', privacyP2: 'A rövid kód, a nyilvános kulcs és a megjelenő név nyilvános Nostr-eseményként kerül ki, hogy mások megtalálhassanak. A relé üzemeltetője a saját szabályai szerint tárolhatja, másolhatja, indexelheti vagy közzéteheti az eseményt. A kód ismeretében bárki megkeresheti a nyilvános profilt és hívást kezdeményezhet.', privacyP3: 'A hívásjelzés NIP-44 v2 szerint titkosítva halad a Nostr-kulcsok között. A relék ettől még láthatják az események időpontját, méretét és útválasztási adatait. A hang WebRTC-vel közvetlenül a böngészők között utazik, nem a Nostr-reléken. A hálózatod láthatja a partnerkapcsolatot. Ez a bemutató nem használ TURN-relét.', privacyP4: 'A böngésző csak hívás indításakor vagy fogadásakor kér mikrofonengedélyt. Az eszközneveket és választásokat a böngésző kezeli. A hívás és a bejövő hívásjelzés csak nyitott, kapcsolódó oldal mellett működik.', privacyP5: 'A nevedet, reléidet és a nyelvet a Beállításokban módosíthatod, a helyi fiókot pedig ott törölheted. A webhelyadatok törlése szintén eltávolítja a helyben tárolt kulcsot. A nyilvános reléesemények mindkét esetben megmaradhatnak. Kérdés esetén keresd a statikus oldal üzemeltetőjét.',
    micDenied: 'Nem kaptunk hozzáférést a mikrofonhoz. Ellenőrizd a böngésző engedélyeit.', callFail: 'Nem sikerült létrehozni a hívást. Ellenőrizd a mikrofon engedélyét és a relékapcsolatot.', relayFail: 'Nem sikerült relére közzétenni. Ellenőrizd a relélistát és a kapcsolatot.', invalidCode: 'Legalább 4 karakteres kódot adj meg.', codeTaken: 'Ezt a híváskódot már használja valaki; a jelenlegi profil lejártáig nem használható.', codeCheckFailed: 'Nem sikerült ellenőrizni, hogy szabad-e a híváskód. Ellenőrizd a relékapcsolatot, majd próbáld újra.', badName: 'Adj meg egy nevet.', connectedHint: 'A közvetlen hangkapcsolat aktív.', notSupported: 'A böngésző nem támogatja az eszközválasztást.', noDevice: 'Nem található hangeszköz.'
  }
};

const továbbiÜzenetek = {
  en: {
    contacts: 'Contacts', contactsEmpty: 'Contacts saved after calls will appear here.', removeContact: 'Remove contact', saveContact: 'Save contact?', saveContactPrompt: 'Save this caller as a contact?', save: 'Save', skip: 'Not now', callContact: 'Call contact', identityMismatch: 'The name or calling code matches a saved contact, but the public key is different. Call blocked.', contactSaved: 'Contact saved.',
    fileSend: 'Send file', fileReceive: 'Download file', fileChoose: 'Choose a file', fileConfirm: 'Send this file?', fileDownloadConfirm: 'Download this file?', filePending: 'Wait until the other person downloads the pending file.', fileTooLarge: 'Files must be 25 MB or smaller.', fileChannelUnavailable: 'File sharing is not ready for this call.', fileSent: 'File sent.', fileReceived: 'File received.',
    useTurn: 'Use TURN for this call', turnInfo: 'About TURN', turnInfoText: 'TURN can help when a direct connection cannot be established. The TURN operator relays encrypted WebRTC traffic and can observe your network address and connection metadata. The other party may see the TURN server address instead of your public IP, but the service operator can still see connection metadata. Configure up to three TURN servers in Settings; the service provider may charge fees and process your data under its own terms.', turnServers: 'TURN servers', turnUrl: 'TURN server URL', turnUsername: 'Username', turnCredential: 'Credential', turnServerHelp: 'Enter details from your TURN provider. Credentials are stored in this browser and included in identity exports.', turnMissing: 'Configure at least one TURN server before enabling TURN.', incomingTurn: 'This call uses TURN.',
    exportIdentity: 'Export identity', importIdentity: 'Import identity backup', backupWarning: 'The export contains your private key and all account data. Malware can read browser storage or the export file, then impersonate you. Never upload the file. Transfer it offline on a USB drive and verify callers with the other person using a separately agreed method.', exportDone: 'Identity backup exported.', importInvalid: 'This identity backup is invalid.',
    connectionGuideTitle: 'Connection troubleshooting', connectionGuideLead: 'The browsers could not establish a direct media route.', connectionGuideSteps: ['Keep both browsers open and make sure both participants accepted the call.', 'Confirm both devices are online, connected to a Nostr relay, and have microphone permission.', 'Try another network or turn off a VPN/firewall rule that blocks outbound UDP. Port forwarding is usually not needed.', 'Some symmetric NATs and restricted networks cannot connect directly with STUN. This app cannot bypass that without TURN.', 'Configure a trusted TURN provider in Settings, then enable TURN in the call confirmation. The receiving device must also have valid TURN credentials.'], openTurnSettings: 'Open TURN settings',
  },
  hu: {
    contacts: 'Kontaktok', contactsEmpty: 'A hívás után elmentett kontaktok itt jelennek meg.', removeContact: 'Kontakt törlése', saveContact: 'Kontakt mentése?', saveContactPrompt: 'Elmented ezt a hívót kontaktként?', save: 'Mentés', skip: 'Most nem', callContact: 'Kontakt hívása', identityMismatch: 'A név vagy híváskód egyezik egy mentett kontakttal, de a nyilvános kulcs eltér. A hívást letiltottuk.', contactSaved: 'Kontakt elmentve.',
    fileSend: 'Fájl küldése', fileReceive: 'Fájl letöltése', fileChoose: 'Fájl kiválasztása', fileConfirm: 'Biztosan elküldöd ezt a fájlt?', fileDownloadConfirm: 'Letöltöd ezt a fájlt?', filePending: 'Várd meg, amíg a másik fél letölti a függőben lévő fájlt.', fileTooLarge: 'Legfeljebb 25 MB-os fájl küldhető.', fileChannelUnavailable: 'A fájlmegosztás még nem érhető el ebben a hívásban.', fileSent: 'Fájl elküldve.', fileReceived: 'Fájl érkezett.',
    useTurn: 'TURN használata ehhez a híváshoz', turnInfo: 'A TURN-ről', turnInfoText: 'A TURN segíthet, ha nem hozható létre közvetlen kapcsolat. A TURN üzemeltetője továbbítja a titkosított WebRTC-forgalmat, és láthatja a hálózati címedet, valamint a kapcsolat metaadatait. A másik fél a nyilvános IP-címed helyett a TURN-szerver címét láthatja, de a szolgáltató továbbra is hozzáférhet a kapcsolati metaadatokhoz. A Beállításokban legfeljebb három TURN-szerver adható meg; a szolgáltató díjat számíthat fel, és saját adatkezelési feltételei érvényesek.', turnServers: 'TURN-szerverek', turnUrl: 'TURN-szerver címe', turnUsername: 'Felhasználónév', turnCredential: 'Hitelesítő adat', turnServerHelp: 'A TURN-szolgáltatótól kapott adatokat add meg. Ezek a böngészőben tárolódnak és bekerülnek a fiókexportba.', turnMissing: 'A TURN bekapcsolása előtt állíts be legalább egy TURN-szervert.', incomingTurn: 'Ez a hívás TURN-t használ.',
    exportIdentity: 'Fiók exportálása', importIdentity: 'Fiókmentés importálása', backupWarning: 'Az export tartalmazza a privát kulcsot és a fiók összes adatát. Egy kártevő hozzáférhet a böngészőtárhelyhez vagy az exportfájlhoz, majd a nevedben hívást kezdeményezhet. Soha ne töltsd fel a fájlt. Pendrive-on, offline vidd át, és a visszaélések kiszűréséhez külön egyeztess a másik féllel.', exportDone: 'Fiókmentés exportálva.', importInvalid: 'Érvénytelen fiókmentés.',
    connectionGuideTitle: 'Kapcsolódási hiba útmutató', connectionGuideLead: 'A böngészők nem találtak közvetlen médiaútvonalat.', connectionGuideSteps: ['Mindkét böngésző maradjon nyitva, és mindkét fél fogadja el a hívást.', 'Ellenőrizzétek az internet- és Nostr-relé kapcsolatot, valamint a mikrofon engedélyét.', 'Próbáljatok másik hálózatot, vagy kapcsoljátok ki a kimenő UDP-forgalmat tiltó VPN-/tűzfalszabályt. Porttovábbítás általában nem kell.', 'Bizonyos szimmetrikus NAT-ok és korlátozott hálózatok STUN-nal nem kapcsolhatók össze közvetlenül. TURN nélkül ezt az app nem tudja megkerülni.', 'Állítsatok be egy megbízható TURN-szolgáltatót a Beállításokban, majd kapcsoljátok be a TURN-t a hívás megerősítésénél. A fogadó eszközön is érvényes TURN-adatok kellenek.'], openTurnSettings: 'TURN-beállítások megnyitása'
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
let keyRecord = null;
let dependencyCheck = false;
let feldolgozottEsemények = new Set();
let lezártHívások = new Set();
let várakozóJelzés = new Map();
let mentendoKontakt = null;
let turnSzerverek = [];
let turnInfoNyitva = false;
let turnKérés = false;
let connectionHelpNyitva = false;
let kapottFajlok = new Set();

function üzenet(k) { return továbbiÜzenetek[nyelv]?.[k] || továbbiÜzenetek.en[k] || üzenetek[nyelv]?.[k] || üzenetek.en[k] || k; }
function t(k) { return üzenet(k); }
function esc(v = '') { return kimenetiBiztosít(v); }
function kimenetiBiztosít(v = '') { return String(v).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]); }
function veletlen() { return makeCallId(); }
function accountData() { return { nyilvanos: fiok?.nyilvanos, nev: fiok?.nev, kod: fiok?.kod, nyelv: fiok?.nyelv, rel: fiok?.rel }; }
function kontaktEltérés(nyilvanos, nev, kod) {
  const névKulcs = normalizeName(nev).toLocaleLowerCase();
  const kódKulcs = hívásKódNormalizálása(kod);
  return kontaktok.find(kontakt => kontakt.nyilvanos && kontakt.nyilvanos !== nyilvanos && ((névKulcs && normalizeName(kontakt.név).toLocaleLowerCase() === névKulcs) || (kódKulcs && hívásKódNormalizálása(kontakt.kód) === kódKulcs)));
}
function turnBeallitas() {
  const fields = Array.from({ length: 3 }, (_, index) => {
    const server = turnSzerverek[index] || {};
    return `<div class="turn-server"><label class="field-label" for="turn-url-${index}">${esc(t('turnUrl'))} ${index + 1}</label><input class="text-input" id="turn-url-${index}" value="${kimenetiBiztosít(server.urls || '')}" placeholder="turns:turn.example.com:5349"><label class="field-label" for="turn-user-${index}">${esc(t('turnUsername'))}</label><input class="text-input" id="turn-user-${index}" value="${kimenetiBiztosít(server.username || '')}" autocomplete="off"><label class="field-label" for="turn-credential-${index}">${esc(t('turnCredential'))}</label><input class="text-input" id="turn-credential-${index}" type="password" value="${kimenetiBiztosít(server.credential || '')}" autocomplete="new-password"></div>`;
  }).join('');
  return `<section class="settings-section"><h3>${esc(t('turnServers'))}</h3><p class="hint">${esc(t('turnServerHelp'))}</p>${fields}<button class="secondary full" data-action="save-turn">${esc(t('save'))}</button></section>`;
}
function turnKonfiguralva() {
  return turnSzerverek.some(server => /^turns?:/i.test(server.urls || '') && server.username && server.credential);
}
function turnInfoAblak() {
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('turnInfo'))}</div><p>${esc(t('turnInfoText'))}</p><div class="dialog-actions"><button class="secondary" data-action="turn-info-close">${esc(t('close'))}</button></div></article></div>`;
}
function connectionHelpAblak() {
  const steps = t('connectionGuideSteps');
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('connectionGuideTitle'))}</div><h2>${esc(t('connectionGuideLead'))}</h2><ol>${steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol><div class="dialog-actions"><button class="secondary" data-action="connection-help-close">${esc(t('close'))}</button><button class="primary" data-action="open-turn-settings">${esc(t('openTurnSettings'))}</button></div></article></div>`;
}
function exportIdentity() {
  if (!fiok || !keyInMemory) return;
  const backup = {
    format: 'nostrcall-identity',
    version: 1,
    exportedAt: new Date().toISOString(),
    account: accountData(),
    privateKeyHex: bytesToHex(keyInMemory),
    contacts: kontaktok,
    turnServers: turnSzerverek,
    closedCallIds: [...lezártHívások]
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `nostrcall-identity-${fiok.kod}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function importIdentity(file) {
  try {
    const backup = JSON.parse(await file.text());
    if (backup.format !== 'nostrcall-identity' || backup.version !== 1 || !backup.account || !/^[a-f0-9]{64}$/.test(backup.privateKeyHex || '') || !Array.isArray(backup.contacts) || !Array.isArray(backup.turnServers)) throw new Error('invalid-backup');
    const secretKey = hexToBytes(backup.privateKeyHex);
    const pubkey = window.nostrEszkoz.getPublicKey(secretKey);
    const code = hívásKódNormalizálása(backup.account.kod);
    const name = normalizeName(backup.account.nev);
    if (pubkey !== backup.account.nyilvanos || !name || !kódÉrvényes(code)) throw new Error('invalid-backup');
    const importedContacts = backup.contacts.map(contact => makeContactRecord(contact));
    const importedTurn = backup.turnServers.slice(0, 3).filter(server => /^turns?:/i.test(server?.urls || '') && server.username && server.credential);
    const account = {
      nyilvanos: pubkey,
      nev: name,
      kod: code,
      nyelv: backup.account.nyelv === 'hu' ? 'hu' : 'en',
      rel: Array.isArray(backup.account.rel) && backup.account.rel.length ? backup.account.rel.filter(url => /^wss:\/\//i.test(url)) : [...alapRel]
    };
    await saveKeyRecord(pubkey, { id: pubkey, mode: 'plain', keyHex: backup.privateKeyHex, account });
    await saveContacts(importedContacts);
    fiok = account;
    keyInMemory = secretKey;
    kontaktok = importedContacts;
    turnSzerverek = importedTurn;
    rel = account.rel.length ? account.rel : [...alapRel];
    nyelv = account.nyelv;
    localStorage.setItem(turnTároló, JSON.stringify(turnSzerverek));
    if (Array.isArray(backup.closedCallIds)) {
      lezártHívások = new Set(backup.closedCallIds.filter(id => typeof id === 'string').slice(-100));
      localStorage.setItem(lezártHívásTároló, JSON.stringify([...lezártHívások]));
    }
    await ment();
    nézet = 'home';
    render();
    kapcsol();
  } catch (error) {
    console.warn('[NostrCall] Identity import failed:', error);
    hiba(t('importInvalid'));
  }
}
async function ment() {
  if (!fiok) return;
  const account = accountData();
  keyRecord = { id: fiok.nyilvanos, mode: 'plain', keyHex: bytesToHex(keyInMemory), account, updatedAt: Math.floor(Date.now() / 1000) };
  await saveKeyRecord(fiok.nyilvanos, keyRecord);
  localStorage.setItem(tarolo, JSON.stringify({ ...account, keyRecord: keyRecord.id }));
}
async function loadKey(stored = null) {
  const record = stored || await loadKeyRecord(fiok.nyilvanos);
  const keyHex = record?.keyHex;
  if (!keyHex) throw new Error('missing-key');
  keyInMemory = hexToBytes(keyHex);
  keyRecord = { ...record, mode: 'plain', updatedAt: Math.floor(Date.now() / 1000) };
}
async function loadAccountRecord() {
  const local = JSON.parse(localStorage.getItem(tarolo) || '{}');
  const selected = local.keyRecord ? await loadKeyRecord(local.keyRecord) : null;
  if (selected?.keyHex && selected.account?.nyilvanos === local.pubkey) return selected;
  const records = await adatLista('keys');
  return records
    .filter(record => record?.keyHex && record.account?.nyilvanos && record.account.kod)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
}
async function deleteKey() {
  if (!fiok) return;
  await deleteKeyRecord(fiok.nyilvanos);
  keyInMemory = null;
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
  console.info('[NostrCall] Signal published:', tipus);
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
    const expectedCallId = hívás?.id || null;
    const context = verifyCallEvent(es, fiok.nyilvanos, expectedCallId);
  if (!context.valid || feldolgozottEsemények.has(es.id)) return;
  feldolgozottEsemények.add(es.id);
  try {
    const { nip44 } = window.nostrEszkoz;
    const conversationKey = nip44.getConversationKey(keyInMemory, context.context.sender);
    const adat = JSON.parse(nip44.decrypt(es.content, conversationKey));
    if (!adat?.tipus || !adat.hívás || adat.hívás !== context.context.hívásAzonosító || !isValidPubkey(context.context.sender)) return;
    console.info('[NostrCall] Signal received:', adat.tipus);
    await jelKezel(context.context.sender, adat, context.context.hívásAzonosító, es.id);
  } catch (error) { console.warn('[NostrCall] Signal handling failed:', error); }
}
async function jelKezel(peer, adat, callId, eventId) {
  if (['nincsvalasz', 'elutasit', 'foglalt', 'befejez'].includes(adat.tipus)) {
    lezártHívások.add(adat.hívás);
    lezártHívások = new Set([...lezártHívások].slice(-100));
    localStorage.setItem(lezártHívásTároló, JSON.stringify([...lezártHívások]));
    if (hívás?.id === adat.hívás && peer === hívás.peer) {
      hivasLezar(adat.tipus === 'nincsvalasz' ? 'nincsvalasz' : adat.tipus === 'elutasit' ? 'elutasitva' : adat.tipus === 'foglalt' ? 'foglalt' : 'vege', false);
    }
    return;
  }
  if (adat.tipus === 'ajanlat' && lezártHívások.has(adat.hívás)) return;
  if (callId && hívás?.callId && hívás.callId !== callId) return;

  if (adat.tipus === 'jelolt' && (!hívás || adat.hívás !== hívás.id)) {
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
    if (adat.turn && !turnKonfiguralva()) {
      await esemény(adat.hívás, peer, 'elutasit', { hívás: adat.hívás });
      hiba(t('turnMissing'));
      return;
    }
    if (kontaktEltérés(peer, adat.nev, adat.kod)) {
      await esemény(adat.hívás, peer, 'elutasit', { hívás: adat.hívás });
      hiba(t('identityMismatch'));
      return;
    }
    const elozo = várakozóJelzés.get(adat.hívás);
    const jeloltek = elozo?.peer === peer ? elozo.lista.map(x => new RTCIceCandidate(x)) : [];
    várakozóJelzés.delete(adat.hívás);
    hívás = {
      id: adat.hívás,
      peer,
      nev: adat.nev || 'Nostr user',
      kod: adat.kod || '',
      useTurn: Boolean(adat.turn),
      irany: 'bejovo',
      allapot: 'bejovo',
      ajanlat: adat.sdp,
      pc: null,
      stream: null,
      tavoli: null,
      zar: jeloltek,
      nemit: false,
      siket: false,
      callId,
      eventId,
      verified: true
    };
    idoLejar(45000);
    render();
  } else if (!hívás || adat.hívás !== hívás.id || peer !== hívás.peer) {
    return;
  } else if (adat.tipus === 'valasz' && hívás.irany === 'kimeno') {
    hívás.allapot = 'kapcsolodas';
    idoLejar(30000);
    await hívás.pc.setRemoteDescription(adat.sdp);
    await jelSor();
    render();
  } else if (adat.tipus === 'jelolt') {
    const jelolt = new RTCIceCandidate(adat.jelolt);
    if (hívás.pc?.remoteDescription) await hívás.pc.addIceCandidate(jelolt);
    else hívás.zar.push(jelolt);
  }
}
async function jelSor() {
  if (!hívás?.pc || !hívás.zar.length) return;
  for (const jelolt of hívás.zar.splice(0)) await hívás.pc.addIceCandidate(jelolt);
}
function fajlCsatornaBeallitasa(csatorna) {
  if (!hívás) return;
  hívás.fileChannel = csatorna;
  csatorna.binaryType = 'arraybuffer';
  csatorna.bufferedAmountLowThreshold = 256 * 1024;
  csatorna.onopen = () => render();
  csatorna.onclose = () => { if (hívás?.fileChannel === csatorna) { hívás.fileChannel = null; render(); } };
  csatorna.onmessage = event => fajlUzenet(csatorna, event.data);
}
function fajlUzenet(csatorna, adat) {
  if (!hívás || hívás.fileChannel !== csatorna) return;
  if (typeof adat === 'string') {
    let message;
    try { message = JSON.parse(adat); } catch { return; }
    if (message.type === 'file-start') {
      if (typeof message.id !== 'string' || typeof message.name !== 'string' || !Number.isSafeInteger(message.size) || message.size < 0 || message.size > 25 * 1024 * 1024 || hívás.incomingFile || kapottFajlok.has(message.id)) return;
      hívás.incomingFile = { id: message.id, name: message.name.slice(0, 180), mime: typeof message.mime === 'string' ? message.mime.slice(0, 120) : '', size: message.size, chunks: [], received: 0, complete: false };
      render();
    } else if (message.type === 'file-end' && hívás.incomingFile?.id === message.id) {
      hívás.incomingFile.complete = hívás.incomingFile.received === hívás.incomingFile.size;
      render();
    } else if (message.type === 'file-ack' && hívás.outgoingFile?.id === message.id) {
      hívás.outgoingFile = null;
      render();
    }
    return;
  }
  if (!(adat instanceof ArrayBuffer) || !hívás.incomingFile || hívás.incomingFile.complete) return;
  hívás.incomingFile.received += adat.byteLength;
  if (hívás.incomingFile.received > hívás.incomingFile.size) { hívás.incomingFile = null; render(); return; }
  hívás.incomingFile.chunks.push(adat);
}
function bufferedAmountAlacsony(csatorna) {
  if (csatorna.bufferedAmount <= 1024 * 1024) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const ready = () => { cleanup(); resolve(); };
    const closed = () => { cleanup(); reject(new Error('file channel closed')); };
    const cleanup = () => { csatorna.removeEventListener('bufferedamountlow', ready); csatorna.removeEventListener('close', closed); };
    csatorna.addEventListener('bufferedamountlow', ready, { once: true });
    csatorna.addEventListener('close', closed, { once: true });
  });
}
async function fajlKuldese(file) {
  const csatorna = hívás?.fileChannel;
  if (!hívás || csatorna?.readyState !== 'open') { window.alert(t('fileChannelUnavailable')); return; }
  if (hívás.outgoingFile) { window.alert(t('filePending')); return; }
  if (file.size > 25 * 1024 * 1024) { window.alert(t('fileTooLarge')); return; }
  if (!window.confirm(`${t('fileConfirm')}\n${file.name} (${file.size} bytes)`)) return;
  const fileId = veletlen();
  hívás.outgoingFile = { id: fileId, name: file.name };
  render();
  try {
    csatorna.send(JSON.stringify({ type: 'file-start', id: fileId, name: file.name, mime: file.type, size: file.size }));
    for (let start = 0; start < file.size; start += 16 * 1024) {
      await bufferedAmountAlacsony(csatorna);
      csatorna.send(await file.slice(start, start + 16 * 1024).arrayBuffer());
    }
    csatorna.send(JSON.stringify({ type: 'file-end', id: fileId }));
  } catch (error) {
    if (hívás?.outgoingFile?.id === fileId) hívás.outgoingFile = null;
    console.warn('[NostrCall] File transfer failed:', error);
    render();
  }
}
function fajlLetoltese() {
  const file = hívás?.incomingFile;
  const csatorna = hívás?.fileChannel;
  if (!file?.complete || !csatorna || csatorna.readyState !== 'open' || kapottFajlok.has(file.id)) return;
  if (!window.confirm(`${t('fileDownloadConfirm')}\n${file.name}`)) return;
  kapottFajlok.add(file.id);
  const url = URL.createObjectURL(new Blob(file.chunks, { type: file.mime || 'application/octet-stream' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  csatorna.send(JSON.stringify({ type: 'file-ack', id: file.id }));
  hívás.incomingFile = null;
  render();
}
function iceGyujtesVarasa(pc) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pc.removeEventListener('icegatheringstatechange', ellenoriz);
      resolve();
    }, 15000);
    function ellenoriz() {
      if (pc.iceGatheringState !== 'complete') return;
      clearTimeout(timeout);
      pc.removeEventListener('icegatheringstatechange', ellenoriz);
      resolve();
    }
    pc.addEventListener('icegatheringstatechange', ellenoriz);
    ellenoriz();
  });
}
async function pcLetrehoz() {
  const hc = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
  hívás.stream = hc;
  const iceServers = [{ urls: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302',
    'stun:stun3.l.google.com:19302',
    'stun:stun4.l.google.com:19302'
  ] }];
  if (hívás.useTurn) {
    const configuredTurn = turnSzerverek.filter(server => /^turns?:/i.test(server.urls || '') && server.username && server.credential);
    if (!configuredTurn.length) throw new Error('TURN server configuration missing');
    iceServers.push(...configuredTurn.map(server => ({ urls: server.urls, username: server.username, credential: server.credential })));
  }
  hívás.pc = new RTCPeerConnection({ iceServers, iceTransportPolicy: hívás.useTurn ? 'relay' : 'all' });
  hívás.pc.ondatachannel = event => fajlCsatornaBeallitasa(event.channel);
  if (hívás.irany === 'kimeno') fajlCsatornaBeallitasa(hívás.pc.createDataChannel('files', { ordered: true }));
  hc.getTracks().forEach(s => hívás.pc.addTrack(s, hc));
  hívás.pc.onicecandidate = e => {
    if (!e.candidate || !hívás) return;
    esemény(hívás.id, hívás.peer, 'jelolt', { hívás: hívás.id, jelolt: e.candidate.toJSON() }).catch(error => console.warn('[NostrCall] ICE candidate publish failed:', error));
  };
  hívás.pc.oniceconnectionstatechange = () => console.info('[NostrCall] ICE state:', hívás?.pc?.iceConnectionState);
  hívás.pc.onicegatheringstatechange = () => console.info('[NostrCall] ICE gathering:', hívás?.pc?.iceGatheringState);
  hívás.pc.onicecandidateerror = e => console.warn('[NostrCall] ICE candidate error:', e.errorCode, e.errorText, e.url);
  hívás.pc.ontrack = e => {
    hangKép = e.streams[0];
    if (hívás) { clearTimeout(hívás.ido); hívás.ido = null; hívás.connected = true; hívás.tavoli = hangKép; hívás.allapot = 'kapcsolodva'; render(); }
  };
  hívás.pc.onconnectionstatechange = () => {
    if (!hívás?.pc) return;
    const all = hívás.pc.connectionState;
    console.info('[NostrCall] Peer connection state:', all);
    if (all === 'connected') { clearTimeout(hívás.ido); hívás.ido = null; hívás.connected = true; hívás.allapot = 'kapcsolodva'; hívás.minoseg = 'good'; }
    else if (all === 'failed') { connectionHelpNyitva = true; hivasLezar('vege', false); hiba(t('callFail')); return; }
    else if (all === 'closed') return;
    else if (all === 'disconnected' && hívás.allapot === 'kapcsolodva') hívás.minoseg = 'bad';
    render();
  };
  hívás.statisztika = setInterval(async () => {
    if (!hívás?.pc) return;
    try {
      const adatok = await hívás.pc.getStats();
      let rtt = null;
      adatok.forEach(x => {
        if (x.type !== 'candidate-pair' || x.state !== 'succeeded' || !(x.selected || x.nominated)) return;
        rtt = x.currentRoundTripTime;
        const local = adatok.get(x.localCandidateId);
        const remote = adatok.get(x.remoteCandidateId);
        const path = `${local?.candidateType || 'unknown'}-${remote?.candidateType || 'unknown'}`;
        if (hívás.icePath !== path) {
          hívás.icePath = path;
          console.info('[NostrCall] Selected ICE path:', local?.candidateType, 'to', remote?.candidateType);
        }
      });
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
    if (hívás.allapot === 'kapcsolodas') {
      connectionHelpNyitva = true;
      hivasLezar('vege', false);
      hiba(t('callFail'));
      return;
    }
    if (hívás.irany === 'kimeno' && ['hívás', 'cseng', 'kapcsolodas'].includes(hívás.allapot)) esemény(hívás.id, hívás.peer, 'nincsvalasz', { hívás: hívás.id }).catch(() => {});
    hivasLezar('nincsvalasz', false);
  }, ms);
}
async function hiv(ind, nev, kod, useTurn = false, verified = false) {
  if (!pool) { hiba(t('unavailable')); return; }
  hívás = { id: veletlen(), peer: ind, nev, kod, useTurn, verified, irany: 'kimeno', allapot: 'hívás', pc: null, stream: null, tavoli: null, zar: [], nemit: false, siket: false };
  render();
  idoLejar(45000);
  try {
    await pcLetrehoz();
    const ajanlat = await hívás.pc.createOffer();
    await hívás.pc.setLocalDescription(ajanlat);
    await iceGyujtesVarasa(hívás.pc);
    await esemény(hívás.id, ind, 'ajanlat', { hívás: hívás.id, nev: fiok.nev, kod: fiok.kod, turn: useTurn, sdp: hívás.pc.localDescription });
    if (hívás) { hívás.allapot = 'cseng'; render(); }
  } catch (error) {
    console.warn('[NostrCall] Outgoing call setup failed:', error);
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
    await iceGyujtesVarasa(hívás.pc);
    hívás.allapot = 'kapcsolodas';
    await esemény(hívás.id, hívás.peer, 'valasz', { hívás: hívás.id, sdp: hívás.pc.localDescription });
    idoLejar(30000);
    render();
  } catch (error) {
    console.warn('[NostrCall] Incoming call setup failed:', error);
    hivasLezar('vege', true);
    hiba(t('callFail'));
  }
}
function hivasLezar(allapot, kuld) {
  if (!hívás) return;
  const regi = hívás;
  if (regi.connected && regi.kod && regi.nev && !kontaktok.some(kontakt => kontakt.nyilvanos === regi.peer || normalizeName(kontakt.név).toLocaleLowerCase() === normalizeName(regi.nev).toLocaleLowerCase())) {
    mentendoKontakt = { név: regi.nev, kód: regi.kod, nyilvanos: regi.peer };
  }
  lezártHívások.add(regi.id);
  lezártHívások = new Set([...lezártHívások].slice(-100));
  localStorage.setItem(lezártHívásTároló, JSON.stringify([...lezártHívások]));
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
  return `<span class="quality ${oszt}" aria-label="${kimenetiBiztosít(üzenet('quality'))}"><i></i><i></i><i></i></span>`;
}
function kodDoboz(kod, feliratKod) {
  return `<div class="code-box"><span class="code-text">${esc(kod)}</span><button class="copy-btn" data-action="masol" data-kod="${kimenetiBiztosít(kod)}">${esc(t('copy'))}</button></div>`;
}
function fejlec() {
  return `<header class="topbar"><div class="wrap top-inner"><div class="brand"><span class="brand-mark">${jelek.marka}</span>${esc(t('app'))}</div><div class="top-actions"><span class="relay-count"><i class="relay-dot"></i><span id="relayszam">${jelszam()} ${esc(t('relays'))}</span></span>${fiok ? `<button class="icon-btn" data-action="beall" aria-label="${kimenetiBiztosít(üzenet('settings'))}" title="${kimenetiBiztosít(üzenet('settings'))}">${jelek.ember}</button>` : ''}</div></div></header>`;
}
function kezdolap() {
  if (!fiok) return `<section class="home"><div class="eyebrow">${esc(t('tag'))}</div><h1>${esc(t('welcome'))}</h1><p class="lead">${esc(t('welcomeLead'))}</p><form id="kezdo"><label class="field-label" for="név">${esc(t('név'))}</label><input class="text-input" id="név" name="név" maxlength="32" autocomplete="nickname" placeholder="${kimenetiBiztosít(üzenet('namePlaceholder'))}" required><label class="field-label" for="saját-kód">${esc(t('customCode'))}</label><input class="text-input" id="saját-kód" name="saját-kód" maxlength="24" autocomplete="off" placeholder="${kimenetiBiztosít(üzenet('customCodePlaceholder'))}"><p class="form-hiba" id="hiba"></p><div class="profile-code"><div class="profile-code-head"><span>${esc(t('codeIntro'))}</span></div>${kodDoboz(újKód, 'new')}</div><p class="notice">${esc(t('codeHelp'))}</p><div class="divider"></div><button class="primary full" type="submit">${esc(t('start'))}</button><p class="legal-jegyzet">${esc(t('agree'))} <button type="button" data-action="jog" data-jog="terms">${esc(t('terms'))}</button> ${esc(t('and'))} <button type="button" data-action="jog" data-jog="privacy">${esc(t('privacy'))}</button>.</p></form></section>`;
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
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('lookupTitle'))}</div><h2>${esc(találat.nev)}</h2><p>${esc(találat.kod)}</p><label class="turn-toggle"><input id="useTurn" type="checkbox" ${turnKérés ? 'checked' : ''}><span>${esc(t('useTurn'))}</span><button class="icon-btn turn-info-button" type="button" data-action="turn-info-open" aria-label="${kimenetiBiztosít(t('turnInfo'))}" title="${kimenetiBiztosít(t('turnInfo'))}">i</button></label><div class="dialog-actions"><button class="secondary" data-action="megse">${esc(t('cancel'))}</button><button class="primary" data-action="hiv">${esc(t('call'))}</button></div></article></div>`;
}
function kontaktMenteseAblak() {
  if (!mentendoKontakt) return '';
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('contacts'))}</div><h2>${esc(t('saveContact'))}</h2><p>${esc(t('saveContactPrompt'))}</p><div class="identity-card"><strong>${esc(mentendoKontakt.név)}</strong><small>${esc(mentendoKontakt.kód)} · ${esc(mentendoKontakt.nyilvanos)}</small></div><div class="dialog-actions"><button class="secondary" data-action="contact-skip">${esc(t('skip'))}</button><button class="primary" data-action="contact-save">${esc(t('save'))}</button></div></article></div>`;
}
function kontaktLista() {
  const rows = kontaktok.map(contact => `<div class="contact-entry"><span><strong>${esc(contact.név)}</strong><small>${esc(contact.kód)}</small></span><div class="contact-actions"><button class="icon-btn" data-action="call-contact" data-contact-kód="${kimenetiBiztosít(contact.kód)}" aria-label="${kimenetiBiztosít(t('callContact'))}: ${esc(contact.név)}" title="${kimenetiBiztosít(t('callContact'))}">${jelek.marka}</button><button class="icon-btn" data-action="remove-contact" data-contact-id="${kimenetiBiztosít(contact.id)}" aria-label="${kimenetiBiztosít(t('removeContact'))}: ${esc(contact.név)}" title="${kimenetiBiztosít(t('removeContact'))}">×</button></div></div>`).join('');
  return `<aside class="contacts-panel"><h2>${esc(t('contacts'))}</h2>${rows || `<p class="empty">${esc(t('contactsEmpty'))}</p>`}</aside>`;
}
function beallitas() {
  const joNyelv = nyelv;
  const languageOptions = '<option value="en"' + (joNyelv === 'en' ? ' selected' : '') + '>' + esc(t('english')) + '</option><option value="hu"' + (joNyelv === 'hu' ? ' selected' : '') + '>' + esc(t('hungarian')) + '</option>';
  return [
    '<div class="overlay"><article class="dialog"><div class="settings-head"><div><div class="eyebrow">',
    esc(t('account')),
    '</div><h2>',
    esc(t('settings')),
    '</h2></div><button class="icon-btn" data-action="megse" aria-label="',
    kimenetiBiztosít(üzenet('close')),
    '">×</button></div><section class="settings-section"><h3>',
    esc(t('account')),
    '</h3><label class="field-label" for="nevbe">',
    esc(t('display')),
    '</label><input class="text-input" id="nevbe" maxlength="32" value="',
    kimenetiBiztosít(fiok.név),
    '"><div class="settings-row"><span>',
    esc(t('language')),
    '</span><select id="nyelv">',
    languageOptions,
    '</select></div><div class="settings-links"><button class="text-link" data-action="jog" data-jog="terms">',
    esc(t('terms')),
    '</button><button class="text-link" data-action="jog" data-jog="privacy">',
    esc(t('privacy')),
    '</button></div><button class="secondary full" style="margin-top:14px" data-action="nevment">',
    esc(t('save')),
    '</button></section>',
    turnBeallitas(),
    '<section class="settings-section"><h3>',
    esc(t('relaySettings')),
    '</h3><p class="hint">',
    esc(t('relayHelp')),
    '</p><textarea class="text-input" id="relbe" rows="4">',
    esc(rel.join('\n')),
    '</textarea><button class="secondary full" data-action="relment">',
    esc(t('reconnect')),
    '</button></section><section class="settings-section"><h3>Reset</h3><p class="hint">',
    esc(t('eraseWarn')),
    '</p><button class="danger full" data-action="reset-all">',
    esc(t('erase')),
    '</button></section></article></div>'
  ].join('');
}
function torolAblak(masodik = false) {
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('erase'))}</div><h2>${esc(t(masodik ? 'eraseSecond' : 'eraseFirst'))}</h2>${masodik ? `<input class="text-input" id="torolmez" placeholder="${kimenetiBiztosít(üzenet('typeDelete'))}" autocomplete="off"><p class="form-hiba" id="hiba"></p>` : `<p>${esc(t('eraseWarn'))}</p>`}<div class="dialog-actions"><button class="secondary" data-action="torolmegse">${esc(t('cancel'))}</button><button class="danger" data-action="${masodik ? 'torolveg' : 'torol2'}">${esc(masodik ? t('deleteNow') : t('erase'))}</button></div></article></div>`;
}
function render() {
  document.documentElement.lang = nyelv;
  const modal = mentendoKontakt ? kontaktMenteseAblak() : connectionHelpNyitva ? connectionHelpAblak() : turnInfoNyitva ? turnInfoAblak() : nézet === 'legal' ? jogNezet() : nézet === 'settings' ? beallitas() : nézet === 'torol1' ? torolAblak(false) : nézet === 'torol2' ? torolAblak(true) : hívás ? hivasAblak() : találat ? talalatAblak() : '';
  gyoker.innerHTML = `${fejlec()}<main class="wrap main"><div class="app-layout">${kezdolap()}${fiok ? kontaktLista() : ''}</div></main>${modal}<audio id="hang" autoplay playsinline></audio>`;
  const creationForm = document.querySelector('#kezdo');
  if (creationForm) {
    creationForm.noValidate = true;
    const importLabel = document.createElement('label');
    importLabel.className = 'field-label';
    importLabel.htmlFor = 'identity-backup';
    importLabel.textContent = t('importIdentity');
    const importInput = document.createElement('input');
    importInput.className = 'text-input';
    importInput.type = 'file';
    importInput.id = 'identity-backup';
    importInput.name = 'identity-backup';
    importInput.accept = 'application/json,.json';
    const divider = creationForm.querySelector('.divider');
    creationForm.insertBefore(importLabel, divider);
    creationForm.insertBefore(importInput, divider);
  }
  if (nézet === 'settings') {
    const dialog = document.querySelector('.overlay .dialog');
    const accountSection = dialog?.querySelector('.settings-section');
    if (dialog && accountSection) {
      const backupSection = document.createElement('section');
      backupSection.className = 'settings-section';
      backupSection.innerHTML = `<h3>${esc(t('exportIdentity'))}</h3><p class="hint">${esc(t('backupWarning'))}</p><button class="secondary full" data-action="export-identity">${esc(t('exportIdentity'))}</button>`;
      accountSection.after(backupSection);
    }
  }
  if (nézet === 'legal' && jog === 'privacy') {
    const legalBody = document.querySelector('.legal-body');
    if (legalBody) {
      const warning = document.createElement('p');
      warning.textContent = t('backupWarning');
      legalBody.append(warning);
    }
  }
  if (hívás?.useTurn && hívás.irany === 'bejovo') {
    const badge = document.createElement('p');
    badge.className = 'turn-badge';
    badge.textContent = t('incomingTurn');
    document.querySelector('.call-status')?.insertAdjacentElement('afterend', badge);
  }
  const toolbar = document.querySelector('.call-toolbar');
  if (toolbar) {
    const controls = document.createElement('div');
    controls.className = 'file-tools';
    const send = document.createElement('button');
    send.type = 'button';
    send.className = 'icon-btn';
    send.dataset.action = 'file-send';
    send.disabled = Boolean(hívás.outgoingFile) || hívás.fileChannel?.readyState !== 'open';
    send.title = t('fileSend');
    send.setAttribute('aria-label', t('fileSend'));
    send.innerHTML = jelek.feltoltes;
    const receive = document.createElement('button');
    receive.type = 'button';
    receive.className = `icon-btn file-receive${hívás.incomingFile?.complete ? ' pending' : ''}`;
    receive.dataset.action = 'file-download';
    receive.disabled = !hívás.incomingFile?.complete;
    receive.title = hívás.incomingFile?.complete ? `${t('fileReceive')}: ${hívás.incomingFile.name}` : t('fileReceive');
    receive.setAttribute('aria-label', receive.title);
    receive.innerHTML = jelek.letoltes;
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.id = 'filePicker';
    picker.className = 'hidden';
    picker.addEventListener('change', () => {
      const file = picker.files?.[0];
      picker.value = '';
      if (file) void fajlKuldese(file);
    });
    controls.append(send, receive, picker);
    toolbar.prepend(controls);
  }
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
    const backupFile = formData.get('identity-backup');
    if (backupFile?.size) { await importIdentity(backupFile); return; }
    const nev = formData.get('név')?.toString().trim() || '';
    const sajátKód = hívásKódNormalizálása(formData.get('saját-kód') || '');
    if (!nev) { hiba(t('badName')); return; }
    if (sajátKód && !kódÉrvényes(sajátKód)) { hiba(t('invalidCode')); return; }
    if (!window.nostrEszkoz) { hiba(t('unavailable')); return; }
    let kod = sajátKód || újKód;
    try {
      await Promise.allSettled(rel.map(cim => pool.ensureRelay(cim)));
      if (![...(pool?.listConnectionStatus?.().values() || [])].some(Boolean)) {
        hiba(t('codeCheckFailed'));
        return;
      }
      let foglalt = await kodKeres(kod);
      if (sajátKód && foglalt) { hiba(t('codeTaken')); return; }
      let probalkozas = 0;
      while (foglalt && probalkozas < 5) {
        kod = kódLétrehozása(8);
        foglalt = await kodKeres(kod);
        probalkozas++;
      }
      if (foglalt) { hiba(t('codeCheckFailed')); return; }
    } catch {
      hiba(t('codeCheckFailed'));
      return;
    }
    if (!sajátKód) újKód = kod;
    const { generateSecretKey, getPublicKey } = window.nostrEszkoz;
    const titok = generateSecretKey();
    const account = { nyilvanos: getPublicKey(titok), nev, kod, nyelv, rel };
    const keyHex = bytesToHex(titok);
    const keyRecord = { id: account.nyilvanos, mode: 'plain', keyHex };
    try {
      await saveKeyRecord(account.nyilvanos, keyRecord);
    } catch {
      hiba(t('unavailable'));
      return;
    }
    fiok = account;
    keyInMemory = titok;
    await ment();
    nézet = 'home';
    render();
    kapcsol();
  } else if (e.target.id === 'keres') {
    const kodInput = e.target.elements.namedItem('kód');
    if (!kodInput) { hiba(t('invalidCode')); return; }
    const kod = kodInput.value.trim().toUpperCase();
    if (kod.length < 4) { hiba(t('invalidCode')); return; }
    try {
      const tal = await kodKeres(kod);
      if (!tal) { hiba(t('unknown')); return; }
      if (kontaktEltérés(tal.nyilvanos, tal.nev, tal.kod)) { hiba(t('identityMismatch')); return; }
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
  if (a === 'turn-info-open') { turnInfoNyitva = true; render(); }
  if (a === 'turn-info-close') { turnInfoNyitva = false; render(); }
  if (a === 'connection-help-close') { connectionHelpNyitva = false; render(); }
  if (a === 'open-turn-settings') { connectionHelpNyitva = false; turnInfoNyitva = false; nézet = 'settings'; render(); }
  if (a === 'jog') { jog = g.dataset.jog; nyitott = nézet; nézet = 'legal'; render(); }
  if (a === 'vissza') { nézet = fiok ? 'settings' : 'home'; render(); }
  if (a === 'megse') { találat = null; turnKérés = false; turnInfoNyitva = false; if (hívás?.irany === 'kimeno') hivasLezar('vege', true); else { nézet = 'home'; render(); } }
  if (a === 'hiv' && találat) {
    const c = találat;
    const useTurn = Boolean(document.querySelector('#useTurn')?.checked || turnKérés);
    if (useTurn && !turnKonfiguralva()) { window.alert(t('turnMissing')); return; }
    találat = null;
    turnKérés = false;
    hiv(c.nyilvanos, c.nev, c.kod, useTurn, c.verified);
  }
  if (a === 'contact-skip') { mentendoKontakt = null; render(); }
  if (a === 'contact-save' && mentendoKontakt) {
    const contact = mentendoKontakt;
    if (kontaktok.some(item => item.nyilvanos === contact.nyilvanos || normalizeName(item.név).toLocaleLowerCase() === normalizeName(contact.név).toLocaleLowerCase())) {
      mentendoKontakt = null;
      render();
      return;
    }
    try {
      kontaktok.push(makeContactRecord(contact));
      await saveContacts(kontaktok);
      mentendoKontakt = null;
      render();
    } catch (error) { hiba(error.message); }
  }
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
  if (a === 'file-send') document.querySelector('#filePicker')?.click();
  if (a === 'file-download') fajlLetoltese();
  if (a === 'eszkoz') devices(g.dataset.tipus);
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
  if (a === 'nevment') {
    const nev = document.querySelector('#nevbe').value.trim();
    if (!nev) { hiba(t('badName')); return; }
    fiok.nev = nev; fiok.nyelv = nyelv; await ment(); profilEsemeny(); g.textContent = t('saved');
  }
  if (a === 'relment') {
    rel = [...new Set(document.querySelector('#relbe').value.split(/\r?\n/).map(x => x.trim()).filter(x => /^wss:\/\//i.test(x)))];
    if (!rel.length) rel = [...alapRel];
    fiok.rel = rel; await ment(); kapcsol(); g.textContent = t('saved');
  }
  if (a === 'save-turn') {
    turnSzerverek = Array.from({ length: 3 }, (_, index) => ({
      urls: document.querySelector(`#turn-url-${index}`).value.trim(),
      username: document.querySelector(`#turn-user-${index}`).value.trim(),
      credential: document.querySelector(`#turn-credential-${index}`).value
    })).filter(server => server.urls && /^turns?:/i.test(server.urls));
    localStorage.setItem(turnTároló, JSON.stringify(turnSzerverek));
    g.textContent = t('saved');
  }
  if (a === 'export-identity' && window.confirm(t('backupWarning'))) exportIdentity();
  if (a === 'reset-all') {
    if (!window.confirm(t('eraseWarn'))) return;
    const accountPubkey = fiok?.nyilvanos;
    if (accountPubkey) await deleteKeyRecord(accountPubkey);
    if (pool && aktivRelékek.length) pool.close(aktivRelékek);
    keyInMemory = null;
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
  if (e.target.id === 'useTurn') turnKérés = e.target.checked;
  if (e.target.id === 'nyelv') { nyelv = e.target.value; if (fiok) { fiok.nyelv = nyelv; ment(); } render(); }
});

async function indul() {
  try {
    const lezárt = JSON.parse(localStorage.getItem(lezártHívásTároló) || '[]');
    if (Array.isArray(lezárt)) lezártHívások = new Set(lezárt.filter(id => typeof id === 'string'));
  } catch {}
  try {
    const storedTurn = JSON.parse(localStorage.getItem(turnTároló) || '[]');
    if (Array.isArray(storedTurn)) turnSzerverek = storedTurn.slice(0, 3).filter(server => server && /^turns?:/i.test(server.urls || ''));
  } catch {}
  try {
    const n = await import('https://esm.sh/nostr-tools@2.10.4?bundle');
    window.nostrEszkoz = n;
    pool = new n.SimplePool();
  } catch { könyvtárHiba = true; }
  try {
    const stored = await loadAccountRecord();
    if (stored) {
      fiok = { ...stored.account, rel: Array.isArray(stored.account.rel) && stored.account.rel.length ? stored.account.rel : [...alapRel] };
      nyelv = fiok.nyelv === 'hu' ? 'hu' : 'en';
      kontaktok = await loadContacts();
      const regiRel = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'];
      if (JSON.stringify(fiok.rel) === JSON.stringify(regiRel)) { rel = [...alapRel]; fiok.rel = rel; await ment(); }
      else rel = Array.isArray(fiok.rel) && fiok.rel.length ? fiok.rel : [...alapRel];
      await loadKey(stored);
    } else {
      fiok = null;
      localStorage.removeItem(tarolo);
    }
  } catch { fiok = null; }
  if (pool) kapcsol();
  render();
  setInterval(meret, 3000);
  if (fiok && pool) setInterval(profilEsemeny, 12 * 60 * 60 * 1000);
}

indul();
