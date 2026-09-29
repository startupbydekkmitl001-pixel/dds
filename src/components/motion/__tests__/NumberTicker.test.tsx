import { render, screen } from '@testing-library/react-native';
import { NumberTicker } from '@/components/motion/NumberTicker';
import { formatBaht } from '@/lib/format';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated'),
  useReducedMotion: () => true,
}));

test('with Reduce Motion on, the final value renders immediately', async () => {
  await render(<NumberTicker value={1245} from={0} format={formatBaht} />);
  expect(screen.getByText('฿1,245')).toBeTruthy();
});
