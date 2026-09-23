/**
 * Собирает приложение из трёх зон интерфейса:
 * Canvas (холст) + Toolbar (слева) + PropertiesPanel и LayersPanel (справа).
 * За логику отвечают хуки: useViewport (камера), useShapes (данные), useHotkeys.
 */

import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LayersPanel } from './components/LayersPanel';
import { useHotkeys } from './hooks/useHotkeys';
import { useShapes } from './hooks/useShapes';
import { useViewport } from './hooks/useViewport';
import type { Shape, ToolId } from './types/shape';

/** Демо-фигуры возле «мирового нуля», чтобы холст не был пустым при старте. */
const DEMO_SHAPES: readonly Shape[] = [
  { id: 'demo-card', type: 'rectangle', x: -260, y: -140, width: 200, height: 130, fill: '#CBD5E1' },
  { id: 'demo-badge', type: 'ellipse', x: 20, y: -150, width: 150, height: 105, fill: '#FDE68A' },
];

export default function App() {
  const viewport = useViewport();
  const shapesStore = useShapes(DEMO_SHAPES);
  const [tool, setTool] = useState<ToolId>('select');
  useHotkeys();

  return (
    <div className="flex h-full w-full overflow-hidden bg-neutral-100 text-neutral-900 selection:bg-blue-200">
      <Toolbar tool={tool} onToolChange={setTool} />

      <main className="relative min-w-0 flex-1">
        <Canvas
          camera={viewport.camera}
          spaceDown={viewport.spaceDown}
          panBy={viewport.panBy}
          zoomBy={viewport.zoomBy}
          centerView={viewport.centerView}
          tool={tool}
          shapes={shapesStore.shapes}
          selectedId={shapesStore.selectedId}
          onSelect={shapesStore.select}
          onAddShape={shapesStore.addShape}
          onMoveShape={shapesStore.moveShape}
        />
      </main>

      <aside aria-label="Панели" className="flex w-60 flex-col border-l border-neutral-200 bg-white">
        <PropertiesPanel
          shape={shapesStore.selected}
          onChangeFill={(fill) => {
            const id = shapesStore.selectedId;
            if (id) shapesStore.updateShape(id, { fill });
          }}
        />
        <LayersPanel
          shapes={shapesStore.shapes}
          selectedId={shapesStore.selectedId}
          onSelect={shapesStore.select}
        />
      </aside>
    </div>
  );
}