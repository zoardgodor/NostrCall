const gyoker = document.querySelector('#app');
const tarolo = 'nostrcall-fiok-v1';
const alapRel = ['wss://relay.primal.net', 'wss://nos.lol', 'wss://relay.damus.io'];
const abc = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const jelek = {
  ember: '<svg class="avatar-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor"/><circle cx="12" cy="9" r="3" fill="none" stroke="currentColor"/><path d="M5.5 18.5c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
  mikro: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="9" y="3" width="6" height="12" fill="none" stroke="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
  hang: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 10.5c4.5-4 11.5-4 16 0v5l-4 2-3-4h-2l-3 4-4-2z" fill="none" stroke="currentColor" stroke-linejoin="round"/></svg>',
  nyil: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  marka: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 10h4l2-5 3 10 2-5h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>'
};

const szoveg = {
  en: {
    app: 'NostrCall', tag: 'VOICE OVER NOSTR', homeTitle: 'Make a private call.', homeLead: 'Enter a contact code to look up who you want to reach.', codeLabel: 'CONTACT CODE', codePlaceholder: 'For example, 7K4Q9M', next: 'Continue', yourCode: 'YOUR CALLING CODE', copy: 'Copy', copied: 'Copied', settings: 'Settings', relays: 'relays connected', unavailable: 'Nostr library unavailable. Check your connection and reload.',
    welcome: 'Your voice, your keys.', welcomeLead: 'Create a local account to get a short code people can call.', name: 'DISPLAY NAME', namePlaceholder: 'How should people see you?', start: 'Start', agree: 'By continuing, you agree to the', terms: 'Terms of Service', privacy: 'Privacy Policy', and: 'and', codeIntro: 'Your calling code', codeHelp: 'You can share this code with people you trust.',
    lookupTitle: 'Call this person?', call: 'Call', cancel: 'Cancel', unknown: 'No account found for this code. The person may be offline or not published to these relays.',
    calling: 'Calling', ringing: 'Ringing', connecting: 'Connecting', connected: 'Connected', busy: 'Busy', noanswer: 'No answer', rejected: 'Call declined', ended: 'Call ended', incoming: 'Incoming call', from: 'is calling you', accept: 'Accept', decline: 'Decline', hangup: 'End call', mute: 'Mute microphone', unmute: 'Unmute microphone', deafen: 'Silence audio', undeafen: 'Restore audio', input: 'Microphone', output: 'Speaker', quality: 'Connection quality',
    account: 'Account', save: 'Save changes', saved: 'Saved', display: 'Display name', language: 'Language', english: 'English', hungarian: 'Hungarian', relaySettings: 'Nostr relays', relayHelp: 'One secure WebSocket relay URL per line.', reconnect: 'Save and reconnect', erase: 'Delete account', eraseWarn: 'This permanently removes your local key and settings. Your published relay profile may remain until relays remove it.', eraseFirst: 'Delete this account?', eraseSecond: 'This cannot be undone. Type DELETE to confirm.', typeDelete: 'Type DELETE', deleteNow: 'Delete permanently', back: 'Back', close: 'Close', legal: 'Legal',
    termsTitle: 'Terms of Service', privacyTitle: 'Privacy Policy', lastUpdated: 'Last updated: October 6, 2026', termsP1: 'NostrCall is an experimental, peer-to-peer voice calling demo. By using it, you agree to use it lawfully and respectfully. You are responsible for the display name and calling code you share.', termsP2: 'Calls are not guaranteed to connect, remain private from your device or network provider, or be available at any time. Do not use NostrCall for emergency calls or for information whose loss or disclosure could cause harm.', termsP3: 'You are responsible for protecting access to your device and browser profile. Anyone with access to this browser storage may be able to use your account. Deleting the account removes its key from this browser but cannot recall events already distributed to relays.', termsP4: 'The software is provided as-is, without warranties or service-level commitments, to the extent permitted by law. These terms may be updated with the published application. Applicable mandatory consumer rights remain unaffected.', privacyP1: 'NostrCall has no application server and does not collect analytics. Your private key, display name, settings, and language choice are stored in this browser using local storage. The private key is used locally to sign and encrypt Nostr events and is never intentionally sent to a relay.', privacyP2: 'Your short code, public key, and display name are published in a public Nostr event so other users can find you. Relay operators may store, copy, index, or disclose that event under their own policies. Anyone who knows your code can look up the public profile and try to call.', privacyP3: 'Call setup messages are encrypted between Nostr keys using NIP-04. Relays can still observe event timing, size, and routing metadata. Voice media is sent directly between browsers with WebRTC, not through the Nostr relays. Your network may observe the peer connection. This demo does not include a TURN relay.', privacyP4: 'The browser asks for microphone permission only when you place or accept a call. Available device labels and selections are handled by the browser. Calls and incoming call alerts work only while the page is open and connected.', privacyP5: 'You can change your name, relay list, or language in Settings and delete the local account there. Clearing site data also removes the locally stored key. Public relay events may persist after either action. For questions, contact the person or organization that hosts this copy of the static site.',
    micDenied: 'Microphone access was not granted. Check your browser permission.', callFail: 'Could not establish the call. Check microphone access and relay connectivity.', relayFail: 'Could not publish to a relay. Check the relay list and connection.', invalidCode: 'Enter a code with at least 4 characters.', badName: 'Enter a display name.', connectedHint: 'Peer-to-peer audio is active.', notSupported: 'Device selection is not supported by this browser.', noDevice: 'No audio device found.'
  },
  hu: {
    app: 'NostrCall', tag: 'HANGHÍVÁS NOSTR-RELÉKEN', homeTitle: 'Indíts privát hívást.', homeLead: 'Írd be annak a kódját, akit el szeretnél érni.', codeLabel: 'HÍVÁSKÓD', codePlaceholder: 'Például: 7K4Q9M', next: 'Tovább', yourCode: 'A TE HÍVÁSKÓD', copy: 'Másolás', copied: 'Kimásolva', settings: 'Beállítások', relays: 'kapcsolódó relé', unavailable: 'A Nostr-könyvtár nem érhető el. Ellenőrizd a kapcsolatot, majd töltsd újra az oldalt.',
    welcome: 'A hangod, a kulcsaid.', welcomeLead: 'Hozz létre egy helyi fiókot, hogy mások egy rövid kóddal hívhassanak.', name: 'MEGJELENŐ NÉV', namePlaceholder: 'Milyen néven lássanak?', start: 'Indítás', agree: 'A folytatással elfogadod a', terms: 'Felhasználási feltételeket', privacy: 'Adatvédelmi irányelveket', and: 'és az', codeIntro: 'A híváskódod', codeHelp: 'Ezt a kódot azokkal oszd meg, akikben megbízol.',
    lookupTitle: 'Felhívod őt?', call: 'Hívás', cancel: 'Mégse', unknown: 'Ehhez a kódhoz nem található fiók. Lehet, hogy a másik fél offline, vagy nincs kint a reléken.',
    calling: 'Hívás', ringing: 'Kicseng', connecting: 'Kapcsolódás', connected: 'Kapcsolódva', busy: 'Foglalt', noanswer: 'Nincs válasz', rejected: 'A hívást elutasították', ended: 'Hívás vége', incoming: 'Bejövő hívás', from: 'hív téged', accept: 'Elfogadás', decline: 'Elutasítás', hangup: 'Hívás befejezése', mute: 'Mikrofon némítása', unmute: 'Mikrofon bekapcsolása', deafen: 'Hang elnémítása', undeafen: 'Hang visszakapcsolása', input: 'Mikrofon', output: 'Hangszóró', quality: 'Kapcsolat minősége',
    account: 'Fiók', save: 'Mentés', saved: 'Mentve', display: 'Megjelenő név', language: 'Nyelv', english: 'Angol', hungarian: 'Magyar', relaySettings: 'Nostr-relék', relayHelp: 'Soronként egy biztonságos WebSocket-relé címe.', reconnect: 'Mentés és újracsatlakozás', erase: 'Fiók törlése', eraseWarn: 'Ez végleg törli a helyi kulcsot és beállításokat. A közzétett reléprofil a relékről még megmaradhat.', eraseFirst: 'Törlöd ezt a fiókot?', eraseSecond: 'Ez nem vonható vissza. A megerősítéshez írd be: DELETE.', typeDelete: 'Írd be: DELETE', deleteNow: 'Végleges törlés', back: 'Vissza', close: 'Bezárás', legal: 'Jogi információk',
    termsTitle: 'Felhasználási feltételek', privacyTitle: 'Adatvédelmi irányelvek', lastUpdated: 'Utolsó frissítés: 2026. október 6.', termsP1: 'A NostrCall egy kísérleti, közvetlen hanghívásra szolgáló bemutató. Használatával vállalod, hogy jogszerűen és másokat tiszteletben tartva használod. Te felelsz a megosztott megjelenő nevedért és híváskódodért.', termsP2: 'A hívás kapcsolódása, a készüléked és hálózati szolgáltatód előtti adatvédelem, illetve a szolgáltatás folyamatos elérhetősége nem garantált. Ne használd segélyhívásra, vagy olyan információhoz, amelynek elvesztése vagy nyilvánosságra kerülése kárt okozhat.', termsP3: 'Te felelsz a készüléked és böngészőprofilod védelméért. A böngészőtárhelyhez hozzáférő személy használhatja a fiókodat. A fiók törlése eltávolítja a kulcsot erről a böngészőről, de a relékre már továbbított eseményeket nem vonja vissza.', termsP4: 'A szoftver a jogszabályok által megengedett mértékig jelen állapotában, garancia és rendelkezésreállási vállalás nélkül használható. A feltételek a közzétett alkalmazással frissülhetnek. A kötelező fogyasztói jogokat ez nem érinti.', privacyP1: 'A NostrCallnak nincs alkalmazásszervere, és nem gyűjt analitikai adatokat. A privát kulcs, a megjelenő név, a beállítások és a nyelv a böngésző helyi tárhelyén maradnak. A privát kulcsot az alkalmazás helyben használja Nostr-események aláírására és titkosítására; szándékosan nem küldi relére.', privacyP2: 'A rövid kód, a nyilvános kulcs és a megjelenő név nyilvános Nostr-eseményként kerül ki, hogy mások megtalálhassanak. A relé üzemeltetője a saját szabályai szerint tárolhatja, másolhatja, indexelheti vagy közzéteheti az eseményt. A kód ismeretében bárki megkeresheti a nyilvános profilt és hívást kezdeményezhet.', privacyP3: 'A hívásjelzés NIP-04 szerint titkosítva halad a Nostr-kulcsok között. A relék ettől még láthatják az események időpontját, méretét és útválasztási adatait. A hang WebRTC-vel közvetlenül a böngészők között utazik, nem a Nostr-reléken. A hálózatod láthatja a partnerkapcsolatot. Ez a bemutató nem használ TURN-relét.', privacyP4: 'A böngésző csak hívás indításakor vagy fogadásakor kér mikrofonengedélyt. Az eszközneveket és választásokat a böngésző kezeli. A hívás és a bejövő hívásjelzés csak nyitott, kapcsolódó oldal mellett működik.', privacyP5: 'A nevedet, reléidet és a nyelvet a Beállításokban módosíthatod, a helyi fiókot pedig ott törölheted. A webhelyadatok törlése szintén eltávolítja a helyben tárolt kulcsot. A nyilvános reléesemények mindkét esetben megmaradhatnak. Kérdés esetén keresd a statikus oldal üzemeltetőjét.',
    micDenied: 'Nem kaptunk hozzáférést a mikrofonhoz. Ellenőrizd a böngésző engedélyeit.', callFail: 'Nem sikerült létrehozni a hívást. Ellenőrizd a mikrofon engedélyét és a relékapcsolatot.', relayFail: 'Nem sikerült relére közzétenni. Ellenőrizd a relélistát és a kapcsolatot.', invalidCode: 'Legalább 4 karakteres kódot adj meg.', badName: 'Adj meg egy nevet.', connectedHint: 'A közvetlen hangkapcsolat aktív.', notSupported: 'A böngésző nem támogatja az eszközválasztást.', noDevice: 'Nem található hangeszköz.'
  }
};

