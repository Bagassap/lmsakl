import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

type UniverCell = {
  v?: string | number | boolean;
  f?: string;
  s?: string | UniverStyle;
};

type UniverStyle = {
  bl?: 0 | 1;
  it?: 0 | 1;
  ff?: string;
  fs?: number;
  cl?: { rgb?: string };
  bg?: { rgb?: string };
  n?: { pattern?: string };
};

type UniverSheet = {
  name?: string;
  cellData?: Record<string, Record<string, UniverCell>>;
  columnData?: Record<string, { w?: number }>;
  rowData?: Record<string, { h?: number }>;
};

type UniverWorkbookSnapshot = {
  sheetOrder?: string[];
  sheets?: Record<string, UniverSheet>;
  styles?: Record<string, UniverStyle | null>;
};

function toArgb(rgb: string | undefined): string | undefined {
  if (!rgb) return undefined;
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (match) {
    const [, r, g, b] = match;
    return 'FF' + [r, g, b].map((v) => Number(v).toString(16).padStart(2, '0').toUpperCase()).join('');
  }
  const hex = rgb.replace('#', '').toUpperCase();
  if (hex.length === 6) return 'FF' + hex;
  return undefined;
}

@Injectable()
export class SpreadsheetExportService {
  async build(snapshotJson: string): Promise<Buffer> {
    let snapshot: UniverWorkbookSnapshot = {};
    try {
      snapshot = JSON.parse(snapshotJson);
    } catch {
      snapshot = {};
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'LMS AKL';
    wb.created = new Date();

    const sheetOrder = snapshot.sheetOrder ?? Object.keys(snapshot.sheets ?? {});
    for (const sheetId of sheetOrder) {
      const sheet = snapshot.sheets?.[sheetId];
      if (!sheet) continue;
      const ws = wb.addWorksheet(sheet.name || 'Sheet1');

      for (const rowKey of Object.keys(sheet.cellData ?? {})) {
        const row = Number(rowKey);
        const rowCells = sheet.cellData![rowKey];
        for (const colKey of Object.keys(rowCells)) {
          const col = Number(colKey);
          const cell = rowCells[colKey];
          const excelCell = ws.getCell(row + 1, col + 1);

          if (cell.f) {
            const result = typeof cell.v === 'number' || typeof cell.v === 'string' || typeof cell.v === 'boolean' ? cell.v : undefined;
            excelCell.value = { formula: cell.f.replace(/^=/, ''), result } as ExcelJS.CellFormulaValue;
          } else if (cell.v !== undefined) {
            excelCell.value = cell.v;
          }

          const styleRaw = cell.s;
          const style = typeof styleRaw === 'string' ? snapshot.styles?.[styleRaw] : styleRaw;
          if (style) {
            const font: Partial<ExcelJS.Font> = {};
            if (style.bl === 1) font.bold = true;
            if (style.it === 1) font.italic = true;
            if (style.ff) font.name = style.ff;
            if (style.fs) font.size = style.fs;
            const fontColor = toArgb(style.cl?.rgb);
            if (fontColor) font.color = { argb: fontColor };
            if (Object.keys(font).length > 0) excelCell.font = font;

            const fillColor = toArgb(style.bg?.rgb);
            if (fillColor) excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };

            if (style.n?.pattern) excelCell.numFmt = style.n.pattern;
          }
        }
      }

      for (const colKey of Object.keys(sheet.columnData ?? {})) {
        const col = Number(colKey);
        const w = sheet.columnData![colKey].w;
        if (w) ws.getColumn(col + 1).width = Math.round(w / 7);
      }
      for (const rowKey of Object.keys(sheet.rowData ?? {})) {
        const row = Number(rowKey);
        const h = sheet.rowData![rowKey].h;
        if (h) ws.getRow(row + 1).height = h * 0.75;
      }
    }

    if (wb.worksheets.length === 0) wb.addWorksheet('Sheet1');

    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}
