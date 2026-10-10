# NostrCall

NostrCall is a browser-based voice calling application. Nostr relays carry signed, encrypted call signaling. WebRTC carries audio and optional files directly between browsers, or through configured TURN servers when both peers enable TURN.

## Live website

The deployed application is available at [zoardgodor.github.io/NostrCall](https://zoardgodor.github.io/NostrCall/). It runs in a current browser without a build step.

## Calls and identity

Create an account with a display name and calling code, then share the code with the person you want to reach. Before creating an account, NostrCall checks whether the code appears in an unexpired signed profile on the configured relays. The directory is decentralized and relay-dependent: this check cannot guarantee global uniqueness or prevent two people from claiming a code at the same time.

Call signaling is encrypted with NIP-44 v2. Incoming events are signature-, sender-, recipient-, age-, and call-context-checked before decryption. A successful call can be saved as a contact after hangup. Saved contacts include the display name, calling code, and public key. If a later profile uses a saved name or code with a different public key, NostrCall blocks the call.

Contacts appear below the main view on narrow screens and in a side panel on desktop. They are stored in IndexedDB. Manual contact creation is not available in Settings.

## File sharing

During a connected call, use the up-arrow button to select a file. NostrCall asks for confirmation before sending. Files are sent over the WebRTC data channel, not through Nostr relays, and are limited to 25 MB. Only one outgoing file may be awaiting download at a time. The sender can send another after the recipient confirms the download; the recipient confirms each download, and a received file can be downloaded only once in that call.

## TURN and direct connections

Direct calls use STUN by default and do not use TURN. Port forwarding is usually unnecessary, but restrictive NATs, firewalls, and some mobile or corporate networks can prevent a direct connection. Without TURN, those peer pairs may not connect.

If direct connection fails, NostrCall opens a troubleshooting guide. Keep both browsers open, confirm the call and microphone permission, check relay connectivity, and try another network or remove VPN/firewall rules that block outbound UDP. Port forwarding is usually not needed. For restrictive NATs, configure a trusted TURN provider on both devices and enable TURN for the call. If the network requires relaying and no TURN service is configured, changing app settings alone cannot make the call connect.

To use TURN, configure up to three TURN server URLs, usernames, and credentials in Settings, then enable **Use TURN for this call** in the call confirmation. The receiving peer must also configure valid TURN credentials. TURN mode uses relay-only ICE candidates, so direct address candidates are not sent to the peer. The TURN operator can still observe connection metadata and charge fees; WebRTC media remains encrypted in transit. NostrCall does not provide TURN servers or credentials.

TURN credentials are stored in this browser and included in identity exports. Only enter credentials from a provider you trust. The provider's own privacy policy and service terms apply.

## Export and import

Settings can export a JSON identity backup containing the private key, account details, contacts, relay settings, and TURN configuration. Select that file on the account creation screen to restore the identity on another browser. The import checks that the private key matches the saved public key.

The export is unencrypted and grants control of the account. Malware on the computer can access browser data or the export file and can call in your name. Never upload the export. The recommended transfer method is offline on a USB drive. Agree on a separate way to verify each other's identity and detect impersonation.

## Storage and privacy

The private key and account data are stored locally in the browser. The private key is used to sign Nostr events and derive encryption keys; it is not intentionally sent to relays. Calling codes, display names, and public keys are published in Nostr profile events. Relay operators may store or redistribute those events.

NostrCall cannot protect a computer from viruses or other malware. Malicious software with access to the computer can read browser storage or exported backups, steal the private key, and initiate calls as the account owner. Protect the device, never upload identity backups, and use offline transfer when moving one.

## Requirements and limitations

Both participants must keep the app open, connect to at least one Nostr relay, and allow microphone access. Calls are not available while the browser is closed; there are no push notifications. Microphone access requires HTTPS or localhost. Browser and network support for WebRTC, Web Crypto, IndexedDB, and media devices is required.

NostrCall is an experimental demo, not an emergency calling service. No call availability, global calling-code uniqueness, or protection against a compromised device is guaranteed.

## Development and checks

The project is static JavaScript with no build step. With Node.js installed, run `npm test` for the security tests and `npm run check` for JavaScript syntax checks. `git diff --check` checks patch whitespace.
