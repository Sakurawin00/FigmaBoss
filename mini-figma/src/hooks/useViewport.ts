/**
 * Камера (вьюпорт): панорамирование пробелом + мышью, зум колесом
 * от 10% до 400%, центрирование «мирового нуля» при старте.
 *
 * Хук не трогает DOM — только состояние и математику. События мыши/колеса
 * приходят из Canvas, который зовёт panBy/zoomBy с экранными координатами.
 */

import { useCallback, useEffect, useState } from 'react';
import type { Camera, Point } from '../types/shape';
import { zoomAt } from '../utils/geometry';

export function useViewport() {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [spaceDown, setSpaceDown] = useState(false);

  // Отслеживаем пробел глобально, но игнорируем нажатия внутри полей ввода —
  // чтобы пробел в тексте не включал режим панорамирования.
  useEffect(() => {
    const isTyping = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      if (isTyping(event.target)) return;
      if (!event.repeat) setSpaceDown(true);
      event.preventDefault(); // страница не должна скроллиться по пробелу
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpaceDown(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  /** Сдвиг камеры на дельту в пикселях экрана. */
  const panBy = useCallback((dx: number, dy: number) => {
    setCamera((c) => ({ x: c.x + dx, y: c.y + dy, zoom: c.zoom }));
  }, []);

  /** Зум с фокусом на точке вьюпорта (обычно — под курсором). */
  const zoomBy = useCallback((client: Point, factor: number) => {
    setCamera((c) => zoomAt(client, factor, c));
  }, []);

  /** Центрирует «мировой нуль» в центре канваса. Вызывается один раз при старте. */
  const centerView = useCallback((width: number, height: number) => {
    setCamera({ x: width / 2, y: height / 2, zoom: 1 });
  }, []);

  return { camera, spaceDown, panBy, zoomBy, centerView };
}