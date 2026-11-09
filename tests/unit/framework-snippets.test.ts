import { describe, expect, it } from 'vitest';
import {
  parseExampleProps,
  toElementTag,
  toScopedPackage,
} from '../../src/pages/playground/framework-snippets';

describe('framework-snippets parseExampleProps', () => {
  it('parses Turntable prizes and numeric props from demo JSX', () => {
    const code = `import { Turntable } from 'cos-design';

const prizes = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];

<Turntable prizes={prizes} size={320} targetIndex={1} spinDuration={1200} />`;
    const props = parseExampleProps('Turntable', code);
    expect(props.size).toBe(320);
    expect(props.targetIndex).toBe(1);
    expect(props.spinDuration).toBe(1200);
    expect(Array.isArray(props.prizes)).toBe(true);
    expect((props.prizes as { label: string }[]).length).toBe(3);
  });

  it('parses boolean and string attrs on ScratchCard', () => {
    const code = `<ScratchCard prize="50% OFF" width={280} height={160} coverText="刮开" />`;
    const props = parseExampleProps('ScratchCard', code);
    expect(props.prize).toBe('50% OFF');
    expect(props.width).toBe(280);
    expect(props.height).toBe(160);
    expect(props.coverText).toBe('刮开');
  });

  it('maps export names to element tag and scoped package', () => {
    expect(toElementTag('NineGrid')).toBe('cos-nine-grid');
    expect(toScopedPackage('ScratchCard')).toBe('@cos-design/scratch-card');
  });
});
