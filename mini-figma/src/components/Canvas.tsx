/**
 * Холст на весь экран: сетка на фоне, панорамирование (пробел + мышь,
 * а также средней кнопкой), зум колесом, рисование фигур выбранным
 * инструментом, а в режиме select — выделение кликом и перетаскивание
 * выбранной фигуры.
 *
 * Мышечные события и статус драга живут здесь (интерфейс), а вся
 * математика делегируется: координаты — utils/geometry (учёт зума и
 * панорамы), состояние фигур и их перемещение — useShapes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Camera, Point, Shape as ShapeModel, ToolId } from '../types/shape';
import { clientToCanvas, hitTestShapeOrFrame, normalizeBox } from '../utils/geometry';
import { DEFAULT_FILL, Shape } from './Shape';

/** Слой-сетки и SVG должен покрывать область вокруг «мирового нуля». */
const WORLD_SIZE = 20_000;
/** Чувствительность колеса: экспоненциальный шаг зума на пиксель скролла. */
const ZOOM_SENSITIVITY = 0.0015;
/** Насколько близко к рамке выбора клик засчитывается (в px экрана). */
const SELECT_TOLERANCE_PX = 8;

/** Активный драг перетаскивания фигуры (всё в canvas-координатах). */
interface DragState {
  shapeId: string;
  /** Точка захвата в момент pointerdown. */
  start: Point;
  /** Позиция фигуры в момент захвата — дельта добавляется к ней. */
  origin: { x: number; y: number };
}

