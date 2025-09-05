import type { BlockType } from './types';
import { config } from './types';
import { PaletteItem } from './PaletteItem';

export function BlockList() {
  const types = Object.keys(config.blocks) as BlockType[];
  return (
    <div style={{ width: 180, borderRight: "1px solid #ddd", padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Blocks</div>
      {types.map((t) => (
        <PaletteItem key={t} type={t} />
      ))}
    </div>
  );
}