let fiok = null;
let pool = null;
let nyelv = 'en';
let rel = [...alapRel];
let nez = 'home';
let jog = 'terms';
let kodUj = kodGeneral();
let talalat = null;
let hivas = null;
let alair = new Set();
let aktivRel = [];
let nyitott = null;
let hangKimenet = null;
let konyvHiba = false;
let felirat = null;
let peldany = 0;
let varakozoJelolt = new Map();

function t(k) { return szoveg[nyelv]?.[k] || szoveg.en[k] || k; }
function esc(v = '') { return String(v).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]); }
function bajtHex(b) { return [...b].map(x => x.toString(16).padStart(2, '0')).join(''); }
function hexBajt(s) { return new Uint8Array(s.match(/.{2}/g).map(x => parseInt(x, 16))); }
function kodGeneral() {
  const b = crypto.getRandomValues(new Uint8Array(6));
  return [...b].map(x => abc[x % abc.length]).join('');
}
function veletlen() { return crypto.randomUUID ? crypto.randomUUID() : [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, '0')).join(''); }
function ment() { localStorage.setItem(tarolo, JSON.stringify(fiok)); }
function jelszam() { return pool?.listConnectionStatus ? [...pool.listConnectionStatus().values()].filter(Boolean).length : 0; }
function profilEsemeny() {
  if (!fiok || !pool || !window.nostrEszkoz) return;
  const { finalizeEvent } = window.nostrEszkoz;
  const es = finalizeEvent({ kind: 30078, created_at: Math.floor(Date.now() / 1000), tags: [['d', `nostrcall:${fiok.kod}`], ['expiration', String(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30)]], content: JSON.stringify({ kod: fiok.kod, nev: fiok.nev }) }, hexBajt(fiok.titok));
  Promise.any(pool.publish(rel, es)).catch(() => hiba(t('relayFail')));
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
  const valtozott = ujRel.join('\n') !== aktivRel.join('\n');
  if (felirat) { try { felirat.close(); } catch {} felirat = null; }
  if (pool && valtozott && aktivRel.length) pool.close(aktivRel);
  rel = ujRel;
  if (pool) {
    pool.trackRelays = true;
    if (valtozott) {
      aktivRel = [...rel];
      Promise.allSettled(rel.map(cim => pool.ensureRelay(cim))).then(meret);
    }
    if (fiok) {
      felirat = pool.subscribeMany(rel, [{ kinds: [25050], '#p': [fiok.nyilvanos], since: Math.floor(Date.now() / 1000) - 90 }], { onevent: es => bejovo(es) });
      profilEsemeny();
    }
  }
  meret();
}
async function esemeny(kulcs, cel, tipus, adat) {
  if (!pool || !window.nostrEszkoz) throw new Error('nostr');
  const { finalizeEvent, nip04 } = window.nostrEszkoz;
  const tart = await nip04.encrypt(hexBajt(fiok.titok), cel, JSON.stringify({ tipus, ...adat }));
  const es = finalizeEvent({ kind: 25050, created_at: Math.floor(Date.now() / 1000), tags: [['p', cel], ['t', 'nostrcall'], ['call', kulcs]], content: tart }, hexBajt(fiok.titok));
  await Promise.any(pool.publish(rel, es));
}
async function kodKeres(kod) {
  if (!pool) throw new Error('nostr');
  const esek = await pool.querySync(rel, { kinds: [30078], '#d': [`nostrcall:${kod}`], limit: 10 });
  const jo = esek.filter(es => es.pubkey !== fiok.nyilvanos).sort((a, b) => b.created_at - a.created_at);
  for (const es of jo) {
    try {
      const ad = JSON.parse(es.content);
      if (ad.kod === kod && ad.nev) return { nev: ad.nev, nyilvanos: es.pubkey, kod };
    } catch {}
  }
  return null;
}
async function bejovo(es) {
  if (es.pubkey === fiok?.nyilvanos || alair.has(es.id) || !window.nostrEszkoz) return;
  alair.add(es.id);
  try {
    const { nip04 } = window.nostrEszkoz;
    const nyilt = await nip04.decrypt(hexBajt(fiok.titok), es.pubkey, es.content);
    const adat = JSON.parse(nyilt);
    if (!adat.tipus || !adat.hivas) return;
    await jelKezel(es.pubkey, adat);
  } catch {}
}
async function jelKezel(peer, adat) {
  if (adat.tipus === 'jelolt' && (!hivas || adat.hivas !== hivas.id)) {
    const elozo = varakozoJelolt.get(adat.hivas);
    if (!elozo || elozo.peer === peer) {
      const lista = elozo?.lista || [];
      lista.push(adat.jelolt);
      if (lista.length > 24) lista.shift();
      varakozoJelolt.set(adat.hivas, { peer, lista });
    }
    return;
  }
  if (adat.tipus === 'ajanlat') {
    if (hivas) {
      await esemeny(adat.hivas, peer, 'foglalt', { hivas: adat.hivas });
      return;
    }
    const elozo = varakozoJelolt.get(adat.hivas);
    const jeloltek = elozo?.peer === peer ? elozo.lista.map(x => new RTCIceCandidate(x)) : [];
    varakozoJelolt.delete(adat.hivas);
    hivas = { id: adat.hivas, peer, nev: adat.nev || 'Nostr user', irany: 'bejovo', allapot: 'bejovo', ajanlat: adat.sdp, pc: null, stream: null, tavoli: null, zar: jeloltek, nemit: false, siket: false };
    idoLejar(45000);
    render();
  } else if (!hivas || adat.hivas !== hivas.id || peer !== hivas.peer) return;
  else if (adat.tipus === 'valasz' && hivas.irany === 'kimeno') {
    clearTimeout(hivas.ido);
    hivas.allapot = 'kapcsolodas';
    await hivas.pc.setRemoteDescription(adat.sdp);
    await jelSor();
    render();
  } else if (adat.tipus === 'jelolt') {
    const jelolt = new RTCIceCandidate(adat.jelolt);
    if (hivas.pc?.remoteDescription) await hivas.pc.addIceCandidate(jelolt);
    else hivas.zar.push(jelolt);
  } else if (adat.tipus === 'nincsvalasz') hivasLezar('nincsvalasz', false);
  else if (adat.tipus === 'elutasit') hivasLezar('elutasitva', false);
  else if (adat.tipus === 'foglalt') hivasLezar('foglalt', false);
  else if (adat.tipus === 'befejez') hivasLezar('vege', false);
}
async function jelSor() {
  if (!hivas?.pc || !hivas.zar.length) return;
  for (const jelolt of hivas.zar.splice(0)) await hivas.pc.addIceCandidate(jelolt);
}
async function pcLetrehoz() {
  const hc = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
  hivas.stream = hc;
  hivas.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  hc.getTracks().forEach(s => hivas.pc.addTrack(s, hc));
  hivas.pc.onicecandidate = e => { if (e.candidate && hivas) esemeny(hivas.id, hivas.peer, 'jelolt', { hivas: hivas.id, jelolt: e.candidate.toJSON() }); };
  hivas.pc.ontrack = e => {
    hangKimenet = e.streams[0];
    if (hivas) { hivas.tavoli = hangKimenet; hivas.allapot = 'kapcsolodva'; render(); }
  };
  hivas.pc.onconnectionstatechange = () => {
    if (!hivas?.pc) return;
    const all = hivas.pc.connectionState;
    if (all === 'connected') { hivas.allapot = 'kapcsolodva'; hivas.minoseg = 'good'; }
    else if (all === 'failed' || all === 'closed') { if (all === 'failed') hivasLezar('vege', false); }
    else if (all === 'disconnected' && hivas.allapot === 'kapcsolodva') hivas.minoseg = 'bad';
    render();
  };
  hivas.statisztika = setInterval(async () => {
    if (!hivas?.pc) return;
    try {
      const adatok = await hivas.pc.getStats();
      let rtt = null;
      adatok.forEach(x => { if (x.type === 'candidate-pair' && x.state === 'succeeded' && (x.selected || x.nominated)) rtt = x.currentRoundTripTime; });
      const min = rtt === null ? 'mid' : rtt < 0.18 ? 'good' : rtt < 0.4 ? 'mid' : 'bad';
      if (hivas && hivas.minoseg !== min) {
        hivas.minoseg = min;
        const jelzo = document.querySelector('.quality');
        if (jelzo) jelzo.className = `quality ${min}`;
      }
    } catch {}
  }, 2500);
}
function idoLejar(ms) {
  if (hivas.ido) clearTimeout(hivas.ido);
  hivas.ido = setTimeout(() => {
    if (!hivas) return;
    if (hivas.irany === 'kimeno' && ['hivas', 'cseng', 'kapcsolodas'].includes(hivas.allapot)) esemeny(hivas.id, hivas.peer, 'nincsvalasz', { hivas: hivas.id }).catch(() => {});
    hivasLezar('nincsvalasz', false);
  }, ms);
}
async function hiv(ind, nev) {
  if (!pool) { hiba(t('unavailable')); return; }
  hivas = { id: veletlen(), peer: ind, nev, irany: 'kimeno', allapot: 'hivas', pc: null, stream: null, tavoli: null, zar: [], nemit: false, siket: false };
  render();
  idoLejar(45000);
  try {
    await pcLetrehoz();
    const ajanlat = await hivas.pc.createOffer();
    await hivas.pc.setLocalDescription(ajanlat);
    await esemeny(hivas.id, ind, 'ajanlat', { hivas: hivas.id, nev: fiok.nev, sdp: hivas.pc.localDescription });
    if (hivas) { hivas.allapot = 'cseng'; render(); }
  } catch {
    hivasLezar('vege', false);
    hiba(t('callFail'));
  }
}
async function fogad() {
  if (!hivas) return;
  clearTimeout(hivas.ido);
  try {
    await pcLetrehoz();
    await hivas.pc.setRemoteDescription(hivas.ajanlat);
    await jelSor();
    const val = await hivas.pc.createAnswer();
    await hivas.pc.setLocalDescription(val);
    hivas.allapot = 'kapcsolodas';
    await esemeny(hivas.id, hivas.peer, 'valasz', { hivas: hivas.id, sdp: hivas.pc.localDescription });
    render();
  } catch {
    hivasLezar('vege', true);
    hiba(t('callFail'));
  }
}
function hivasLezar(allapot, kuld) {
  if (!hivas) return;
  const regi = hivas;
  clearTimeout(regi.ido);
  clearInterval(regi.statisztika);
  if (kuld && pool) esemeny(regi.id, regi.peer, 'befejez', { hivas: regi.id }).catch(() => {});
  regi.stream?.getTracks().forEach(x => x.stop());
  regi.pc?.close();
  hivas = null;
  hangKimenet = null;
  nez = allapot === 'elutasitva' || allapot === 'foglalt' || allapot === 'nincsvalasz' || allapot === 'vege' ? allapot : 'home';
  render();
  if (nez !== 'home') setTimeout(() => { if (!hivas && ['elutasitva', 'foglalt', 'nincsvalasz', 'vege'].includes(nez)) { nez = 'home'; render(); } }, 2600);
}
function minosegRajz() {
  let oszt = hivas?.minoseg || (hivas?.pc?.connectionState === 'connected' ? 'good' : 'mid');
  return `<span class="quality ${oszt}" aria-label="${esc(t('quality'))}"><i></i><i></i><i></i></span>`;
}
function kodDoboz(kod, feliratKod) {
  return `<div class="code-box"><span class="code-text">${esc(kod)}</span><button class="copy-btn" data-action="masol" data-kod="${esc(kod)}">${esc(t('copy'))}</button></div>`;
}
function fejlec() {
  return `<header class="topbar"><div class="wrap top-inner"><div class="brand"><span class="brand-mark">${jelek.marka}</span>${esc(t('app'))}</div><div class="top-actions"><span class="relay-count"><i class="relay-dot"></i><span id="relayszam">${jelszam()} ${esc(t('relays'))}</span></span>${fiok ? `<button class="icon-btn" data-action="beall" aria-label="${esc(t('settings'))}" title="${esc(t('settings'))}">${jelek.ember}</button>` : ''}</div></div></header>`;
}
function kezdolap() {
  if (!fiok) return `<section class="home"><div class="eyebrow">${esc(t('tag'))}</div><h1>${esc(t('welcome'))}</h1><p class="lead">${esc(t('welcomeLead'))}</p><form id="kezdo"><label class="field-label" for="nev">${esc(t('name'))}</label><input class="text-input" id="nev" name="nev" maxlength="32" autocomplete="nickname" placeholder="${esc(t('namePlaceholder'))}" required><p class="form-error" id="hiba"></p><div class="profile-code"><div class="profile-code-head"><span>${esc(t('codeIntro'))}</span></div>${kodDoboz(kodUj, 'new')}</div><p class="notice">${esc(t('codeHelp'))}</p><div class="divider"></div><button class="primary full" type="submit">${esc(t('start'))}</button><p class="legal-note">${esc(t('agree'))} <button type="button" data-action="jog" data-jog="terms">${esc(t('terms'))}</button> ${esc(t('and'))} <button type="button" data-action="jog" data-jog="privacy">${esc(t('privacy'))}</button>.</p></form></section>`;
  const status = nez === 'elutasitva' ? t('rejected') : nez === 'foglalt' ? t('busy') : nez === 'nincsvalasz' ? t('noanswer') : nez === 'vege' ? t('ended') : '';
  return `<section class="home"><div class="eyebrow">${esc(t('tag'))}</div><h1>${esc(t('homeTitle'))}</h1><p class="lead">${esc(t('homeLead'))}</p><form id="keres"><label class="field-label" for="kod">${esc(t('codeLabel'))}</label><input class="text-input" id="kod" name="kod" maxlength="24" autocomplete="off" placeholder="${esc(t('codePlaceholder'))}" required><p class="form-error" id="hiba">${status ? esc(status) : konyvHiba ? esc(t('unavailable')) : ''}</p><button class="primary full" type="submit">${esc(t('next'))}</button></form><div class="profile-code"><div class="profile-code-head"><span>${esc(t('yourCode'))}</span></div>${kodDoboz(fiok.kod)}</div><p class="notice">${esc(t('codeHelp'))}</p></section>`;
}
function jogSzoveg() {
  if (jog === 'terms') return `<h3>${esc(t('termsTitle'))}</h3><p>${esc(t('termsP1'))}</p><p>${esc(t('termsP2'))}</p><p>${esc(t('termsP3'))}</p><p>${esc(t('termsP4'))}</p>`;
  return `<h3>${esc(t('privacyTitle'))}</h3><p>${esc(t('privacyP1'))}</p><p>${esc(t('privacyP2'))}</p><p>${esc(t('privacyP3'))}</p><p>${esc(t('privacyP4'))}</p><p>${esc(t('privacyP5'))}</p>`;
}
function jogNezet() { return `<div class="overlay"><article class="dialog"><div class="settings-head"><div><div class="eyebrow">${esc(t('legal'))}</div><h2>${esc(t(jog === 'terms' ? 'termsTitle' : 'privacyTitle'))}</h2></div><button class="icon-btn" data-action="vissza" aria-label="${esc(t('back'))}">×</button></div><p>${esc(t('lastUpdated'))}</p><div class="legal-body">${jogSzoveg()}</div><div class="dialog-actions"><button class="secondary" data-action="vissza">${esc(t('back'))}</button></div></article></div>`; }
function eszkozSor() {
  if (!hivas?.stream) return '';
  return `<div class="device-tools"><button class="secondary" data-action="eszkoz" data-tipus="be">${esc(t('input'))} ${jelek.nyil}</button><button class="secondary" data-action="eszkoz" data-tipus="ki">${esc(t('output'))} ${jelek.nyil}</button></div><div id="eszkozok"></div>`;
}
function hivasAblak() {
  if (!hivas) return '';
  const bej = hivas.irany === 'bejovo';
  const csatl = hivas.allapot === 'kapcsolodva';
    const all = hivas.allapot === 'hivas' ? t('calling') : hivas.allapot === 'cseng' ? t('ringing') : hivas.allapot === 'bejovo' ? t('incoming') : hivas.allapot === 'kapcsolodva' ? t('connected') : t('connecting');
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(bej ? t('incoming') : t('app'))}</div><h2>${esc(bej ? hivas.nev : t('lookupTitle'))}</h2><p>${esc(bej ? t('from') : `${t('calling')} ${hivas.nev}`)}</p><div class="call-status"><i class="status-pip ${csatl ? '' : 'pulse'}"></i><span>${esc(all)}</span>${csatl ? minosegRajz() : ''}</div>${csatl ? `<p>${esc(t('connectedHint'))}</p><div class="call-toolbar"><button class="icon-btn ${hivas.nemit ? 'active' : ''}" data-action="nemit" aria-label="${esc(hivas.nemit ? t('unmute') : t('mute'))}" title="${esc(hivas.nemit ? t('unmute') : t('mute'))}">${jelek.mikro}</button><button class="icon-btn ${hivas.siket ? 'active' : ''}" data-action="siket" aria-label="${esc(hivas.siket ? t('undeafen') : t('deafen'))}" title="${esc(hivas.siket ? t('undeafen') : t('deafen'))}">${jelek.hang}</button><button class="secondary hang" data-action="letesz">${esc(t('hangup'))}</button></div>${eszkozSor()}` : bej ? `<div class="dialog-actions"><button class="danger" data-action="elutasit">${esc(t('decline'))}</button><button class="primary" data-action="fogad">${esc(t('accept'))}</button></div>` : `<div class="dialog-actions"><button class="secondary" data-action="letesz">${esc(t('cancel'))}</button></div>`}</article></div>`;
}
function talalatAblak() {
  if (!talalat) return '';
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('lookupTitle'))}</div><h2>${esc(talalat.nev)}</h2><p>${esc(talalat.kod)}</p><div class="dialog-actions"><button class="secondary" data-action="megse">${esc(t('cancel'))}</button><button class="primary" data-action="hiv">${esc(t('call'))}</button></div></article></div>`;
}
function beallitas() {
  const joNyelv = nyelv;
  return `<div class="overlay"><article class="dialog"><div class="settings-head"><div><div class="eyebrow">${esc(t('account'))}</div><h2>${esc(t('settings'))}</h2></div><button class="icon-btn" data-action="megse" aria-label="${esc(t('close'))}">×</button></div><section class="settings-section"><h3>${esc(t('account'))}</h3><label class="field-label" for="nevbe">${esc(t('display'))}</label><input class="text-input" id="nevbe" maxlength="32" value="${esc(fiok.nev)}"><div class="settings-row"><span>${esc(t('language'))}</span><select id="nyelv"><option value="en" ${joNyelv === 'en' ? 'selected' : ''}>${esc(t('english'))}</option><option value="hu" ${joNyelv === 'hu' ? 'selected' : ''}>${esc(t('hungarian'))}</option></select></div><div class="settings-links"><button class="text-link" data-action="jog" data-jog="terms">${esc(t('terms'))}</button><button class="text-link" data-action="jog" data-jog="privacy">${esc(t('privacy'))}</button></div><button class="secondary full" style="margin-top:14px" data-action="nevment">${esc(t('save'))}</button></section><section class="settings-section"><h3>${esc(t('relaySettings'))}</h3><p class="hint">${esc(t('relayHelp'))}</p><textarea class="text-area" id="relbe" rows="4">${esc(rel.join('\n'))}</textarea><button class="secondary full" data-action="relment">${esc(t('reconnect'))}</button></section><section class="settings-section"><h3>${esc(t('erase'))}</h3><p>${esc(t('eraseWarn'))}</p><button class="danger full" data-action="torol1">${esc(t('erase'))}</button></section></article></div>`;
}
function torolAblak(masodik = false) {
  return `<div class="overlay"><article class="dialog"><div class="eyebrow">${esc(t('erase'))}</div><h2>${esc(t(masodik ? 'eraseSecond' : 'eraseFirst'))}</h2>${masodik ? `<input class="text-input" id="torolmez" placeholder="${esc(t('typeDelete'))}" autocomplete="off"><p class="form-error" id="hiba"></p>` : `<p>${esc(t('eraseWarn'))}</p>`}<div class="dialog-actions"><button class="secondary" data-action="torolmegse">${esc(t('cancel'))}</button><button class="danger" data-action="${masodik ? 'torolveg' : 'torol2'}">${esc(masodik ? t('deleteNow') : t('erase'))}</button></div></article></div>`;
}
function render() {
  document.documentElement.lang = nyelv;
  const modal = nez === 'legal' ? jogNezet() : nez === 'settings' ? beallitas() : nez === 'torol1' ? torolAblak(false) : nez === 'torol2' ? torolAblak(true) : hivas ? hivasAblak() : talalat ? talalatAblak() : '';
  gyoker.innerHTML = `${fejlec()}<main class="wrap main">${kezdolap()}</main>${modal}<audio id="hang" autoplay playsinline></audio>`;
  const audio = document.querySelector('#hang');
  if (audio && hangKimenet) { audio.srcObject = hangKimenet; audio.muted = Boolean(hivas?.siket); audio.play().catch(() => {}); }
  meret();
}
function devices(tipus) {
  const box = document.querySelector('#eszkozok');
  if (!box) return;
  if (tipus === 'ki' && typeof document.querySelector('#hang')?.setSinkId !== 'function') { box.innerHTML = `<p class="hint">${esc(t('notSupported'))}</p>`; return; }
  navigator.mediaDevices.enumerateDevices().then(dev => {
    const lista = dev.filter(x => tipus === 'be' ? x.kind === 'audioinput' : x.kind === 'audiooutput');
    if (!lista.length) { box.innerHTML = `<p class="hint">${esc(t('noDevice'))}</p>`; return; }
    box.innerHTML = `<select class="select-input" id="eszkval"><option value="">${esc(tipus === 'be' ? t('input') : t('output'))}</option>${lista.map((x, i) => `<option value="${esc(x.deviceId)}">${esc(x.label || `${tipus === 'be' ? t('input') : t('output')} ${i + 1}`)}</option>`).join('')}</select>`;
    document.querySelector('#eszkval').addEventListener('change', async e => {
      try {
        if (tipus === 'be') {
          const uj = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: e.target.value }, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
          const sav = uj.getAudioTracks()[0];
          const kuldo = hivas?.pc?.getSenders().find(x => x.track?.kind === 'audio');
          if (kuldo) await kuldo.replaceTrack(sav);
          hivas.stream?.getAudioTracks().forEach(x => x.stop());
          hivas.stream = uj;
          sav.enabled = !hivas.nemit;
        } else await document.querySelector('#hang').setSinkId(e.target.value);
      } catch { hiba(t('notSupported')); }
    });
  }).catch(() => { box.innerHTML = `<p class="hint">${esc(t('notSupported'))}</p>`; });
}

