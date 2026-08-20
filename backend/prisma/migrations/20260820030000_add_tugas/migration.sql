-- CreateEnum
CREATE TYPE "StatusTugas" AS ENUM ('TERKIRIM', 'DITERIMA', 'REVISI');

-- CreateTable
CREATE TABLE "tugas" (
    "id" TEXT NOT NULL,
    "mapel" TEXT NOT NULL,
    "kelasId" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'SUBMIT',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "starterHtml" TEXT,
    "starterCss" TEXT,
    "starterJs" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas_soal" (
    "id" TEXT NOT NULL,
    "tugasId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "pertanyaan" TEXT NOT NULL,
    "pilihanA" TEXT,
    "pilihanB" TEXT,
    "pilihanC" TEXT,
    "pilihanD" TEXT,
    "jawabanBenar" TEXT,

    CONSTRAINT "tugas_soal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas_submisi" (
    "id" TEXT NOT NULL,
    "tugasId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "submittedHtml" TEXT,
    "submittedCss" TEXT,
    "submittedJs" TEXT,
    "catatan" TEXT,
    "pesanRevisi" TEXT,
    "status" "StatusTugas" NOT NULL DEFAULT 'TERKIRIM',
    "nilai" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_submisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas_jawaban" (
    "id" TEXT NOT NULL,
    "submisiId" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "jawabanPilihan" TEXT,
    "jawabanEssay" TEXT,

    CONSTRAINT "tugas_jawaban_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tugas_submisi_tugasId_siswaId_key" ON "tugas_submisi"("tugasId", "siswaId");

-- CreateIndex
CREATE UNIQUE INDEX "tugas_jawaban_submisiId_soalId_key" ON "tugas_jawaban"("submisiId", "soalId");

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_soal" ADD CONSTRAINT "tugas_soal_tugasId_fkey" FOREIGN KEY ("tugasId") REFERENCES "tugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_submisi" ADD CONSTRAINT "tugas_submisi_tugasId_fkey" FOREIGN KEY ("tugasId") REFERENCES "tugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_submisi" ADD CONSTRAINT "tugas_submisi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_jawaban" ADD CONSTRAINT "tugas_jawaban_submisiId_fkey" FOREIGN KEY ("submisiId") REFERENCES "tugas_submisi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_jawaban" ADD CONSTRAINT "tugas_jawaban_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "tugas_soal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
