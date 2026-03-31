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
  platforms: ["ios", "android"],
  version: "1.0.0",
  jsEngine: "jsc",
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: "https://u.expo.dev/62e488c9-bc56-4d6f-a04c-3289c17c23d1"
  },
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#F7F1DF"
  },
  orientation: "default",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.prateekladha.kinderquest",
    buildNumber: "1",
    ...(iosGoogleServicesFile ? { googleServicesFile: iosGoogleServicesFile } : {})
  },
  android: {
    package: "com.prateekladha.kinderquest",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F7F1DF"
    },
    ...(androidGoogleServicesFile ? { googleServicesFile: androidGoogleServicesFile } : {})
  },
  plugins: [
    "expo-router",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        image: "./assets/icon.png",
        resizeMode: "contain",
        backgroundColor: "#F7F1DF"
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: "62e488c9-bc56-4d6f-a04c-3289c17c23d1"
    }
  }
};
