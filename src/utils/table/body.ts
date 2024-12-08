import jsPDF from 'jspdf';
import { CurrentHeight, InvoiceProps, PdfConfig } from '../../types/invoice.types';
import { addTableBodyBorder, addTableHeader, getMaxRowHeight } from './header';
import { addHeight, splitTextAndGetHeight } from '../pdf';

export const addTableBody = (doc: jsPDF, props: InvoiceProps, currentHeight: CurrentHeight, docWidth: number, pdfConfig: Required<PdfConfig>, defaultColumnWidth: number) => {
    const tableBodyLength = props.invoice?.table?.length || 2;
    const marginLeft = pdfConfig.margin?.left || 10;
    const marginRight = pdfConfig.margin?.right || 10;

    props.invoice?.table?.forEach((row, index) => {
        doc.line(marginLeft, currentHeight.value, docWidth - marginRight, currentHeight.value);
        const maxHeight = getMaxRowHeight(row, props, doc, defaultColumnWidth);

        //body borders
        if (props.invoice?.tableBodyBorder) {
            addTableBodyBorder(maxHeight + 1, doc, props, currentHeight, defaultColumnWidth, marginLeft);
        }

        let startWidth = 0;
        row.forEach((entry, index) => {
            if (!props.invoice?.header) {
                return;
            }
            const widthToUse = props.invoice?.header[index].style?.width || defaultColumnWidth;

            let item = splitTextAndGetHeight(doc, entry.text, widthToUse - 1);

            if (index == 0) {
                doc.text(item.text, marginLeft + 1, currentHeight.value + 4);
            } else {
                const currentTdWidth = entry.style?.width || defaultColumnWidth;
                const previousTdWidth = props.invoice?.header[index - 1]?.style?.width || defaultColumnWidth;
                const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
                startWidth += widthToUse;
                doc.text(item.text, marginLeft + 1 + startWidth, currentHeight.value + 4);
            }
        });

        addHeight(currentHeight, maxHeight - 4)
        addHeight(currentHeight, 5);

        //pre-increase currentHeight.value to check the height based on next row
        if (index + 1 < tableBodyLength) {
            addHeight(currentHeight, maxHeight)
        }

        if (
            props.orientation &&
            (currentHeight.value > 185 ||
                (currentHeight.value > 178 && doc.getNumberOfPages() > 1))
        ) {
            doc.addPage();
            currentHeight.value = 10;
            if (index + 1 < tableBodyLength) {
                addTableHeader(doc, props, pdfConfig, currentHeight, defaultColumnWidth);
            }
        }

        if (!props.orientation && (currentHeight.value > 265 || (currentHeight.value > 255 && doc.getNumberOfPages() > 1))) {
            doc.addPage();
            currentHeight.value = 10;
            if (index + 1 < tableBodyLength) {
                addTableHeader(doc, props, pdfConfig, currentHeight, defaultColumnWidth);
            }
        }

        if (index + 1 < tableBodyLength && currentHeight.value > 30) {
            addHeight(currentHeight, -maxHeight)
        }
    });
}