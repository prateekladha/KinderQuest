# Sharing KinderQuest Builds

## Prerequisites

- Apple Developer account for iPhone distribution
- Google Play Developer account for Android distribution
- Expo account with EAS access
- Supabase production project configured in `apps/mobile/.env`

## One-Time Setup

From the repo root:

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm install
```

Then move into the Expo app directory:

```bash
cd apps/mobile
```

Log in to Expo:

```bash
npx eas-cli login
```

Initialize the EAS project once:

```bash
npx eas-cli init
```

That command writes the Expo project id back into the app config. Keep it pointed at the same project for all future builds.

## Internal Test Builds

### iPhone

Build an internal iOS binary:

```bash
npx eas-cli build --platform ios --profile preview
```

After the build finishes:

- open the EAS build link
- install the build on a real iPhone
- or distribute through TestFlight if you want broader beta testing

### Android

Build an internal Android binary:

```bash
npx eas-cli build --platform android --profile preview
```

After the build finishes:

- download the generated APK/AAB from the EAS build page
- install it on a real Android device
- or upload to Google Play Internal Testing

## Development Builds For Real Device Testing

Use these when you still need native debug tooling:

```bash
npx eas-cli build --platform ios --profile development
npx eas-cli build --platform android --profile development
```

## Production Release Builds

When you are ready for store submission:

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli build --platform android --profile production
```

Then submit through:

- App Store Connect / TestFlight for iPhone
- Google Play Console for Android

## Push Notification Testing

Use a real device, not the simulator.

Before testing push:

1. Apply the `push_tokens` migration in Supabase
2. Deploy the `send-push` edge function
3. Add native Firebase client config files to `apps/mobile/`
4. Ensure Expo/EAS has delivery credentials configured
5. Sign in on a real device
6. Allow notifications
7. Verify `public.push_tokens` contains a row for that user

### Native Firebase Client Files

Both files are required if you want push registration to work on both platforms:

- `apps/mobile/google-services.json` for Android
- `apps/mobile/GoogleService-Info.plist` for iOS

These are referenced from Expo config in `apps/mobile/app.config.js` and should not be committed to git.

For EAS Build, store them as file environment variables because git-ignored files are not uploaded with the build:

```bash
cd apps/mobile
npx eas-cli env:create --environment preview --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
npx eas-cli env:create --environment preview --name GOOGLE_SERVICE_INFO_PLIST --type file --value ./GoogleService-Info.plist
```

Then rebuild with the same environment.

### Delivery Credentials

- Android: configure FCM for the Expo project used by EAS
- iOS: configure Apple Push Notification credentials for the app identifier used by EAS

Without the native client files, token creation fails on-device.
Without the delivery credentials, token creation may succeed but notification delivery will fail.

## Notes

- `preview` is the right profile for sharing working builds with testers.
- `development` is the right profile for real-device debugging.
- `production` is for store-ready binaries only.