interface CanvasProps {
  camera: Camera;
  spaceDown: boolean;
  panBy: (dx: number, dy: number) => void;
  zoomBy: (client: Point, factor: number) => void;
  centerView: (width: number, height: number) => void;
  tool: ToolId;
  shapes: readonly ShapeModel[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddShape: (shape: ShapeModel) => void;
  /** Перемещение фигуры в абсолютную позицию (canvas-координаты). */
  onMoveShape: (id: string, x: number, y: number) => void;
}

/** Перетаскиваемый «черновик» новой фигуры в координатах канваса. */
interface Draft {
  origin: Point;
  shape: ShapeModel;
}

export function Canvas({
  camera,
  spaceDown,
  panBy,
  zoomBy,
  centerView,
  tool,
  shapes,
  selectedId,
  onSelect,
  onAddShape,
  onMoveShape,
}: CanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<Point | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // При старте центрируем «мировой нуль» в центре холста.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    centerView(el.clientWidth, el.clientHeight);
  }, [centerView]);

  // Колесо зума вешаем нативно с passive: false, чтобы был доступ к preventDefault.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomBy({ x: event.clientX, y: event.clientY }, Math.exp(-event.deltaY * ZOOM_SENSITIVITY));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  /** Пиксели экрана внутри холста → координаты канваса (пан + зум). */
  const toCanvas = useCallback(
    (client: Point): Point => {
      const el = rootRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return clientToCanvas({ x: client.x - rect.left, y: client.y - rect.top }, camera);
    },
    [camera],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = event.currentTarget;

    // Панорамирование: пробел зажат или средняя кнопка мыши.
    if (spaceDown || event.button === 1) {
      panRef.current = { x: event.clientX, y: event.clientY };
      el.setPointerCapture(event.pointerId);
      return;
    }
    if (event.button !== 0) return;

    const point = toCanvas({ x: event.clientX, y: event.clientY });

    // Инструмент «выбор»: hit-тест с учётом рамки, выделение и захват для драга.
    if (tool === 'select') {
      const tolerance = SELECT_TOLERANCE_PX / camera.zoom;
      const hit = [...shapes].reverse().find((s) => hitTestShapeOrFrame(s, point, tolerance));
      if (hit) {
        onSelect(hit.id);
        dragRef.current = {
          shapeId: hit.id,
          start: point,
          origin: { x: hit.x, y: hit.y },
        };
        el.setPointerCapture(event.pointerId);
      } else {
        onSelect(null);
      }
      return;
    }

    // Рисование (rectangle / ellipse): запоминаем старт и заводим черновик.
    setDraft({
      origin: point,
      shape: {
        id: createId(),
        type: tool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        fill: DEFAULT_FILL,
      },
    });
    el.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Пан: дельта в экранных пикселях.
    if (panRef.current) {
      panBy(event.clientX - panRef.current.x, event.clientY - panRef.current.y);
      panRef.current = { x: event.clientX, y: event.clientY };
      return;
    }

    // Перетаскивание выделенной фигуры: дельта в canvas-координатах
    // (обе точки считаются через geometry с учётом зума и панорамы).
    if (dragRef.current) {
      const current = toCanvas({ x: event.clientX, y: event.clientY });
      onMoveShape(
        dragRef.current.shapeId,
        dragRef.current.origin.x + (current.x - dragRef.current.start.x),
        dragRef.current.origin.y + (current.y - dragRef.current.start.y),
      );
      return;
    }

    // Рисование: растягиваем черновик до текущей точки.
    if (draft) {
      const current = toCanvas({ x: event.clientX, y: event.clientY });
      const box = normalizeBox(draft.origin, current);
      setDraft((prev) => (prev ? { ...prev, shape: { ...prev.shape, ...box } } : prev));
      return;
    }

    // Hover-индикация курсора в режиме select (над фигурой — «move»).
    if (tool === 'select' && !spaceDown) {
      const point = toCanvas({ x: event.clientX, y: event.clientY });
      const tolerance = SELECT_TOLERANCE_PX / camera.zoom;
      const hitId =
        [...shapes].reverse().find((s) => hitTestShapeOrFrame(s, point, tolerance))?.id ?? null;
      setHoverId((prev) => (prev === hitId ? prev : hitId));
    }
  };

  const handlePointerUp = () => {
    if (panRef.current) {
      panRef.current = null;
      return;
    }
    if (dragRef.current) {
      dragRef.current = null;
      return;
    }
    if (draft) {
      const shape = draft.shape;
      setDraft(null);
      // Отбрасываем случайный «клик» без перетаскивания.
      if (shape.width >= 2 && shape.height >= 2) onAddShape(shape);
    }
  };

  const panning = panRef.current !== null;
  const moving = dragRef.current !== null;
  const cursor = panning
    ? 'cursor-grabbing'
    : spaceDown
      ? 'cursor-grab'
      : tool === 'select'
        ? moving || hoverId
          ? 'cursor-move'
          : 'cursor-default'
        : 'cursor-crosshair';

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full select-none overflow-hidden bg-neutral-100 ${cursor}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Холст для рисования"
    >
      {/* Камера: translate → сдвиг, ниже scale → зум. Мир привязан к point (0,0). */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}
      >
        <div
          className="absolute left-0 top-0"
          style={{ transform: `scale(${camera.zoom})`, transformOrigin: '0 0' }}
        >
          <div className="grid-canvas absolute left-0 top-0" style={{ width: WORLD_SIZE, height: WORLD_SIZE }} />
          <svg
            className="absolute left-0 top-0 overflow-visible"
            width={WORLD_SIZE}
            height={WORLD_SIZE}
            aria-label="Фигуры"
          >
            {shapes.map((shape) => (
              <Shape
                key={shape.id}
                shape={shape}
                selected={shape.id === selectedId}
                zoom={camera.zoom}
              />
            ))}
            {draft ? <Shape shape={draft.shape} zoom={camera.zoom} /> : null}
          </svg>
        </div>
      </div>

      {/* Подсказки поверх холста — не перехватывают клики. */}
      <div className="pointer-events-none absolute bottom-4 left-4 hidden text-[11px] text-neutral-400 sm:block">
        Пробел + драг — панорама · Колесо — зум · Драг фигуры — перемещение
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-md border border-neutral-200 bg-white/90 px-2 py-1 text-[11px] font-medium text-neutral-500">
        {Math.round(camera.zoom * 100)}%
      </div>
    </div>
  );
}

/** Уникальный id фигуры (crypto.randomUUID с запасным вариантом). */
function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `shape-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}