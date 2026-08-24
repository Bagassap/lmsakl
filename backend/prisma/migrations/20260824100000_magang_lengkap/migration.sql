-- AbsensiMagang belum pernah dipakai (menu PKL masih placeholder total),
-- jadi tabelnya aman di-drop & dibuat ulang sepenuhnya mengikuti pola
-- AbsensiHarian (bukan cuma ALTER kolom satu-satu).
DROP TABLE "absensi_magang";

CREATE TABLE "absensi_magang" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "penempatanId" TEXT NOT NULL,
    "tempatMagangId" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "status" TEXT,
    "waktuAbsen" TEXT,
    "lokasi" TEXT,
    "foto" TEXT,
    "ttd" TEXT,
    "catatan" TEXT,
    "waktuPulang" TEXT,
    "lokasiPulang" TEXT,
    "fotoPulang" TEXT,
    "ttdPulang" TEXT,
    "catatanPulang" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absensi_magang_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "absensi_magang_penempatanId_tanggal_key" ON "absensi_magang"("penempatanId", "tanggal");

ALTER TABLE "absensi_magang" ADD CONSTRAINT "absensi_magang_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "absensi_magang" ADD CONSTRAINT "absensi_magang_penempatanId_fkey" FOREIGN KEY ("penempatanId") REFERENCES "penempatan_magang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "absensi_magang" ADD CONSTRAINT "absensi_magang_tempatMagangId_fkey" FOREIGN KEY ("tempatMagangId") REFERENCES "tempat_magang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "StatusLaporanAkhirMagang" AS ENUM ('TERKIRIM', 'DITERIMA', 'REVISI');

-- CreateTable
CREATE TABLE "lapor_diri_magang" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "penempatanId" TEXT NOT NULL,
    "tempatMagangId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lapor_diri_magang_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lapor_diri_magang_penempatanId_periode_key" ON "lapor_diri_magang"("penempatanId", "periode");

ALTER TABLE "lapor_diri_magang" ADD CONSTRAINT "lapor_diri_magang_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lapor_diri_magang" ADD CONSTRAINT "lapor_diri_magang_penempatanId_fkey" FOREIGN KEY ("penempatanId") REFERENCES "penempatan_magang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lapor_diri_magang" ADD CONSTRAINT "lapor_diri_magang_tempatMagangId_fkey" FOREIGN KEY ("tempatMagangId") REFERENCES "tempat_magang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "laporan_akhir_magang" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "penempatanId" TEXT NOT NULL,
    "tempatMagangId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "catatan" TEXT,
    "pesanRevisi" TEXT,
    "status" "StatusLaporanAkhirMagang" NOT NULL DEFAULT 'TERKIRIM',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laporan_akhir_magang_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "laporan_akhir_magang_penempatanId_key" ON "laporan_akhir_magang"("penempatanId");

ALTER TABLE "laporan_akhir_magang" ADD CONSTRAINT "laporan_akhir_magang_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "laporan_akhir_magang" ADD CONSTRAINT "laporan_akhir_magang_penempatanId_fkey" FOREIGN KEY ("penempatanId") REFERENCES "penempatan_magang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "laporan_akhir_magang" ADD CONSTRAINT "laporan_akhir_magang_tempatMagangId_fkey" FOREIGN KEY ("tempatMagangId") REFERENCES "tempat_magang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
