# NostrCall

A static, browser-based voice calling demo. Nostr relays carry encrypted call signaling; voice travels directly between browsers using WebRTC.

## Run locally

Open `index.html` through a local web server. For example, with Python installed:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`. Microphone access requires a secure context: HTTPS or localhost. The app has no build step and can be published from the repository root with GitHub Pages.

The Nostr Tools module is loaded from esm.sh at runtime, and the interface font is loaded from Google Fonts. A network connection is needed for those resources, Nostr relays, and calls.

## First launch

Enter a display name and select **Start**. The app creates a Nostr keypair in the browser and shows a short, randomly generated calling code. Share that code with the person who should call you. It is not a password or a cryptographic secret.

Your private key is saved in this browser's local storage and is never published to relays. Clearing browser storage or deleting the account permanently removes the local key. There is no key recovery or account synchronization.

## Calls and relays

The short code is published as a public Nostr replaceable event so another online user can resolve it to your public key and display name. Call signaling is sent in NIP-04 encrypted Nostr events. Audio is carried peer-to-peer using WebRTC and is not routed through Nostr relays. The relay list can be edited in Settings.

Both people must have the page open, have a working relay connection, and grant microphone permission. This static site cannot wake a browser, deliver push notifications, or receive calls while closed. Network firewalls may prevent a direct WebRTC connection; this demo does not provide a TURN media server, so some networks will not connect. Browsers must support WebRTC and NIP-04 (the bundled Nostr Tools library does).

The public code directory is relay-dependent and offers no guaranteed availability or global uniqueness. A code can be overwritten by another account, and anyone who learns your code can look up its public profile and attempt to call. Choose a display name that does not expose information you want to keep private.

## Browser support

Use a current desktop or mobile browser with WebRTC, Web Crypto, and microphone support. Input selection is available where the browser exposes audio input devices. Output selection depends on `HTMLMediaElement.setSinkId`; many browsers do not support it. The app lets you mute your microphone and silence incoming audio.

## Privacy and terms

The in-app Privacy Policy and Terms of Service describe the app's current behavior. This project is an experimental demo, not an emergency calling service. No warranty, availability commitment, or legal advice is provided. Review the source and the relay operators' policies before use.

## GitHub Pages

In repository settings, choose **Pages**, select the deployment branch and `/ (root)` folder, then save. No build command or artifact directory is required.
