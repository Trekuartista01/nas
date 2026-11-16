"use client";

export interface FilterTab<T extends string> {
  id: T;
  label: string;
  count?: number;
}

export default function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: FilterTab<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.id)}
            className={`min-h-11 border px-5 text-[13px] font-bold tracking-[0.06em] transition-all duration-200 hover:-translate-y-0.5 ${
              active ? "border-red bg-red text-white" : "border-[#333] text-[#cfcfcf] hover:border-white"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="ml-1.5 font-medium opacity-55">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
