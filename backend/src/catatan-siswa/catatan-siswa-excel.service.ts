import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

type CatatanRow = {
  judul: string;
  catatan: string;
  poin: number | null;
  tanggal: Date;
  dicatatOleh: { nama: string };
};

type RekapKelasData = {
  kelas: { nama: string } | null;
  siswa: { nama: string | null; nis: string; totalPoin: number; catatan: CatatanRow[] }[];
};

type RekapSiswaData = {
  siswa: { nama: string | null; nis: string };
  catatan: CatatanRow[];
  totalPoin: number;
};

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF5B19' } };
const COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: 'Nama Siswa', key: 'nama', width: 26 },
  { header: 'NIS', key: 'nis', width: 14 },
  { header: 'Tanggal', key: 'tanggal', width: 14 },
  { header: 'Judul', key: 'judul', width: 28 },
  { header: 'Catatan', key: 'catatan', width: 50 },
  { header: 'Poin', key: 'poin', width: 8 },
  { header: 'Dicatat Oleh', key: 'dicatatOleh', width: 22 },
];

function formatTanggal(d: Date): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function styleSheet(sheet: ExcelJS.Worksheet) {
  sheet.columns = COLUMNS;
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = HEADER_FILL;
  header.alignment = { vertical: 'middle' };
  header.height = 20;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

@Injectable()
export class CatatanSiswaExcelService {
  async buildKelas(rekap: RekapKelasData): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'LMS AKL';
    const sheet = wb.addWorksheet(rekap.kelas?.nama ?? 'Kelas');
    styleSheet(sheet);

    for (const s of rekap.siswa) {
      if (s.catatan.length === 0) {
        sheet.addRow({ nama: s.nama ?? '-', nis: s.nis, tanggal: '', judul: '', catatan: 'Belum ada catatan', poin: '', dicatatOleh: '' });
        continue;
      }
      for (const c of s.catatan) {
        sheet.addRow({
          nama: s.nama ?? '-',
          nis: s.nis,
          tanggal: formatTanggal(c.tanggal),
          judul: c.judul,
          catatan: c.catatan,
          poin: c.poin ?? '',
          dicatatOleh: c.dicatatOleh.nama,
        });
      }
    }

    sheet.eachRow((row, i) => {
      if (i === 1) return;
      row.alignment = { vertical: 'top', wrapText: true };
    });

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async buildSiswa(rekap: RekapSiswaData): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'LMS AKL';
    const sheet = wb.addWorksheet(rekap.siswa.nama ?? 'Siswa');
    styleSheet(sheet);

    if (rekap.catatan.length === 0) {
      sheet.addRow({ nama: rekap.siswa.nama ?? '-', nis: rekap.siswa.nis, tanggal: '', judul: '', catatan: 'Belum ada catatan', poin: '', dicatatOleh: '' });
    } else {
      for (const c of rekap.catatan) {
        sheet.addRow({
          nama: rekap.siswa.nama ?? '-',
          nis: rekap.siswa.nis,
          tanggal: formatTanggal(c.tanggal),
          judul: c.judul,
          catatan: c.catatan,
          poin: c.poin ?? '',
          dicatatOleh: c.dicatatOleh.nama,
        });
      }
    }

    sheet.eachRow((row, i) => {
      if (i === 1) return;
      row.alignment = { vertical: 'top', wrapText: true };
    });

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }
}
