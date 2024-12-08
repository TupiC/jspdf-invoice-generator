import jsPDF from 'jspdf';
import { addHeight, addText, setFontColor, setFontSize } from './pdf';
import { InvoiceProps, PdfConfig } from '../types/invoice.types';

export const addBusinessInfo = (doc: jsPDF, pdfConfig: Required<PdfConfig>, currentHeight: { value: number }, docWidth: number, props: InvoiceProps) => {
    setFontColor(doc, pdfConfig.textFontColor);
    addHeight(currentHeight, pdfConfig.subLineHeight * 2);
    addText(doc, props.business?.address || "", docWidth - (pdfConfig.margin.right || 10), currentHeight.value, { align: "right" });
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addText(doc, props.business?.phone || "", docWidth - (pdfConfig.margin.right || 10), currentHeight.value, { align: "right" })
    setFontSize(doc, pdfConfig.fieldTextSize);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addText(doc, props.business?.email || "", docWidth - (pdfConfig.margin.right || 10), currentHeight.value, { align: "right" })
    addHeight(currentHeight, pdfConfig.subLineHeight);

    addText(doc, props.business?.email_1 || "", docWidth - (pdfConfig.margin.right || 10), currentHeight.value, { align: "right" });

    if (props.business?.email_1) {
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    addText(doc, props.business?.website || "", docWidth - (pdfConfig.margin.right || 10), currentHeight.value, { align: "right" });
    addHeight(currentHeight, pdfConfig.subLineHeight);
}


export const addClientAndInvoiceInfo = (doc: jsPDF, pdfConfig: Required<PdfConfig>, currentHeight: { value: number }, docWidth: number, props: InvoiceProps) => {
    setFontColor(doc, pdfConfig.textFontColor);
    setFontSize(doc, pdfConfig.fieldTextSize);
    addHeight(currentHeight, pdfConfig.lineHeight);


    addText(doc, props.client?.label, (pdfConfig.margin.left || 10), currentHeight.value)
    if (props.client?.label) {
        currentHeight.value += pdfConfig.lineHeight;
    }

    setFontColor(doc, pdfConfig.headerFontColor);
    setFontSize(doc, pdfConfig.headerTextSize - 5);
    addText(doc, props.client?.name, (pdfConfig.margin.left || 10), currentHeight.value)

    if (props.invoice?.label && props.invoice?.num) {
        addText(doc, props.invoice?.label + props.invoice?.num,
            docWidth - (pdfConfig.margin.right || 10),
            currentHeight.value,
            { align: "right" }
        )
        currentHeight.value += pdfConfig.lineHeight;
    }

    setFontColor(doc, pdfConfig.textFontColor);
    setFontSize(doc, pdfConfig.fieldTextSize - 2);


    if (props.client?.address || props.invoice?.invDate) {
        addText(doc, props.client?.address, (pdfConfig.margin.left || 10), currentHeight.value)
        addText(doc, props.invoice?.invDate, docWidth - (pdfConfig.margin.right || 10), currentHeight.value, { align: "right" })
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    if (props.client?.phone || props.invoice?.invGenDate) {
        addText(doc, props.client?.phone, (pdfConfig.margin.left || 10), currentHeight.value)
        addText(doc, props.invoice?.invGenDate, docWidth - (pdfConfig.margin.right || 10), currentHeight.value, { align: "right" })
        addHeight(currentHeight, pdfConfig.subLineHeight);
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    if (props.client?.email) {
        addText(doc, props.client.email, (pdfConfig.margin.left || 10), currentHeight.value)
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    addText(doc, props.client?.otherInfo, (pdfConfig.margin.left || 10), currentHeight.value)
    if (!props.client?.otherInfo) {
        currentHeight.value -= pdfConfig.subLineHeight
    }
}