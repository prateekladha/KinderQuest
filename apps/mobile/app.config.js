const fs = require("fs");
const path = require("path");

const projectRoot = __dirname;

function resolveFile(envName, fallbackRelativePath) {
  const envValue = process.env[envName];
  if (typeof envValue === "string" && envValue.length > 0) {
    return envValue;
  }

  const fallbackPath = path.join(projectRoot, fallbackRelativePath);
  if (fs.existsSync(fallbackPath)) {
    return fallbackRelativePath;
  }

  return undefined;
}

const androidGoogleServicesFile = resolveFile("GOOGLE_SERVICES_JSON", "./google-services.json");
const iosGoogleServicesFile = resolveFile("GOOGLE_SERVICE_INFO_PLIST", "./GoogleService-Info.plist");

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  name: "KinderQuest",
  slug: "kinderquest",
  scheme: "kinderquest",
  version: "1.0.0",
  runtimeVersion: {
    policy: "appVersion"
  },
  icon: "./assets/icon.png",
  orientation: "default",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.kinderquest.app",
    buildNumber: "1",
    ...(iosGoogleServicesFile ? { googleServicesFile: iosGoogleServicesFile } : {})
  },
  android: {
    package: "com.kinderquest.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F7F1DF"
    },
    ...(androidGoogleServicesFile ? { googleServicesFile: androidGoogleServicesFile } : {})
  },
  plugins: ["expo-router", "expo-notifications"],
  web: {
    bundler: "metro"
  },
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: "62e488c9-bc56-4d6f-a04c-3289c17c23d1"
    }
  }
};
