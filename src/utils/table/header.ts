import jsPDF from 'jspdf';
import { CurrentHeight, InvoiceProps, PdfConfig, TableRow } from '../../types/invoice.types';
import { addHeight, addText, setFontColor, splitTextAndGetHeight } from '../pdf';

export const getColumnAmount = (props: InvoiceProps) => {
    return props.invoice?.header?.length || 2;
}

export const addTableHeader = (doc: jsPDF, props: InvoiceProps, pdfConfig: Required<PdfConfig>, currentHeight: CurrentHeight, defaultColumnWidth: number) => {
    if (props.invoice?.headerBorder) {
        addTableHeaderBorder(doc, (pdfConfig.margin.left || 10), currentHeight, props, defaultColumnWidth);
    }

    addHeight(currentHeight, pdfConfig.subLineHeight);
    doc.setTextColor(pdfConfig.headerFontColor);
    doc.setFontSize(pdfConfig.fieldTextSize);
    doc.setDrawColor(pdfConfig.textFontColor);

    currentHeight.value += 2;

    let startWidth = 0;

    props.invoice?.header?.forEach((row, index) => {
        if (index === 0) {
            addText(doc, row.text, (pdfConfig.margin.left || 10), currentHeight.value)
        } else {
            const currentTdWidth = row?.style?.width || defaultColumnWidth;
            if (!props.invoice?.header) {
                return;
            }
            const previousColumnWidth = props.invoice?.header[index - 1]?.style?.width || defaultColumnWidth;
            const widthToUse = currentTdWidth == previousColumnWidth ? currentTdWidth : previousColumnWidth;
            startWidth += widthToUse;
            addText(doc, row.text, startWidth + (pdfConfig.margin.left || 10), currentHeight.value)
        }
    });

    addHeight(currentHeight, pdfConfig.subLineHeight);
    setFontColor(doc, pdfConfig.textFontColor);
};


export const addTableHeaderBorder = (doc: jsPDF, marginLeft: number, currentHeight: CurrentHeight, props: InvoiceProps, defaultColumnWidth: number) => {
    addHeight(currentHeight, 2);

    const lineHeight = 7;
    let startWidth = 0;

    if (!props.invoice?.header) {
        return;
    }

    for (let i = 0; i < props.invoice.header?.length; i++) {
        const currentTdWidth = props.invoice.header[i]?.style?.width || defaultColumnWidth;
        if (i === 0) {
            doc.rect(marginLeft, currentHeight.value, currentTdWidth, lineHeight);
        } else {
            const previousTdWidth = props.invoice.header[i - 1]?.style?.width || defaultColumnWidth;
            const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
            startWidth += widthToUse;
            doc.rect(startWidth + marginLeft, currentHeight.value, currentTdWidth, lineHeight);
        }
    }
    currentHeight.value -= 2;
};

export const addTableBodyBorder = (lineHeight: number, doc: jsPDF, props: InvoiceProps, currentHeight: CurrentHeight, defaultColumnWidth: number, marginLeft: number) => {
    let startWidth = 0;

    if (!props.invoice?.header) {
        return;
    }

    for (let i = 0; i < props.invoice.header.length; i++) {
        const currentTdWidth = props.invoice.header[i].style?.width || defaultColumnWidth;
        if (i === 0) {
            doc.rect(marginLeft, currentHeight.value, currentTdWidth, lineHeight);
        } else {
            const previousTdWidth = props.invoice.header[i - 1]?.style?.width || defaultColumnWidth;
            const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
            startWidth += widthToUse;
            doc.rect(startWidth + marginLeft, currentHeight.value, currentTdWidth, lineHeight);
        }
    }
};

export const getMaxRowHeight = (row: TableRow, props: InvoiceProps, doc: jsPDF, defaultColumnWidth: number) => {
    let rowsHeight: number[] = [];
    row.forEach((entry, index: number) => {
        if (!props.invoice?.header) {
            return;
        }

        const widthToUse = props.invoice?.header[index].style?.width || defaultColumnWidth;

        let item = splitTextAndGetHeight(doc, entry.text, widthToUse - 1);
        rowsHeight.push(item.height + 1);
    });

    return Math.max(...rowsHeight);
};