import { setUpTests } from 'react-native-reanimated';

setUpTests();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// expo-video needs its native module, which Jest doesn't have. Screens that play video test
// against a more specific mock in their own file.
jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (_source: unknown, setup?: (p: object) => void) => {
      const [player] = React.useState(() => {
        const p = { muted: false, loop: false, play: jest.fn(), pause: jest.fn(), replay: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) };
        setup?.(p);
        return p;
      });
      return player;
    },
    VideoView: (props: object) => React.createElement(View, props),
  };
});
