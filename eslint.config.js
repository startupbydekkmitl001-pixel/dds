// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // motion/ is the HyperFrames video project; .claude/ holds vendored agent skills.
    ignores: ["dist/*", ".claude/**", "motion/**", ".export-check/**"],
  }
]);
