export function PlaceholderPage({
  title,
  badge,
  badgeVariant = "kelola",
  icon: Icon,
}: {
  title: string;
  badge: string;
  badgeVariant?: "kelola" | "lihat" | "sendiri";
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const badgeStyle =
    badgeVariant === "kelola"
      ? "bg-[#FBBF24]/15 text-[#FBBF24]"
      : badgeVariant === "lihat"
        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
        : "bg-[#FDE68A] text-[#FBBF24]";

  return (
    <div>
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 py-20 text-center dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Icon size={26} className="text-primary" />
        </div>
        <p className="font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Fitur dalam pengembangan</p>
      </div>
    </div>
  );
}
