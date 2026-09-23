/**
 * Состояние фигур: список, добавление, изменение, выделение, перемещение.
 * Хук не знает про интерфейс — компоненты зовут addShape/updateShape/select.
 *
 * Координаты всегда в canvas-единицах. Их вычисляет Canvas через
 * utils/geometry (учёт зума и панорамы), а хук применяет результат:
 *  - фигуры из драга приходят через addShape;
 *  - перетаскивание выбранной фигуры приходит через moveShape.
 */

import { useCallback, useState } from 'react';
import type { Shape } from '../types/shape';

export function useShapes(initial: readonly Shape[] = []) {
  const [shapes, setShapes] = useState<Shape[]>(() => [...initial]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /** Добавляет фигуру и сразу выделяет её. */
  const addShape = useCallback((shape: Shape) => {
    setShapes((list) => [...list, shape]);
    setSelectedId(shape.id);
  }, []);

  /** Точечная правка свойств фигуры (без id). */
  const updateShape = useCallback((id: string, patch: Partial<Omit<Shape, 'id'>>) => {
    setShapes((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  /** Перемещение фигуры в абсолютную позицию (canvas-координаты).
   *  Дельта от захвата к следующей позиции считается в Canvas через geometry. */
  const moveShape = useCallback((id: string, x: number, y: number) => {
    setShapes((list) => list.map((s) => (s.id === id ? { ...s, x, y } : s)));
  }, []);

  /** Удаление фигуры (пригодится для Backspace в следующем шаге). */
  const removeShape = useCallback((id: string) => {
    setShapes((list) => list.filter((s) => s.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }, []);

  /** Выделение: по id, или null — снять выделение. */
  const select = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const selected = shapes.find((s) => s.id === selectedId) ?? null;

  return { shapes, selectedId, selected, addShape, updateShape, moveShape, removeShape, select };
}