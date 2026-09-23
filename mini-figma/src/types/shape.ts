/**
 * Единый язык проекта: все слои говорят об одних и тех же сущностях —
 * Shape, Tool, координаты. TypeScript ловит ошибки до запуска.
 */

/** Инструмент панели слева. V — выбор, R — прямоугольник, O — эллипс. */
export type ToolId = 'select' | 'rectangle' | 'ellipse';

/** Описание инструмента из src/constants/tools.ts. */
export interface Tool {
  id: ToolId;
  /** Человекочитаемое имя для подсказки. */
  label: string;
  /** Буквенная клавиша быстрого вызова: v / r / o. */
  key: string;
  /** Короткое описание для tooltip. */
  description: string;
}

/** Точка в координатах канваса (до применения зума и панорамы). */
export interface Point {
  x: number;
  y: number;
}

/** Вид фигуры: прямоугольник или эллипс. */
export type ShapeType = 'rectangle' | 'ellipse';

/**
 * Фигура на холсте. x/y — левый верхний угол ограничивающего бокса
 * (для эллипса — углы описывающего его прямоугольника).
 */
export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

/**
 * Камера (вьюпорт): сдвиг в пикселях экрана и зум.
 * Экранная точка = (canvas.x * zoom + camera.x, canvas.y * zoom + camera.y).
 */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}