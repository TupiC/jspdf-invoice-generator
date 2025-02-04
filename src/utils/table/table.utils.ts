import jsPDF from "jspdf";
import { InvoiceProps, TableRow } from "../../types/invoice.types";
import { splitTextAndGetHeight } from "../pdf";

export const getColumnAmount = (props: InvoiceProps) => {
    return props.invoice?.header?.length || 2;
};

export const getMaxRowHeight = (
    row: TableRow,
    props: InvoiceProps,
    doc: jsPDF,
    defaultColumnWidth: number
) => {
    let rowsHeight: number[] = [];
    row.forEach((entry, index: number) => {
        if (!props.invoice?.header) {
            return;
        }

        const widthToUse =
            props.invoice?.header[index].style?.width || defaultColumnWidth;

        let item = splitTextAndGetHeight(doc, entry.text, widthToUse - 1);
        rowsHeight.push(item.height + 1);
    });

    return Math.max(...rowsHeight);
};

export const getMaxDocumentHeight = (invoiceProps: InvoiceProps) => {
    if (invoiceProps.pdfConfig?.orientation === "portrait") {
        if (invoiceProps.stamp?.src) {
            return 285 - (invoiceProps.stamp.style?.height || 64);
        }
        return 285;
    } else {
        if (invoiceProps.stamp?.src) {
            return 200 - (invoiceProps.stamp.style?.height || 64);
        }
        return 200;
    }
};
