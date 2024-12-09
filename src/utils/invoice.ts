import jsPDF from 'jspdf';
import { addHeight, addImage, addText, setFontColor, setFontSize } from './pdf';
import { CurrentHeight, InvoiceProps, PdfConfig } from '../types/invoice.types';

export const addBusinessInfo = (doc: jsPDF, pdfConfig: Required<PdfConfig>, currentHeight: CurrentHeight, docWidth: number, props: InvoiceProps) => {
    const marginRight = pdfConfig.margin.right || 10;
    const marginLeft = pdfConfig.margin.left || 10;

    setFontSize(doc, pdfConfig.headerTextSize);
    setFontColor(doc, pdfConfig.headerFontColor);
    addText(doc, props.business?.name || "", docWidth - marginRight, currentHeight.value, { align: "right" });
    setFontSize(doc, pdfConfig.fieldTextSize);

    if (props.logo?.src) {
        const logo = new Image();
        logo.src = props.logo.src;

        if (props.logo.type) {
            addImage(doc, logo, marginLeft + (props.logo.style?.margin?.left || 0), currentHeight.value + (props.logo.style?.margin?.top || 0), props.logo.style?.width || 64, props.logo.style?.height || 64, props.logo.type);
        } else {
            addImage(doc, logo, marginLeft + (props.logo.style?.margin?.left || 0), currentHeight.value + (props.logo.style?.margin?.top || 0), props.logo.style?.width || 64, props.logo.style?.height || 64);
        }
    }

    setFontColor(doc, pdfConfig.textFontColor);
    addHeight(currentHeight, pdfConfig.subLineHeight * 2);
    addText(doc, props.business?.address || "", docWidth - marginRight, currentHeight.value, { align: "right" });
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addText(doc, props.business?.phone || "", docWidth - marginRight, currentHeight.value, { align: "right" })
    setFontSize(doc, pdfConfig.fieldTextSize);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addText(doc, props.business?.email || "", docWidth - marginRight, currentHeight.value, { align: "right" })
    addHeight(currentHeight, pdfConfig.subLineHeight);

    addText(doc, props.business?.email_1 || "", docWidth - marginRight, currentHeight.value, { align: "right" });

    if (props.business?.email_1) {
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    addText(doc, props.business?.website || "", docWidth - marginRight, currentHeight.value, { align: "right" });
    addHeight(currentHeight, pdfConfig.subLineHeight);
}

export const addClientAndInvoiceInfo = (doc: jsPDF, pdfConfig: Required<PdfConfig>, currentHeight: CurrentHeight, docWidth: number, props: InvoiceProps) => {
    const marginLeft = pdfConfig.margin.left || 10;
    const marginRight = pdfConfig.margin.right || 10;

    setFontColor(doc, pdfConfig.textFontColor);
    setFontSize(doc, pdfConfig.fieldTextSize);
    addHeight(currentHeight, pdfConfig.lineHeight);


    addText(doc, props.client?.label, marginLeft, currentHeight.value)
    if (props.client?.label) {
        currentHeight.value += pdfConfig.lineHeight;
    }

    setFontColor(doc, pdfConfig.headerFontColor);
    setFontSize(doc, pdfConfig.headerTextSize - 5);
    addText(doc, props.client?.name, marginLeft, currentHeight.value)

    if (props.invoice?.label && props.invoice?.num) {
        addText(doc, props.invoice?.label + props.invoice?.num,
            docWidth - marginRight,
            currentHeight.value,
            { align: "right" }
        )
        currentHeight.value += pdfConfig.lineHeight;
    }

    setFontColor(doc, pdfConfig.textFontColor);
    setFontSize(doc, pdfConfig.fieldTextSize - 2);


    if (props.client?.address || props.invoice?.invDate) {
        addText(doc, props.client?.address, marginLeft, currentHeight.value)
        addText(doc, props.invoice?.invDate, docWidth - marginRight, currentHeight.value, { align: "right" })
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    if (props.client?.phone || props.invoice?.invGenDate) {
        addText(doc, props.client?.phone, marginLeft, currentHeight.value)
        addText(doc, props.invoice?.invGenDate, docWidth - marginRight, currentHeight.value, { align: "right" })
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    if (props.client?.email) {
        addText(doc, props.client.email, marginLeft, currentHeight.value)
        addHeight(currentHeight, pdfConfig.subLineHeight);
    }

    addText(doc, props.client?.otherInfo, marginLeft, currentHeight.value)
    if (!props.client?.otherInfo) {
        currentHeight.value -= pdfConfig.subLineHeight
    }
}

export const addInvoiceDesc = (doc: jsPDF, pdfConfig: Required<PdfConfig>, props: InvoiceProps, currentHeight: CurrentHeight, docWidth: number) => {
    const marginLeft = pdfConfig.margin.left || 10;

    setFontSize(doc, pdfConfig.labelTextSize);
    setFontColor(doc, pdfConfig.headerFontColor);

    addText(doc, props.invoice?.invDescLabel || "", marginLeft, currentHeight.value)
    addHeight(currentHeight, pdfConfig.subLineHeight);
    setFontColor(doc, pdfConfig.textFontColor);
    setFontSize(doc, pdfConfig.fieldTextSize - 1);

    const lines = doc.splitTextToSize(props.invoice?.invDesc || "", docWidth / 2);

    addText(doc, lines, marginLeft, currentHeight.value)
    addHeight(currentHeight, doc.getTextDimensions(lines).h > 5
        ? doc.getTextDimensions(lines).h + 6
        : pdfConfig.lineHeight)
};