"use client";

export function FiltersModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Фильтры</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="text-xl text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {children}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-brand-deep py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
