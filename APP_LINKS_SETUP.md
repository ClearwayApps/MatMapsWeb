# MatMaps verified app links

The website deployment generates the two public domain-association files
required for iOS Universal Links and Android App Links. The files are generated
at deployment time so an incorrect placeholder can never be published.

Configure these **GitHub repository variables** in `ClearwayApps/MatMapsWeb`:

- `APPLE_APP_IDENTIFIER_PREFIX`: the 10-character App ID prefix for the
  `com.matmaps.app` identifier (normally the Apple Developer Team ID).
- `ANDROID_APP_LINKS_SHA256`: the SHA-256 fingerprint shown under **Google Play
  Console > Setup > App integrity > App signing key certificate**. Multiple
  fingerprints may be comma-separated during a signing-key transition.

These identifiers are intentionally repository variables, not API secrets:
Apple and Google require them to be publicly served in the association files.
No `.p8`, keystore, password, service account, API key, or signing key belongs
in this repository or in either association file.

The deployment fails before publishing if either value is absent or malformed.
After a live deploy, verify that both URLs return HTTP 200 directly, without a
redirect, and with `Content-Type: application/json`:

- `https://matmaps.co.uk/.well-known/apple-app-site-association`
- `https://matmaps.co.uk/.well-known/assetlinks.json`

Supported links are limited to:

- `/staff-invite?token=...`
- `/posts/{postId}`
- `/clubs/{clubId}`
- `/profiles/{userId}`
