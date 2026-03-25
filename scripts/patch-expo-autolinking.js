const fs = require("fs");
const path = require("path");

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Patch target not found: ${filePath}`);
  }

  let contents = fs.readFileSync(filePath, "utf8");
  let changed = false;

  for (const [from, to] of replacements) {
    if (contents.includes(to)) {
      continue;
    }

    if (!contents.includes(from)) {
      throw new Error(`Expected text not found in ${filePath}:\n${from}`);
    }

    contents = contents.replace(from, to);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, contents, "utf8");
  }
}

function main() {
  const mobileRoot = path.join(process.cwd(), "apps", "mobile");
  const expoPackageJson = require.resolve("expo/package.json", {
    paths: [mobileRoot],
  });
  const expoAutolinkingPackageJson = require.resolve(
    "expo-modules-autolinking/package.json",
    { paths: [path.dirname(expoPackageJson)] }
  );
  const packageRoot = path.dirname(expoAutolinkingPackageJson);

  const resolverJs = path.join(
    packageRoot,
    "build",
    "reactNativeConfig",
    "androidResolver.js"
  );
  const resolverTs = path.join(
    packageRoot,
    "src",
    "reactNativeConfig",
    "androidResolver.ts"
  );

  patchFile(resolverJs, [[
    [
      "    const packageImportPath = reactNativeConfig?.packageImportPath || `import ${packageName}.${nativePackageClassName};`;",
      "    const packageInstance = reactNativeConfig?.packageInstance || `new ${nativePackageClassName}()`;",
    ].join("\n"),
    [
      "    const isExpoPackage = packageJson.name === 'expo';",
      "    const packageImportPath =",
      "        reactNativeConfig?.packageImportPath ||",
      "            (isExpoPackage",
      "                ? 'import expo.modules.ExpoModulesPackage;'",
      "                : `import ${packageName}.${nativePackageClassName};`);",
      "    const packageInstance =",
      "        reactNativeConfig?.packageInstance ||",
      "            (isExpoPackage ? 'new ExpoModulesPackage()' : `new ${nativePackageClassName}()`);",
    ].join("\n"),
  ]]);

  patchFile(resolverTs, [[
    [
      "  const packageImportPath =",
      "    reactNativeConfig?.packageImportPath || `import ${packageName}.${nativePackageClassName};`;",
      "  const packageInstance = reactNativeConfig?.packageInstance || `new ${nativePackageClassName}()`;",
    ].join("\n"),
    [
      "  const isExpoPackage = packageJson.name === 'expo';",
      "  const packageImportPath =",
      "    reactNativeConfig?.packageImportPath ||",
      "    (isExpoPackage",
      "      ? 'import expo.modules.ExpoModulesPackage;'",
      "      : `import ${packageName}.${nativePackageClassName};`);",
      "  const packageInstance =",
      "    reactNativeConfig?.packageInstance ||",
      "    (isExpoPackage ? 'new ExpoModulesPackage()' : `new ${nativePackageClassName}()`);",
    ].join("\n"),
  ]]);

  console.log("Patched expo-modules-autolinking Android resolver for Expo SDK 53.");
}

main();
