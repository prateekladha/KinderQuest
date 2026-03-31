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

Before your first iOS build, make sure these Apple-side items exist:

- the paid Apple Developer Program is active for your Apple ID
- an App Store Connect app exists for bundle id `com.prateekladha.kinderquest`
- you can sign in to App Store Connect from EAS when prompted

Build an internal iOS binary for device testing:

```bash
cd apps/mobile
pnpm run eas:build:ios:preview
```

After the build finishes:

- open the EAS build link
- install it on registered devices if EAS created an ad hoc build
- or distribute it through TestFlight for broader beta testing

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
cd apps/mobile
npx eas-cli build --platform ios --profile development
npx eas-cli build --platform android --profile development
```

## Production Release Builds

When you are ready for TestFlight or App Store submission:

```bash
cd apps/mobile
pnpm run eas:build:ios:production
```

After the iOS production build succeeds, submit it to App Store Connect:

```bash
cd apps/mobile
pnpm run eas:submit:ios
```

If this is the first iOS submission for the app, App Store Connect will still require manual setup for:

- app privacy answers
- screenshots
- age rating
- pricing and availability
- TestFlight tester groups or App Review metadata

Android store build:

```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
```

Then submit through:

- TestFlight / App Store Connect for iPhone
- Google Play Console for Android

## iOS First-Time Credential Flow

The first time you run an iOS EAS build, EAS will usually ask to:

1. log in to your Expo account
2. log in to your Apple Developer account
3. create or reuse the iOS distribution certificate
4. create or reuse the provisioning profile

Recommended choice: let EAS manage the iOS credentials unless you already maintain them manually.

Useful checks before building:

```bash
cd apps/mobile
npx eas-cli credentials -p ios
npx eas-cli build:configure
```

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

If you change the app identifier or bundle id, regenerate both Firebase files for the new app ids before rebuilding.

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
