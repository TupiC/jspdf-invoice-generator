import jsPDF, { TextOptionsLight } from 'jspdf';
import { InvoiceProps } from './types/invoice.types';

export const splitTextAndGetHeight = (doc: jsPDF, text: string, size: number) => {
    const lines = doc.splitTextToSize(text, size);
    return {
        text: lines,
        height: doc.getTextDimensions(lines).h,
    };
};

export const getPdfConfig = (props: InvoiceProps) => {
    return {
        fieldTextSize: props.pdfConfig?.fieldTextSize || 10,
        headerTextSize: props.pdfConfig?.headerTextSize || 20,
        labelTextSize: props.pdfConfig?.labelTextSize || 12,
        lineHeight: props.pdfConfig?.lineHeight || 6,
        subLineHeight: props.pdfConfig?.subLineHeight || 4,
        headerFontColor: props.pdfConfig?.headerFontColor || "#000000",
        textFontColor: props.pdfConfig?.textFontColor || "#4d4e53",
        startingAt: props.pdfConfig?.startingAt || 15,
        margin: {
            bottom: props.pdfConfig?.margin?.bottom || 10,
            top: props.pdfConfig?.margin?.top || 10,
            left: props.pdfConfig?.margin?.left || 10,
            right: props.pdfConfig?.margin?.bottom || 10,
        },
        spacing: {
            beforeTable: props.pdfConfig?.spacing?.beforeTable || 10,
            afterBusinessInfo: props.pdfConfig?.spacing?.afterBusinessInfo || 10,
        }
    }
}

export const addText = (doc: jsPDF, text: string | undefined, x: number, y: number, options?: TextOptionsLight) => {
    if (text) {
        doc.text(text, x, y, options);
    }
}