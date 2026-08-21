type DownloadResult = { ok: true } | { ok: false; message: string };

export async function downloadUjianUkkSubmisiExcel(): Promise<DownloadResult> {
  let res: Response;
  try {
    res = await fetch("/api/ujian-ukk/submisi/export-excel");
  } catch {
    return { ok: false, message: "Tidak dapat terhubung ke server" };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: false, message: data?.message ?? "Gagal membuat Excel" };
  }

  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objUrl;
  a.download = "Rekap_Submisi_UKK.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objUrl);

  return { ok: true };
}
