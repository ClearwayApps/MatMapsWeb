import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const applePrefix = String(process.env.APPLE_APP_IDENTIFIER_PREFIX || '').trim();
const androidFingerprints = String(process.env.ANDROID_APP_LINKS_SHA256 || '')
  .split(/[\n,]+/)
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);

if (!/^[A-Z0-9]{10}$/.test(applePrefix)) {
  throw new Error(
    'APPLE_APP_IDENTIFIER_PREFIX must be the 10-character Apple App ID prefix (normally the Team ID).',
  );
}

const fingerprintPattern = /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/;
if (androidFingerprints.length === 0 ||
    androidFingerprints.some((value) => !fingerprintPattern.test(value))) {
  throw new Error(
    'ANDROID_APP_LINKS_SHA256 must contain the Google Play app-signing SHA-256 fingerprint. Separate multiple fingerprints with commas.',
  );
}

const aasa = {
  applinks: {
    apps: [],
    details: [
      {
        appID: `${applePrefix}.com.matmaps.app`,
        components: [
          {'/': '/staff-invite', comment: 'One-time club staff invitations'},
          {'/': '/posts/*', comment: 'Shared Arena and Travelling Hub posts'},
          {'/': '/clubs/*', comment: 'Shared club pages'},
          {'/': '/profiles/*', comment: 'Shared member profiles'},
        ],
      },
    ],
  },
};

const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.matmaps.app',
      sha256_cert_fingerprints: androidFingerprints,
    },
  },
];

// Firebase Hosting internally rewrites the standards-mandated .well-known
// URLs to these generated files. This lets the existing hidden-file ignore
// rule remain in place and avoids publishing unrelated dot-directories.
const outputDirectory = resolve('public', 'app-links');
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    resolve(outputDirectory, 'apple-app-site-association'),
    `${JSON.stringify(aasa, null, 2)}\n`,
    'utf8',
  ),
  writeFile(
    resolve(outputDirectory, 'assetlinks.json'),
    `${JSON.stringify(assetLinks, null, 2)}\n`,
    'utf8',
  ),
]);

console.log('Prepared verified iOS Universal Link and Android App Link files.');
