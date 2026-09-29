import { screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { lineHeightFor, typeScale, type TypeVariant } from '@/theme/typography';
import { renderWithTheme } from '@/test/renderWithTheme';

const styleOf = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style);

describe('Text', () => {
  test.each(Object.keys(typeScale) as TypeVariant[])('%s is never shorter than its font needs for Thai', async (variant) => {
    await renderWithTheme(<Text variant={variant}>ยินดีต้อนรับกลับ</Text>);
    const s = styleOf('ยินดีต้อนรับกลับ');
    expect(s.lineHeight).toBeGreaterThanOrEqual(lineHeightFor(s.fontSize, s.fontFamily));
  });

  test('a size override takes its own font line, not the variant one', async () => {
    await renderWithTheme(<Text variant="heading" size={18}>โรงเรียนราชดำริ</Text>);
    expect(styleOf('โรงเรียนราชดำริ')).toMatchObject({ fontSize: 18, lineHeight: 30 });
  });

  test('a style line height is raised when too tight and kept when taller', async () => {
    await renderWithTheme(
      <>
        <Text style={{ lineHeight: 12 }}>ที่นี่</Text>
        <Text style={{ lineHeight: 40 }}>ตรงนั้น</Text>
      </>,
    );
    expect(styleOf('ที่นี่').lineHeight).toBe(27);
    expect(styleOf('ตรงนั้น').lineHeight).toBe(40);
  });

  test('mono text with Thai, even split across children, switches to the Thai face and its line', async () => {
    await renderWithTheme(
      <Text variant="data">
        {'รหัส '}
        {24815}
      </Text>,
    );
    expect(styleOf('รหัส 24815')).toMatchObject({ fontFamily: 'IBMPlexSansThai_500Medium', lineHeight: 27 });
  });

  test('Thai in the display face is not tracked; Latin keeps its tracking', async () => {
    await renderWithTheme(
      <>
        <Text variant="display">สวัสดี</Text>
        <Text variant="display">Dschool</Text>
      </>,
    );
    expect(styleOf('สวัสดี').letterSpacing).toBe(0);
    expect(styleOf('Dschool').letterSpacing).toBe(-0.4);
  });

  test('italic gets room at the sides for leaning letters, without moving the layout', async () => {
    await renderWithTheme(<Text variant="displayItalic">ภูมิ</Text>);
    expect(styleOf('ภูมิ')).toMatchObject({ paddingHorizontal: 10, marginHorizontal: -10 });
  });
});
