import { BadRequestException, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function toRgbHex(argb: string | undefined): string | undefined {
  if (!argb) return undefined;
  const hex = argb.length === 8 ? argb.slice(2) : argb;
  return `#${hex}`;
}

@Injectable()
export class SpreadsheetImportService {
  async importFromGoogleSheetsUrl(url: string): Promise<string> {
    const sheetId = extractSheetId(url);
    if (!sheetId) throw new BadRequestException('Link Google Sheets tidak valid');

    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    let res: Response;
    try {
      res = await fetch(exportUrl);
    } catch {
      throw new BadRequestException('Tidak dapat mengambil data dari Google Sheets');
    }
    if (!res.ok) {
      throw new BadRequestException(
        'Gagal mengambil spreadsheet. Pastikan sudah dibagikan sebagai "Siapa saja yang memiliki link" dengan akses minimal Lihat',
      );
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);

    const sheetOrder: string[] = [];
    const sheets: Record<string, unknown> = {};

    wb.eachSheet((ws, idx) => {
      const sheetKey = `sheet-${idx}`;
      sheetOrder.push(sheetKey);
      const cellData: Record<string, Record<string, unknown>> = {};

      ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const r = rowNumber - 1;
          const c = colNumber - 1;
          const entry: Record<string, unknown> = {};

          if (cell.formula) {
            entry.f = `=${cell.formula}`;
            const result = cell.result;
            if (typeof result === 'number' || typeof result === 'string' || typeof result === 'boolean') {
              entry.v = result;
            }
          } else if (cell.value !== null && cell.value !== undefined) {
            const v = cell.value;
            if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
              entry.v = v;
            } else if (v instanceof Date) {
              entry.v = v.toISOString();
            } else {
              entry.v = String(v);
            }
          }

          const style: Record<string, unknown> = {};
          if (cell.font?.bold) style.bl = 1;
          if (cell.font?.italic) style.it = 1;
          if (cell.font?.name) style.ff = cell.font.name;
          if (cell.font?.size) style.fs = cell.font.size;
          const fontColor = toRgbHex(cell.font?.color?.argb);
          if (fontColor) style.cl = { rgb: fontColor };
          const fill = cell.fill;
          if (fill && fill.type === 'pattern' && fill.pattern === 'solid') {
            const bgColor = toRgbHex((fill.fgColor as { argb?: string } | undefined)?.argb);
            if (bgColor) style.bg = { rgb: bgColor };
          }
          if (cell.numFmt) style.n = { pattern: cell.numFmt };
          if (Object.keys(style).length > 0) entry.s = style;

          if (Object.keys(entry).length > 0) {
            if (!cellData[r]) cellData[r] = {};
            cellData[r][c] = entry;
          }
        });
      });

      sheets[sheetKey] = {
        id: sheetKey,
        name: ws.name || `Sheet${idx}`,
        cellData,
        rowCount: Math.max(ws.rowCount, 100),
        columnCount: Math.max(ws.columnCount, 26),
      };
    });

    if (sheetOrder.length === 0) {
      throw new BadRequestException('Spreadsheet ini tidak punya sheet yang bisa diimpor');
    }

    const snapshot = {
      id: `workbook-${Date.now()}`,
      sheetOrder,
      sheets,
    };
    return JSON.stringify(snapshot);
  }
}
