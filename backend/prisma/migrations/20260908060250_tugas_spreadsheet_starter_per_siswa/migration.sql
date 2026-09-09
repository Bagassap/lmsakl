-- CreateTable
CREATE TABLE "tugas_spreadsheet_starter" (
    "id" TEXT NOT NULL,
    "tugasId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_spreadsheet_starter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tugas_spreadsheet_starter_tugasId_siswaId_key" ON "tugas_spreadsheet_starter"("tugasId", "siswaId");

-- AddForeignKey
ALTER TABLE "tugas_spreadsheet_starter" ADD CONSTRAINT "tugas_spreadsheet_starter_tugasId_fkey" FOREIGN KEY ("tugasId") REFERENCES "tugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_spreadsheet_starter" ADD CONSTRAINT "tugas_spreadsheet_starter_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
