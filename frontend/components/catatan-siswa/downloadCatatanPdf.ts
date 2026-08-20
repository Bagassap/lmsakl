type DownloadResult = { ok: true } | { ok: false; message: string };

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "Data";
}

async function downloadFile(url: string, filename: string, failMessage: string): Promise<DownloadResult> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return { ok: false, message: "Tidak dapat terhubung ke server" };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: false, message: data?.message ?? failMessage };
  }

  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objUrl);

  return { ok: true };
}

export async function downloadCatatanPdfKelas({ kelasId, kelasNama }: { kelasId: string; kelasNama: string }): Promise<DownloadResult> {
  return downloadFile(
    `/api/catatan-siswa/export-pdf?kelasId=${encodeURIComponent(kelasId)}`,
    `CatatanSiswa_${safeName(kelasNama)}.pdf`,
    "Gagal membuat PDF",
  );
}

export async function downloadCatatanPdfSiswa({ siswaId, siswaNama }: { siswaId: string; siswaNama: string }): Promise<DownloadResult> {
  return downloadFile(
    `/api/catatan-siswa/export-pdf-siswa?siswaId=${encodeURIComponent(siswaId)}`,
    `CatatanSiswa_${safeName(siswaNama)}.pdf`,
    "Gagal membuat PDF",
  );
}

export async function downloadCatatanExcelKelas({ kelasId, kelasNama }: { kelasId: string; kelasNama: string }): Promise<DownloadResult> {
  return downloadFile(
    `/api/catatan-siswa/export-excel?kelasId=${encodeURIComponent(kelasId)}`,
    `CatatanSiswa_${safeName(kelasNama)}.xlsx`,
    "Gagal membuat Excel",
  );
}

export async function downloadCatatanExcelSiswa({ siswaId, siswaNama }: { siswaId: string; siswaNama: string }): Promise<DownloadResult> {
  return downloadFile(
    `/api/catatan-siswa/export-excel-siswa?siswaId=${encodeURIComponent(siswaId)}`,
    `CatatanSiswa_${safeName(siswaNama)}.xlsx`,
    "Gagal membuat Excel",
  );
}
