-- Tipe PRAKTIK diganti total dari "mengetik HTML/CSS/JS" (tidak relevan
-- untuk jurusan AKL/akuntansi) menjadi grid jurnal umum akuntansi. Tidak ada
-- data tugas tipe PRAKTIK yang sudah terpakai saat migrasi ini dibuat, jadi
-- kolom lama aman langsung di-drop tanpa migrasi data.

-- AlterTable
ALTER TABLE "tugas"
  DROP COLUMN "starterHtml",
  DROP COLUMN "starterCss",
  DROP COLUMN "starterJs",
  ADD COLUMN "starterPraktik" TEXT;

-- AlterTable
ALTER TABLE "tugas_submisi"
  DROP COLUMN "submittedHtml",
  DROP COLUMN "submittedCss",
  DROP COLUMN "submittedJs",
  ADD COLUMN "submittedPraktik" TEXT;
