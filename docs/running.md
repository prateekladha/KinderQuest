# Running KinderQuest Locally

## Prerequisites

- Node.js installed
- Xcode installed for iPhone and iPad Simulator
- Android Studio installed for Android emulator
- `corepack` available

## Install Dependencies

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm install
```

## Run the Mobile App

Start Expo:

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm --filter mobile run start
```

Run directly on iPhone Simulator:

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm --filter mobile run ios
```

Run directly on Android Emulator:

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm --filter mobile run android
```

Run in browser preview:

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm --filter mobile run web
```

## iPad Simulator

The Expo config already enables tablet support.

To test on iPad:

1. Open Xcode Simulator.
2. Choose an iPad device from `File > Open Simulator`.
3. Run:

```bash
COREPACK_HOME=/tmp/corepack corepack pnpm --filter mobile run ios
```

## Notes

- The project uses workspace-local Expo cache and config paths through package scripts.
- The first native iOS run may take a while because Expo generates native build files.
- If the simulator is already open, Expo usually targets the active device.
- For shareable real-device builds, see [distribution.md](/Users/prateek.ladha/git/child_tasks_app/docs/distribution.md).
