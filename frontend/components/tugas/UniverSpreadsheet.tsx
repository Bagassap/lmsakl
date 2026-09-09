"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createUniver, LocaleType } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import "@univerjs/preset-sheets-core/lib/index.css";

export type UniverSpreadsheetHandle = {
  getSnapshot: () => string;
};

function emptyWorkbook(): Record<string, unknown> {
  const unitId = `workbook-${Date.now()}`;
  const sheetId = "sheet-01";
  return {
    id: unitId,
    sheetOrder: [sheetId],
    sheets: {
      [sheetId]: {
        id: sheetId,
        name: "Sheet1",
        cellData: {},
        rowCount: 100,
        columnCount: 26,
      },
    },
  };
}

export const UniverSpreadsheet = forwardRef<
  UniverSpreadsheetHandle,
  { initialSnapshot?: string | null; readOnly?: boolean }
>(function UniverSpreadsheet({ initialSnapshot, readOnly }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof createUniver> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = createUniver({
      locale: LocaleType.EN_US,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
          toolbar: !readOnly,
          formulaBar: !readOnly,
        }),
      ],
    });
    apiRef.current = instance;

    let parsed: Record<string, unknown> | null = null;
    if (initialSnapshot) {
      try {
        parsed = JSON.parse(initialSnapshot);
      } catch {
        parsed = null;
      }
    }
    const fWorkbook = instance.univerAPI.createWorkbook(parsed && Object.keys(parsed).length > 0 ? parsed : emptyWorkbook());
    if (readOnly) {
      fWorkbook.getWorkbookPermission().setReadOnly();
    }

    return () => {
      instance.univer.dispose();
      apiRef.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getSnapshot: () => {
        const wb = apiRef.current?.univerAPI.getActiveWorkbook();
        return wb ? JSON.stringify(wb.save()) : "";
      },
    }),
    [],
  );

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700" />;
});
