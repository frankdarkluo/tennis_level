import { Card } from "@/components/ui/Card";

export type ProfileMetricItem = {
  label: string;
  value: string;
  hint?: string;
};

export function ProfileMetricStrip({
  items
}: {
  items: ProfileMetricItem[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="space-y-2 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{item.label}</p>
          <p className="text-base font-semibold text-slate-900">{item.value}</p>
          {item.hint ? (
            <p className="text-sm text-slate-500">{item.hint}</p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
