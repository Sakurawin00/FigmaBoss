import type { Tool, ToolId } from '../types/shape';

/**
 * Центральный список инструментов и их клавиши.
 * Меняем инструменты/клавиши здесь — и больше нигде по проекту искать не надо.
 */
export const TOOLS: readonly Tool[] = [
  { id: 'select', label: 'Select', key: 'v', description: 'Выбор фигуры' },
  { id: 'rectangle', label: 'Rectangle', key: 'r', description: 'Прямоугольник' },
  { id: 'ellipse', label: 'Ellipse', key: 'o', description: 'Эллипс' },
] as const;

/** Быстрый поиск инструмента по буквенной клавише: v → select, r → rectangle, o → ellipse. */
export const TOOL_BY_KEY: Readonly<Record<string, ToolId>> = Object.fromEntries(
  TOOLS.map((tool) => [tool.key, tool.id]),
) as Record<string, ToolId>;