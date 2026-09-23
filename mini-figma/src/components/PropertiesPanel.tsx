/**
 * Панель свойств (справа). При выделенной фигуре показывает её тип,
 * координаты и размеры, а также позволяет менять цвет заливки:
 * нативный колорпикер + быстрые образцы.
 *
 * Панель остаётся презентационной: новый цвет уходит наверх через
 * onChangeFill → useShapes.updateShape.
 */

import type { Shape as ShapeModel } from '../types/shape';

/** Быстрые образцы заливки. */
const QUICK_FILLS: readonly string[] = [
  '#CBD5E1', '#FDE68A', '#86EFAC', '#93C5FD',
  '#FCA5A5', '#D8B4FE', '#F472B6', '#1E293B',
];

interface PropertiesPanelProps {
  shape: ShapeModel | null;
  /** Вызывается с новым цветом заливки выбранной фигуры. */
  onChangeFill: (fill: string) => void;
}

export function PropertiesPanel({ shape, onChangeFill }: PropertiesPanelProps) {
  return (
    <section aria-label="Свойства" className="border-b border-neutral-200 bg-white p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        Свойства
      </h2>

      {shape ? (
        <>
          {/* Заливка — единственное редактируемое свойство на этом шаге. */}
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Заливка</span>
              <span className="font-mono text-[10px] text-neutral-400">{shape.fill}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label
                className="relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-neutral-200 shadow-sm"
                title="Открыть палитру"
              >
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundColor: shape.fill }}
                />
                <input
                  type="color"
                  value={shape.fill}
                  onChange={(event) => onChangeFill(event.target.value)}
                  aria-label="Цвет заливки"
                  className="h-full w-full cursor-pointer appearance-none opacity-0"
                />
              </label>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_FILLS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Заливка ${color}`}
                    title={color}
                    onClick={() => onChangeFill(color)}
                    className={[
                      'h-5 w-5 rounded border',
                      shape.fill === color
                        ? 'border-blue-600 ring-2 ring-blue-600/30'
                        : 'border-neutral-200 hover:border-neutral-400',
                    ].join(' ')}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Остальные свойства — только чтение, редактирование в следующих шагах. */}
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <Field label="Тип" value={shape.type} />
            <Field label="X" value={String(Math.round(shape.x))} />
            <Field label="Y" value={String(Math.round(shape.y))} />
            <Field label="Ширина" value={String(Math.round(shape.width))} />
            <Field label="Высота" value={String(Math.round(shape.height))} />
          </dl>
        </>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-neutral-400">
          Выберите фигуру на холсте — здесь появятся её свойства и цвет.
        </p>
      )}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="font-mono text-neutral-700">{value}</dd>
    </div>
  );
}