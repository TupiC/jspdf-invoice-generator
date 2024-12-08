import jsPDF from 'jspdf';
import { CurrentHeight, InvoiceProps, PdfConfig, TableRow } from '../../types/invoice.types';
import { addHeight, addText, setFontColor, setFontSize, splitTextAndGetHeight } from '../pdf';

export const getColumnAmount = (props: InvoiceProps) => {
    return props.invoice?.header?.length || 2;
}

export const addTableHeader = (doc: jsPDF, props: InvoiceProps, pdfConfig: Required<PdfConfig>, currentHeight: CurrentHeight, defaultColumnWidth: number) => {
    const marginLeft = pdfConfig.margin.left || 10;
    const marginRight = pdfConfig.margin.right || 10;
    console.log("🚀 ~ addTableHeader ~ marginRight:", marginRight)



    if (props.invoice?.headerBorder) {
        addTableHeaderBorder(doc, marginLeft, marginRight, currentHeight, props, defaultColumnWidth);
    }

    addHeight(currentHeight, pdfConfig.subLineHeight);
    setFontColor(doc, pdfConfig.headerFontColor);
    setFontSize(doc, pdfConfig.fieldTextSize);
    doc.setDrawColor(pdfConfig.textFontColor);

    addHeight(currentHeight, 2);

    let startWidth = 0;

    props.invoice?.header?.forEach((row, index) => {
        if (index === 0) {
            addText(doc, row.text, marginLeft + 1, currentHeight.value)
        } else {
            const currentTdWidth = row?.style?.width || defaultColumnWidth;
            if (!props.invoice?.header) {
                return;
            }
            const previousColumnWidth = props.invoice?.header[index - 1]?.style?.width || defaultColumnWidth;
            const widthToUse = currentTdWidth == previousColumnWidth ? currentTdWidth : previousColumnWidth;
            startWidth += widthToUse;
            addText(doc, row.text, startWidth + marginLeft + 1, currentHeight.value)
        }
    });

    addHeight(currentHeight, pdfConfig.subLineHeight);
    setFontColor(doc, pdfConfig.textFontColor);
};


export const addTableHeaderBorder = (doc: jsPDF, marginLeft: number, marginRight: number, currentHeight: CurrentHeight, props: InvoiceProps, defaultColumnWidth: number) => {
    addHeight(currentHeight, 2);

    let startWidth = 0;

    if (!props.invoice?.header) {
        return;
    }

    for (let i = 0; i < props.invoice.header?.length; i++) {
        const lineHeight = props.invoice.header[i]?.style?.height || 6;
        const currentTdWidth = props.invoice.header[i]?.style?.width || defaultColumnWidth;
        if (i === 0) {
            doc.rect(marginLeft, currentHeight.value, currentTdWidth, lineHeight);
        } else if (i === props.invoice.header.length - 1) {
            const previousTdWidth = props.invoice.header[i - 1]?.style?.width || defaultColumnWidth;
            const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
            startWidth += widthToUse;
            doc.rect(startWidth + marginLeft, currentHeight.value, doc.internal.pageSize.width - startWidth - marginRight - marginLeft, lineHeight);
        }
        else {
            const previousTdWidth = props.invoice.header[i - 1]?.style?.width || defaultColumnWidth;
            const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
            startWidth += widthToUse;
            doc.rect(startWidth + marginLeft, currentHeight.value, currentTdWidth, lineHeight);
        }
    }
    addHeight(currentHeight, -2);
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