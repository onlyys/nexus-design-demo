"use client";

interface TitleInputProps {
  value: string;
  onChange: (v: string) => void;
  max?: number;
}

export function TitleInput({ value, onChange, max = 100 }: TitleInputProps) {
  return (
    <div className="relative group">
      <div className="flex items-start gap-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, max))}
          placeholder="输入主题名称…"
          rows={1}
          className="flex-1 resize-none bg-transparent text-[36px] leading-[1.25] font-bold tracking-tight text-ink-900 placeholder:text-ink-400/80 outline-none border-0 py-1"
          style={{ fontFamily: "Inter, 'PingFang SC', sans-serif" }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = `${t.scrollHeight}px`;
          }}
        />
        <div className="flex items-center gap-2 pt-3 shrink-0">
          <span className="text-[12px] tabular-nums text-ink-400 select-none">
            {value.length}/{max}
          </span>
        </div>
      </div>
    </div>
  );
}
