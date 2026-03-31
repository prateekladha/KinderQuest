# KinderQuest Build Handoff

## Current Status

- Expo / EAS project is already configured for the mobile app.
- Apple Developer membership is active.
- App Store Connect app creation is in progress for iOS distribution.
- Google Play Console account exists, but the account is still under review, so Android store testing is paused.

## Current App Identifiers

Use the same identifier on both platforms:

- iOS bundle id: `com.prateekladha.kinderquest`
- Android package name: `com.prateekladha.kinderquest`

These are configured in:

- `apps/mobile/app.config.js`
- `apps/mobile/app.json`

## Why The Identifier Changed

The original identifier `com.kinderquest.app` could not be used for iOS because Apple returned:

- "The bundle identifier com.kinderquest.app is not available to team 'Prateek Ladha (Individual)'"

To keep iOS and Android aligned, the app identifier was switched to `com.prateekladha.kinderquest`.

## iOS / TestFlight Next Steps

### App Store Connect

Create or finish creating the App Store Connect app with:

- app name: `KinderQuest`
- bundle id: `com.prateekladha.kinderquest`
- SKU: any unique internal string such as `kinderquest-ios-001`

### Firebase

In the existing Firebase project:

1. Add an iOS app with bundle id `com.prateekladha.kinderquest`
2. Download `GoogleService-Info.plist`
3. Place it in `apps/mobile/GoogleService-Info.plist`

If using EAS file environment variables, upload it:

```bash
cd apps/mobile
npx eas-cli env:create --environment production --name GOOGLE_SERVICE_INFO_PLIST --type file --value ./GoogleService-Info.plist
```

If the variable already exists for an old file, replace it before rebuilding.

### Build And Submit

From `apps/mobile`:

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

After submission:

- open App Store Connect
- go to TestFlight
- wait for Apple processing
- add internal testers

## Android Status

Android internal/store testing is blocked for now only because the Google Play account is under review.

Once Google Play access is active:

### Firebase

1. Add an Android app in Firebase with package name `com.prateekladha.kinderquest`
2. Download `google-services.json`
3. Place it in `apps/mobile/google-services.json`

If using EAS file environment variables, upload it:

```bash
cd apps/mobile
npx eas-cli env:create --environment production --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
```

### Android Build Options

For direct EAS internal distribution:

```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview
```

For Google Play Internal Testing:

```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
```

Upload the resulting `.aab` to Google Play Console under:

- `Testing` -> `Internal testing`

## Known Important Notes

- Old Firebase config files for `com.kinderquest.app` will not work anymore.
- Both Firebase native config files must match `com.prateekladha.kinderquest`.
- `GoogleService-Info.plist` and `google-services.json` should not be committed to git.
- EAS can manage Apple certificates and provisioning automatically during iOS builds.

## Useful Files

- `apps/mobile/app.config.js`
- `apps/mobile/app.json`
- `apps/mobile/eas.json`
- `docs/distribution.md`
