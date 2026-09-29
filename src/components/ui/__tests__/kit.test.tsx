import { fireEvent, screen } from '@testing-library/react-native';
import { Button, LoadGate, Segmented, Text } from '@/components/ui';
import { renderWithTheme } from '@/test/renderWithTheme';

describe('Button', () => {
  test('is an accessible button that fires onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button title="ถัดไป" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'ถัดไป' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('ignores presses while loading', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button title="ส่ง" loading onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('LoadGate', () => {
  test('error shows a retry that calls back', async () => {
    const retry = jest.fn();
    await renderWithTheme(
      <LoadGate status="error" retry={retry} skeleton={<Text>sk</Text>}>
        <Text>body</Text>
      </LoadGate>,
    );
    expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeTruthy();
    await fireEvent.press(screen.getByText('ลองอีกครั้ง'));
    expect(retry).toHaveBeenCalled();
    expect(screen.queryByText('body')).toBeNull();
  });

  test('loading shows the skeleton, ready shows content', async () => {
    const retry = jest.fn();
    const view = await renderWithTheme(
      <LoadGate status="loading" retry={retry} skeleton={<Text>sk</Text>}>
        <Text>body</Text>
      </LoadGate>,
    );
    expect(screen.getByText('sk')).toBeTruthy();
    await view.rerender(
      <LoadGate status="ready" retry={retry} skeleton={<Text>sk</Text>}>
        <Text>body</Text>
      </LoadGate>,
    );
    expect(screen.getByText('body')).toBeTruthy();
  });
});

test('Segmented reports the pressed option', async () => {
  const onChange = jest.fn();
  await renderWithTheme(
    <Segmented
      options={[
        { value: 'a', label: 'ก' },
        { value: 'b', label: 'ข' },
      ]}
      value="a"
      onChange={onChange}
    />,
  );
  await fireEvent.press(screen.getByText('ข'));
  expect(onChange).toHaveBeenCalledWith('b');
});
