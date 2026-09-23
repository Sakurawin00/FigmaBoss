/**
 * Заготовка горячих клавиш.
 *
 * Сейчас хук ничего не делает — он понадобится в следующем шаге, когда
 * подключим выделение и редактирование фигур. Соответствие клавиш
 * инструментам уже живёт в src/constants/tools.ts (TOOL_BY_KEY):
 * v → select, r → rectangle, o → ellipse.
 */

export function useHotkeys(): void {
  // TODO(step 2):
  //  - R / O / V — смена активного инструмента (через TOOL_BY_KEY);
  //  - Backspace / Delete — удаление выделенной фигуры (useShapes.removeShape).
  return undefined;
}