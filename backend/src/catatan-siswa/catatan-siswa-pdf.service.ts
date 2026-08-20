import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { join } from 'path';

type CatatanRow = {
  id: string;
  judul: string;
  catatan: string;
  poin: number | null;
  tanggal: Date;
  dicatatOleh: { nama: string };
};

type RekapKelasData = {
  kelas: { nama: string } | null;
  siswa: { id: string; nama: string | null; nis: string; totalPoin: number; catatan: CatatanRow[] }[];
};

type RekapSiswaData = {
  siswa: { id: string; nama: string | null; nis: string; kelasId: string };
  catatan: CatatanRow[];
  totalPoin: number;
};

const FONT_REGULAR = join(process.cwd(), 'src', 'assets', 'fonts', 'Satoshi-Regular.ttf');
const FONT_BOLD = join(process.cwd(), 'src', 'assets', 'fonts', 'Satoshi-Bold.ttf');

const BRAND = '#FF5B19';
const BRAND_TINT = '#FFE8DA';
const CHARCOAL = '#161616';
const MUTED = '#6E6E6E';
const BORDER = '#E8E7E4';

function registerFonts(doc: PDFKit.PDFDocument) {
  doc.registerFont('Satoshi', FONT_REGULAR);
  doc.registerFont('Satoshi-Bold', FONT_BOLD);
  doc.font('Satoshi');
}

function formatTanggal(d: Date): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatGeneratedAt(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) + ' WIB';
}

function drawPageHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  const pageWidth = doc.page.width;
  doc.rect(0, 0, pageWidth, 90).fill(BRAND);
  doc.fillColor('#ffffff').font('Satoshi-Bold').fontSize(18).text(title, 40, 28);
  doc.font('Satoshi').fontSize(10).fillColor('#FFEDD5').text(subtitle, 40, 52);
  doc.font('Satoshi').fontSize(8).fillColor('#FFEDD5').text(`Dicetak ${formatGeneratedAt()}`, 40, 68);
  doc.fillColor(CHARCOAL);
  doc.y = 112;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) doc.addPage();
}

function drawSiswaSection(doc: PDFKit.PDFDocument, nama: string, nis: string, totalPoin: number, catatan: CatatanRow[]) {
  ensureSpace(doc, 46);
  const startY = doc.y;
  doc.roundedRect(40, startY, doc.page.width - 80, 30, 6).fill(BRAND_TINT);
  doc.fillColor(CHARCOAL).font('Satoshi-Bold').fontSize(11).text(`${nama ?? '-'}`, 50, startY + 6, { width: 320 });
  doc.font('Satoshi').fontSize(8).fillColor(MUTED).text(`NIS ${nis}`, 50, startY + 19);
  doc.font('Satoshi-Bold').fontSize(9).fillColor(BRAND).text(
    `${totalPoin} poin  ·  ${catatan.length} catatan`, doc.page.width - 240, startY + 11, { width: 190, align: 'right' },
  );
  doc.y = startY + 38;

  if (catatan.length === 0) {
    doc.font('Satoshi').fontSize(9).fillColor(MUTED).text('Belum ada catatan.', 50, doc.y);
    doc.y += 16;
    return;
  }

  for (const c of catatan) {
    ensureSpace(doc, 54);
    const rowY = doc.y;
    doc.font('Satoshi-Bold').fontSize(9.5).fillColor(CHARCOAL).text(c.judul, 50, rowY, { width: 340 });
    doc.font('Satoshi').fontSize(8).fillColor(MUTED).text(formatTanggal(c.tanggal), doc.page.width - 190, rowY, { width: 150, align: 'right' });
    if (c.poin != null) {
      doc.font('Satoshi-Bold').fontSize(8).fillColor(BRAND).text(`${c.poin} poin`, doc.page.width - 190, rowY + 11, { width: 150, align: 'right' });
    }
    doc.font('Satoshi').fontSize(8.5).fillColor('#3D3D3D').text(c.catatan, 50, rowY + 14, { width: doc.page.width - 260 });
    doc.font('Satoshi').fontSize(7.5).fillColor(MUTED).text(`Dicatat oleh ${c.dicatatOleh.nama}`, 50, doc.y + 2);
    doc.y += 8;
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.y += 8;
  }
}

@Injectable()
export class CatatanSiswaPdfService {
  async buildKelas(rekap: RekapKelasData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      registerFonts(doc);
      drawPageHeader(doc, 'Laporan Catatan Siswa', `Kelas ${rekap.kelas?.nama ?? '-'}`);

      for (const s of rekap.siswa) {
        drawSiswaSection(doc, s.nama ?? '-', s.nis, s.totalPoin, s.catatan);
      }

      doc.end();
    });
  }

  async buildSiswa(rekap: RekapSiswaData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      registerFonts(doc);
      drawPageHeader(doc, 'Laporan Catatan Siswa', rekap.siswa.nama ?? '-');
      drawSiswaSection(doc, rekap.siswa.nama ?? '-', rekap.siswa.nis, rekap.totalPoin, rekap.catatan);

      doc.end();
    });
  }
}
