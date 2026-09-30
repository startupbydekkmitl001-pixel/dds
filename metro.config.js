// https://docs.expo.dev/guides/customizing-metro/
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// motion/ holds the video projects (HyperFrames, and Remotion with its own node_modules); the app
// only uses their rendered files in assets/. Anchored to this folder, because src/components/motion
// is app code.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const videoProjects = new RegExp(`^${escape(path.resolve(__dirname, 'motion'))}[\\\\/].*`);
const existing = config.resolver.blockList;
config.resolver.blockList = [...(Array.isArray(existing) ? existing : existing ? [existing] : []), videoProjects];

module.exports = config;
