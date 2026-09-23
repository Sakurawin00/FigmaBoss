/**
 * Чистая математика без DOM и без React: пересчёт координат между
 * экраном и канвасом с учётом зума/панорамы, зум с фокусом на курсоре,
 * нормализация бокса при рисовании и hit-тест фигур.
 */

import type { Camera, Point, Shape } from '../types/shape';

/** Границы зума: 10% — минимум, 400% — максимум. */
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;

/** Ограничивает зум допустимым диапазоном. */
export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

/** Пиксель вьюпорта → координаты канваса (учитывая панораму и зум). */
export function clientToCanvas(client: Point, camera: Camera): Point {
  return {
    x: (client.x - camera.x) / camera.zoom,
    y: (client.y - camera.y) / camera.zoom,
  };
}

/**
 * Шаг зума с фокусом на курсоре: точка канваса, на которую смотрит
 * курсор, после масштабирования остаётся ровно под ним.
 */
export function zoomAt(client: Point, factor: number, camera: Camera): Camera {
  const nextZoom = clampZoom(camera.zoom * factor);
  const anchor = clientToCanvas(client, camera);
  return {
    zoom: nextZoom,
    x: client.x - anchor.x * nextZoom,
    y: client.y - anchor.y * nextZoom,
  };
}

/**
 * Нормализация drag-прямоугольника: из двух точек с любым направлением
 * перетаскивания строит корректный бокс (положительные ширина и высота).
 */
export function normalizeBox(
  a: Point,
  b: Point,
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

/** Попадает ли точка в фигуру. Прямоугольник — по границам, эллипс — по каноническому уравнению. */
export function hitTest(shape: Shape, point: Point): boolean {
  if (shape.type === 'rectangle') {
    return (
      point.x >= shape.x &&
      point.x <= shape.x + shape.width &&
      point.y >= shape.y &&
      point.y <= shape.y + shape.height
    );
  }

  const rx = shape.width / 2;
  const ry = shape.height / 2;
  const dx = (point.x - (shape.x + rx)) / rx;
  const dy = (point.y - (shape.y + ry)) / ry;
  return dx * dx + dy * dy <= 1;
}

/**
 * Hit-тест «с рамкой выбора»: точная геометрия + зона вокруг периметра
 * ограничивающего бокса. Точность — tolerance в canvas-единицах (обычно
 * несколько экранных пикселей, делённых на zoom). Нужно, чтобы клик по
 * маркерам/рамке (например, по углам бокса эллипса, где геометрии нет)
 * тоже выделял фигуру.
 */
export function hitTestShapeOrFrame(shape: Shape, point: Point, tolerance: number): boolean {
  if (hitTest(shape, point)) return true;

  const left = shape.x - tolerance;
  const right = shape.x + shape.width + tolerance;
  const top = shape.y - tolerance;
  const bottom = shape.y + shape.height + tolerance;
  if (point.x < left || point.x > right || point.y < top || point.y > bottom) return false;

  // Точка всё же внутри «сжатого» ядра бокса — это не рамка (и для
  // прямоугольника такая точка уже поймалась точной геометрией выше).
  const coreLeft = shape.x + tolerance;
  const coreRight = shape.x + shape.width - tolerance;
  const coreTop = shape.y + tolerance;
  const coreBottom = shape.y + shape.height - tolerance;
  const inCore =
    point.x > coreLeft && point.x < coreRight && point.y > coreTop && point.y < coreBottom;
  return !inCore;
}