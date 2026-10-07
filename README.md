# NostrCall

NostrCall is a browser-based voice calling application. It uses Nostr relays for signed call signaling and WebRTC for direct peer-to-peer audio.

## Live website

The deployed application is available at:

https://zoardgodor.github.io/NostrCall/

Open the live website in a current browser. No local installation, build step, or local web server is required.

## How it works

- The browser creates a Nostr keypair and stores the private key in IndexedDB.
- New accounts use plaintext key storage by default. Password-protected storage uses PBKDF2-SHA-256 with AES-GCM and keeps the raw key in memory only while the page is open.
- A short calling code is published as a public Nostr profile event with an expiration tag.
- Call requests, answers, ICE candidates, declines, and hangups use NIP-44 v2 encryption.
- Every incoming call event is checked for a valid signature, expected sender, recipient, call ID, message ID, age, and call context before its content is decrypted.
- Call IDs and event IDs are used to reject replay and cross-call confusion.
- Voice is transmitted directly between browsers using WebRTC. Nostr relays do not carry the audio stream.
- The application supports English and Hungarian.

Both callers must have the website open, be connected to at least one relay, and grant microphone permission. The application cannot receive calls while the browser is closed and does not provide push notifications. It does not include a TURN media server.

## Use NostrCall

1. Open the [live website](https://zoardgodor.github.io/NostrCall/).
2. Enter a display name and select **Start**.
3. Share the generated calling code with the person you want to call.
4. The recipient can enter the code in the app and start a call.
5. Use the call controls to mute your microphone, silence incoming audio, or end the call.

The calling code is not a password or a cryptographic secret. The private key is not published to relays, but it is stored in the current browser. Clearing browser storage or deleting the account permanently removes the local key, and there is no key recovery or account synchronization.

## Key storage and migration

- Plaintext storage is available for convenience but is not protected against a compromised browser or XSS.
- Password-protected storage is recommended for browser profiles where local storage is exposed to other users or scripts.
- Password-protected keys are unlocked on startup through the Settings dialog. The raw key is cleared after 15 minutes of inactivity.
- Existing accounts created before the security migration are automatically moved from local storage to IndexedDB without changing their public key.
- No WebAuthn/Passkey implementation is included. A real platform authenticator, credential backup, and recovery workflow would be required before claiming that mode.

## Contacts and identity

Contacts are stored in IndexedDB as public names and public keys. Duplicate names and duplicate public keys are rejected. A saved contact can be used directly to start a call, but the caller still receives a signed profile and verifies the call context before accepting the peer.

## Relays and network requirements

The application uses the default Nostr relays configured in the app. Relay settings can be changed in the Settings dialog. A working network connection is required for the Nostr Tools module, relay connections, and call signaling.

The public calling-code directory is relay-dependent and does not provide guaranteed availability or global uniqueness. A code can be overwritten by another account, and anyone who learns the code can look up its public profile and attempt to call. Choose a display name that does not expose information you want to keep private.

Network firewalls, browser policies, or missing direct media routes may prevent a WebRTC connection. Because this project does not include a TURN media server, some networks may not establish a call. Relay URLs are shown as configured, but the application does not currently expose relay operator provenance beyond the connection status.

## Browser support

Use a current desktop or mobile browser that supports WebRTC, Web Crypto, IndexedDB, and microphone access. Microphone access requires a secure context such as HTTPS or localhost. Audio output selection depends on browser support for `HTMLMediaElement.setSinkId`.

## Security tests

The repository includes Node.js tests for call-context validation, call ID generation, contact normalization, authenticated key encryption, and profile expiration. Run them with `npm test` or `node --test tests/security.test.mjs`. The JavaScript syntax check is available with `npm run check`.

The tests could not be executed in the current Windows environment because Node.js is not installed.

## Privacy and terms

The in-app Privacy Policy and Terms of Service describe the current behavior of the application. NostrCall is an experimental demo, not an emergency calling service. Review the source and the relay operators' policies before using the application.
