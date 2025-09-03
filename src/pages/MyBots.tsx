'use client';
import * as React from 'react';
import BotCard from '@/components/my-bots/BotCard';
import BotDetailsDrawer from '@/components/my-bots/BotDetailsDrawer';
import { useBots } from '@/hooks/useBots';

export default function MyBotsPage() {
  const { bots, rebacktest, exportPy, edit, duplicate, remove, togglePin } = useBots();
  const [detailsId, setDetailsId] = React.useState<string | null>(null);
  const [selectMode, setSelectMode] = React.useState(false);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const ordered = [...bots].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  const toggleSelect = (id: string, next: boolean) =>
    setSelected(prev => ({ ...prev, [id]: next }));

  const clearSelection = () => setSelected({});

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-xl font-semibold">My Bots</div>
        <div className="ml-auto flex items-center gap-2">
          {!selectMode ? (
            <button className="px-3 py-1 rounded-md border text-sm" onClick={() => setSelectMode(true)}>Compare / Export</button>
          ) : (
            <>
              <button className="px-3 py-1 rounded-md border text-sm" onClick={() => console.log('compare', selectedIds)}>Compare</button>
              <button className="px-3 py-1 rounded-md border text-sm" onClick={() => console.log('bulk export', selectedIds)}>Export Bundle</button>
              <button className="px-3 py-1 rounded-md border text-sm" onClick={() => { setSelectMode(false); clearSelection(); }}>Done</button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ordered.map(b => (
          <BotCard
            key={b.id}
            bot={b}
            onRebacktest={rebacktest}
            onExport={exportPy}
            onEdit={edit}
            onDuplicate={duplicate}
            onDelete={remove}
            onTogglePin={(id, next) => togglePin(id)}
            onOpenDetails={id => setDetailsId(id)}
            selectable={selectMode}
            selected={!!selected[b.id]}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>

      <BotDetailsDrawer
        open={!!detailsId}
        bot={ordered.find(b => b.id === detailsId) ?? null}
        onClose={() => setDetailsId(null)}
      />
    </div>
  );
}