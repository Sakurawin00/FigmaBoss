/**
 * Панель слоёв (справа, под свойствами). Каркас: список фигур в порядке
 * сверху вниз (как в Figma), клик — выделение, повторный клик — снятие.
 */

import type { Shape as ShapeModel, ShapeType } from '../types/shape';

interface LayersPanelProps {
  shapes: readonly ShapeModel[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function LayersPanel({ shapes, selectedId, onSelect }: LayersPanelProps) {
  return (
    <section aria-label="Слои" className="flex-1 overflow-y-auto bg-white p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Слои</h2>

      {shapes.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-neutral-400">
          Пока пусто — выберите инструмент и нарисуйте фигуру на холсте.
        </p>
      ) : (
        <ul className="mt-3 space-y-1">
          {[...shapes].reverse().map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(selectedId === s.id ? null : s.id)}
                aria-pressed={selectedId === s.id}
                className={[
                  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs',
                  selectedId === s.id ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-100',
                ].join(' ')}
              >
                <TypeIcon type={s.type} />
                <span className="truncate">
                  {s.type} · {Math.round(s.width)}×{Math.round(s.height)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TypeIcon({ type }: { type: ShapeType }) {
  if (type === 'ellipse') {
    return <span className="inline-block h-3 w-3 rounded-full border border-current" />;
  }
  return <span className="inline-block h-3 w-3 border border-current" />;
}