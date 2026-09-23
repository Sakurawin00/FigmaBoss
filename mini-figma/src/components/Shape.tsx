/**
 * Рендер одной фигуры (SVG rect / ellipse) и — при выделении — рамки выбора
 * с 8 маркерами вокруг ограничивающего бокса.
 *
 * Фигура живёт в canvas-координатах и масштабируется вместе с холстом.
 * Рамка и маркеры тоже в canvas-координатах, но их размер на экране
 * постоянный: рисуем размер / zoom (zoom передаёт Canvas).
 */

import type { Shape as ShapeModel } from '../types/shape';

/** Базовый цвет новых фигур. */
export const DEFAULT_FILL = '#CBD5E1';

/** Толщина линии рамки/маркеров на экране, px. */
const FRAME_PX = 1.5;
/** Размер маркера на экране, px. */
const HANDLE_PX = 9;
/** Позиции 8 маркеров как доли ширины/высоты бокса (NW, N, NE, E, SE, S, SW, W). */
const HANDLE_POSITIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [1, 0.5],
  [1, 1],
  [0.5, 1],
  [0, 1],
  [0, 0.5],
];

interface ShapeProps {
  shape: ShapeModel;
  /** Показывать ли рамку выделения с маркерами. */
  selected?: boolean;
  /** Текущий зум канваса — для постоянного на экране размера рамки/маркеров. */
  zoom?: number;
}

export function Shape({ shape, selected = false, zoom = 1 }: ShapeProps) {
  // Ещё не доведённые до размера фигуры (draft с нулевой стороной) не рисуем.
  if (shape.width <= 0 || shape.height <= 0) return null;

  const stroke = 'rgb(15 23 42 / 0.4)';

  const body =
    shape.type === 'rectangle' ? (
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={shape.fill}
        stroke={stroke}
        strokeWidth={1}
      />
    ) : (
      <ellipse
        cx={shape.x + shape.width / 2}
        cy={shape.y + shape.height / 2}
        rx={shape.width / 2}
        ry={shape.height / 2}
        fill={shape.fill}
        stroke={stroke}
        strokeWidth={1}
      />
    );

  return (
    <g>
      {body}
      {selected ? <SelectionOverlay shape={shape} zoom={zoom} /> : null}
    </g>
  );
}

/** Рамка выбора: тонкая линия по боксу + 8 маркеров. Чисто визуально (pointer-events off). */
function SelectionOverlay({ shape, zoom }: { shape: ShapeModel; zoom: number }) {
  const frameWidth = FRAME_PX / zoom;
  const handleSize = HANDLE_PX / zoom;

  return (
    <g className="shape-selection" pointerEvents="none">
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill="none"
        stroke="#2563eb"
        strokeWidth={frameWidth}
      />
      {HANDLE_POSITIONS.map(([sx, sy], index) => (
        <rect
          key={index}
          x={shape.x + sx * shape.width - handleSize / 2}
          y={shape.y + sy * shape.height - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={frameWidth}
        />
      ))}
    </g>
  );
}