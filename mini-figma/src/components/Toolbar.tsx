/**
 * Панель инструментов (слева). Каркас, собранный из центрального
 * списка src/constants/tools.ts — смена клавиш/инструментов не требует
 * правок тут.
 */

import { TOOLS } from '../constants/tools';
import type { ToolId } from '../types/shape';

interface ToolbarProps {
  tool: ToolId;
  onToolChange: (tool: ToolId) => void;
}

export function Toolbar({ tool, onToolChange }: ToolbarProps) {
  return (
    <aside aria-label="Инструменты" className="flex w-16 flex-col items-center gap-1 border-r border-neutral-200 bg-white py-3">
      {TOOLS.map((t) => {
        const active = tool === t.id;
        return (
          <button
            key={t.id}
            type="button"
            title={`${t.description} (клавиша ${t.key.toUpperCase()})`}
            aria-pressed={active}
            onClick={() => onToolChange(t.id)}
            className={[
              'relative flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
              active
                ? 'bg-blue-600 text-white'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800',
            ].join(' ')}
          >
            <ToolIcon id={t.id} />
            <span className="absolute bottom-0.5 right-1 text-[9px] font-semibold opacity-60">
              {t.key.toUpperCase()}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

function ToolIcon({ id }: { id: ToolId }) {
  if (id === 'rectangle') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="stroke-current">
        <rect x="3.5" y="3.5" width="11" height="11" fill="none" strokeWidth="1.8" />
      </svg>
    );
  }
  if (id === 'ellipse') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="stroke-current">
        <ellipse cx="9" cy="9" rx="5.5" ry="5" fill="none" strokeWidth="1.8" />
      </svg>
    );
  }
  // select — курсор-стрелка.
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="stroke-current">
      <path d="M4 3l9.5 4-4.6 1.3L7.8 13z" fill="none" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}