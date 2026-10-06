# NostrCall

NostrCall is a browser-based voice calling application. It uses Nostr relays for encrypted call signaling and WebRTC for direct peer-to-peer audio.

## Live website

The deployed application is available at:

https://zoardgodor.github.io/NostrCall/

Open the live website in a current browser. No local installation, build step, or local web server is required.

## How it works

- The browser creates a Nostr keypair and stores the private key in local browser storage.
- A short calling code is published as a public Nostr profile event.
- Call requests, answers, ICE candidates, declines, and hangups are sent as encrypted NIP-04 events.
- Voice is transmitted directly between browsers using WebRTC. Nostr relays do not carry the audio stream.
- The application supports English and Hungarian.

Both callers must have the website open, be connected to at least one relay, and grant microphone permission. The site cannot receive calls while the browser is closed and does not provide push notifications or a TURN server.

## Use NostrCall

1. Open the [live website](https://zoardgodor.github.io/NostrCall/).
2. Enter a display name and select **Start**.
3. Share the generated calling code with the person you want to call.
4. The recipient can enter the code in the app and start a call.
5. Use the call controls to mute your microphone, silence incoming audio, or end the call.

The calling code is not a password or a cryptographic secret. The private key is not published to relays, but it is stored in the current browser. Clearing browser storage or deleting the account permanently removes the local key, and there is no key recovery or account synchronization.

## Relays and network requirements

The application uses the default Nostr relays configured in the app. Relay settings can be changed in the Settings dialog. A working network connection is required for the Nostr Tools module, external fonts, relay connections, and call signaling.

The public calling-code directory is relay-dependent and does not provide guaranteed availability or global uniqueness. A code can be overwritten by another account, and anyone who learns the code can look up its public profile and attempt to call. Choose a display name that does not expose information you want to keep private.

Network firewalls or browser policies may prevent a direct WebRTC connection. Because this project does not include a TURN media server, some networks may not establish a call.

## Browser support

Use a current desktop or mobile browser that supports WebRTC, Web Crypto, and microphone access. Microphone access requires a secure context such as HTTPS or localhost. Audio output selection depends on browser support for `HTMLMediaElement.setSinkId`.

## Privacy and terms

The in-app Privacy Policy and Terms of Service describe the current behavior of the application. NostrCall is an experimental demo, not an emergency calling service. Review the source and the relay operators' policies before using the application.
