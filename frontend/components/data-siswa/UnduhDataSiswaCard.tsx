"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Users, School } from "lucide-react";
import { kelasShort } from "./shared";
import { DataSiswaExportButtons } from "./DataSiswaExportButtons";

type Scope = "semua" | "kelas";

const SCOPE_CARDS: { key: Scope; label: string; caption: string; icon: React.ElementType; gradient: string }[] = [
  { key: "semua", label: "Semua Siswa", caption: "Seluruh data", icon: Users, gradient: "#8B0000" },
  { key: "kelas", label: "Kelas Ini", caption: "Kelas terpilih", icon: School, gradient: "#4D7C0F" },
];

export function UnduhDataSiswaCard({
  kelasId, kelasNama,
}: {
  kelasId?: string; kelasNama?: string;
}) {
  const [scope, setScope] = useState<Scope>("semua");

  useEffect(() => {
    if (scope === "kelas" && !kelasId) setScope("semua");
  }, [kelasId, scope]);

  const caption = scope === "kelas" && kelasNama ? kelasShort(kelasNama) : "Semua kelas";

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{
            background: "linear-gradient(155deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%), #5E0000",
            boxShadow: "0 5px 10px -3px #5E000080, inset 0 2px 2px rgba(255,255,255,0.5), inset 0 -3px 4px rgba(0,0,0,0.18)",
          }}>
          <FileText size={18} />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Unduh Laporan</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Ekspor data siswa ke PDF/Excel</p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 content-center gap-2.5">
        {SCOPE_CARDS.map((opt) => {
          const disabled = opt.key === "kelas" && !kelasId;
          const active = scope === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              disabled={disabled}
              onClick={() => setScope(opt.key)}
              title={disabled ? "Pilih kelas di filter dahulu" : undefined}
              className={`flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                active ? "" : "border-transparent bg-slate-50 dark:bg-slate-700/40"
              }`}
              style={active ? { borderColor: opt.gradient, backgroundColor: `${opt.gradient}14` } : undefined}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${opt.gradient}1A`, color: opt.gradient }}>
                <opt.icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{opt.label}</p>
                <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{opt.caption}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-300">
        <School size={12} className="shrink-0 text-[#8B0000]" />
        {caption}
      </p>

      <div className="mt-3">
        <DataSiswaExportButtons
          kelasId={scope === "kelas" ? kelasId : undefined}
          kelasNama={scope === "kelas" ? kelasNama : undefined}
        />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
        <Download size={11} className="shrink-0 text-[#8B0000]" />
        Pilih cakupan, lalu klik salah satu tombol ekspor
      </p>
    </div>
  );
}