gyoker.addEventListener('submit', async e => {
  e.preventDefault();
  if (e.target.id === 'kezdo') {
    const nev = document.querySelector('#nev').value.trim();
    if (!nev) { hiba(t('badName')); return; }
    if (!window.nostrEszkoz) { hiba(t('unavailable')); return; }
    const { generateSecretKey, getPublicKey } = window.nostrEszkoz;
    const titok = generateSecretKey();
    fiok = { titok: bajtHex(titok), nyilvanos: getPublicKey(titok), nev, kod: kodUj, nyelv, rel };
    ment();
    nez = 'home';
    render();
    kapcsol();
  } else if (e.target.id === 'keres') {
    const kod = document.querySelector('#kod').value.trim().toUpperCase();
    if (kod.length < 4) { hiba(t('invalidCode')); return; }
    try {
      const tal = await kodKeres(kod);
      if (!tal) { hiba(t('unknown')); return; }
      talalat = tal;
      render();
    } catch { hiba(t('unavailable')); }
  }
});

gyoker.addEventListener('click', async e => {
  const g = e.target.closest('[data-action]');
  if (!g) return;
  const a = g.dataset.action;
  if (a === 'masol') { try { await navigator.clipboard.writeText(g.dataset.kod === 'new' ? kodUj : g.dataset.kod); g.textContent = t('copied'); } catch {} }
  if (a === 'beall') { nez = 'settings'; render(); }
  if (a === 'jog') { jog = g.dataset.jog; nyitott = nez; nez = 'legal'; render(); }
  if (a === 'vissza') { nez = fiok ? 'settings' : 'home'; render(); }
  if (a === 'megse') { talalat = null; if (hivas?.irany === 'kimeno') hivasLezar('vege', true); else { nez = 'home'; render(); } }
  if (a === 'hiv' && talalat) { const c = talalat; talalat = null; hiv(c.nyilvanos, c.nev); }
  if (a === 'fogad') await fogad();
  if (a === 'elutasit' && hivas) {
    const adat = { id: hivas.id, peer: hivas.peer };
    let elkuld = true;
    try { await esemeny(adat.id, adat.peer, 'elutasit', { hivas: adat.id }); } catch { elkuld = false; }
    hivasLezar('vege', false);
    if (!elkuld) hiba(t('relayFail'));
  }
  if (a === 'letesz') hivasLezar('vege', true);
  if (a === 'nemit' && hivas) { hivas.nemit = !hivas.nemit; hivas.stream?.getAudioTracks().forEach(x => { x.enabled = !hivas.nemit; }); render(); }
  if (a === 'siket' && hivas) { hivas.siket = !hivas.siket; render(); }
  if (a === 'eszkoz') devices(g.dataset.tipus);
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
  if (a === 'torol1') { nez = 'torol1'; render(); }
  if (a === 'torol2') { nez = 'torol2'; render(); }
  if (a === 'torolmegse') { nez = 'settings'; render(); }
  if (a === 'torolveg') {
    if (document.querySelector('#torolmez')?.value !== 'DELETE') { hiba(t('eraseSecond')); return; }
    localStorage.removeItem(tarolo);
    if (felirat) { try { felirat.close(); } catch {} }
    if (pool && aktivRel.length) pool.close(aktivRel);
    aktivRel = [];
    if (hivas) hivasLezar('vege', false);
    fiok = null; rel = [...alapRel]; nez = 'home'; kapcsol(); render();
  }
});

gyoker.addEventListener('change', e => {
  if (e.target.id === 'nyelv') { nyelv = e.target.value; if (fiok) { fiok.nyelv = nyelv; ment(); } render(); }
});

async function indul() {
  try {
    const n = await import('https://esm.sh/nostr-tools@2.10.4?bundle');
    window.nostrEszkoz = n;
    pool = new n.SimplePool();
  } catch { konyvHiba = true; }
  try {
    fiok = JSON.parse(localStorage.getItem(tarolo) || 'null');
    if (fiok) {
      nyelv = fiok.nyelv === 'hu' ? 'hu' : 'en';
      const regiRel = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'];
      if (JSON.stringify(fiok.rel) === JSON.stringify(regiRel)) { rel = [...alapRel]; fiok.rel = rel; ment(); }
      else rel = Array.isArray(fiok.rel) && fiok.rel.length ? fiok.rel : [...alapRel];
    }
  } catch { fiok = null; }
  if (pool) kapcsol();
  render();
  setInterval(meret, 3000);
  if (fiok && pool) setInterval(profilEsemeny, 12 * 60 * 60 * 1000);
}

indul();