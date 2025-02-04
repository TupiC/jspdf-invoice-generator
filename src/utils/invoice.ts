import jsPDF from "jspdf";
import { addHeight, addImage, addText, setFontColor, setFontSize } from "./pdf";
import { InvoiceProps, PdfConfig } from "../types/invoice.types";
import { TableProps } from "../types/table.types";

export const addBusinessInfo = (
    props: Omit<TableProps, "defaultColumnWidth">
) => {
    const marginRight = props.pdfConfig?.margin.right || 10;
    const marginLeft = props.pdfConfig?.margin.left || 10;

    setFontSize(props.doc, props.pdfConfig.headerTextSize);
    setFontColor(props.doc, props.pdfConfig.headerFontColor);
    addText(
        props.doc,
        props.invoiceProps.businessName || "",
        props.docWidth - marginRight,
        props.currentHeight.value,
        { align: "right" }
    );
    setFontSize(props.doc, props.pdfConfig.fieldTextSize);

    if (props.invoiceProps.logo?.src) {
        const logo = new Image();
        logo.src = props.invoiceProps.logo.src;

        if (props.invoiceProps.logo.type) {
            addImage(
                props.doc,
                logo,
                marginLeft + (props.invoiceProps.logo.style?.margin?.left || 0),
                props.currentHeight.value +
                    (props.invoiceProps.logo.style?.margin?.top || 0),
                props.invoiceProps.logo.style?.width || 64,
                props.invoiceProps.logo.style?.height || 64,
                props.invoiceProps.logo.type
            );
        } else {
            addImage(
                props.doc,
                logo,
                marginLeft + (props.invoiceProps.logo.style?.margin?.left || 0),
                props.currentHeight.value +
                    (props.invoiceProps.logo.style?.margin?.top || 0),
                props.invoiceProps.logo.style?.width || 64,
                props.invoiceProps.logo.style?.height || 64
            );
        }
    }

    setFontColor(props.doc, props.pdfConfig.textFontColor);
    addHeight(props.currentHeight, props.pdfConfig.subLineHeight * 2);
    props.invoiceProps.businessInfo?.forEach((line) => {
        addText(
            props.doc,
            line,
            props.docWidth - marginRight,
            props.currentHeight.value,
            {
                align: "right",
            }
        );
        addHeight(props.currentHeight, props.pdfConfig.subLineHeight);
    });
};

export const addClientAndInvoiceInfo = (
    props: Omit<TableProps, "defaultColumnWidth">
) => {
    const marginLeft = props.pdfConfig.margin.left || 10;
    const marginRight = props.pdfConfig.margin.right || 10;

    setFontColor(props.doc, props.pdfConfig.textFontColor);
    setFontSize(props.doc, props.pdfConfig.fieldTextSize);
    addHeight(props.currentHeight, props.pdfConfig.lineHeight);

    addText(
        props.doc,
        props.invoiceProps.clientLabel,
        marginLeft,
        props.currentHeight.value
    );
    if (props.invoiceProps.clientLabel) {
        props.currentHeight.value += props.pdfConfig.lineHeight;
    }

    setFontColor(props.doc, props.pdfConfig.headerFontColor);
    setFontSize(props.doc, props.pdfConfig.headerTextSize - 5);
    addText(
        props.doc,
        props.invoiceProps.clientName,
        marginLeft,
        props.currentHeight.value
    );

    if (
        props.invoiceProps.invoice?.label &&
        props.invoiceProps.invoice?.number
    ) {
        addText(
            props.doc,
            props.invoiceProps.invoice?.label +
                props.invoiceProps.invoice?.number,
            props.docWidth - marginRight,
            props.currentHeight.value,
            { align: "right" }
        );
        props.currentHeight.value += props.pdfConfig.lineHeight;
    }

    setFontColor(props.doc, props.pdfConfig.textFontColor);
    setFontSize(props.doc, props.pdfConfig.fieldTextSize - 2);

    const clientInfo = props.invoiceProps.clientInfo || [];

    clientInfo.forEach((line) => {
        addText(props.doc, line, marginLeft, props.currentHeight.value);
        addHeight(props.currentHeight, props.pdfConfig.subLineHeight);
    });

    if (props.invoiceProps.invoice?.invDate) {
        addText(
            props.doc,
            props.invoiceProps.invoice?.invDate,
            props.docWidth - marginRight,
            props.currentHeight.value -
                clientInfo.length * props.pdfConfig.subLineHeight,
            { align: "right" }
        );
    }

    if (props.invoiceProps.invoice?.invGenDate) {
        addText(
            props.doc,
            props.invoiceProps.invoice?.invGenDate,
            props.docWidth - marginRight,
            props.currentHeight.value -
                (clientInfo.length - 1) * props.pdfConfig.subLineHeight,
            { align: "right" }
        );
    }
};

export const addInvoiceDesc = (
    props: Omit<TableProps, "defaultColumnWidth">
) => {
    const marginLeft = props.pdfConfig.margin.left || 10;

    setFontSize(props.doc, props.pdfConfig.labelTextSize);
    setFontColor(props.doc, props.pdfConfig.headerFontColor);

    addText(
        props.doc,
        props.invoiceProps.invoice?.invoiceDescriptionLabel || "",
        marginLeft,
        props.currentHeight.value
    );
    addHeight(props.currentHeight, props.pdfConfig.subLineHeight);
    setFontColor(props.doc, props.pdfConfig.textFontColor);
    setFontSize(props.doc, props.pdfConfig.fieldTextSize - 1);

    const lines = props.doc.splitTextToSize(
        props.invoiceProps.invoice?.invoiceDescription || "",
        props.docWidth / 2
    );

    addText(props.doc, lines, marginLeft, props.currentHeight.value);
    addHeight(
        props.currentHeight,
        props.doc.getTextDimensions(lines).h > 5
            ? props.doc.getTextDimensions(lines).h + 6
            : props.pdfConfig.lineHeight
    );
};

export const addStamp = (
    doc: jsPDF,
    invoiceProps: InvoiceProps,
    docHeight: number,
    pdfConfig: PdfConfig
) => {
    const marginLeft = pdfConfig.margin?.left || 10;
    const marginBottom = pdfConfig.margin?.bottom || 10;

    if (invoiceProps.stamp?.src) {
        const stamp = new Image();
        stamp.src = invoiceProps.stamp.src;
        const stampWidth = invoiceProps.stamp.style?.width || 64;
        const stampHeight = invoiceProps.stamp.style?.height || 64;

        if (invoiceProps.stamp.type) {
            addImage(
                doc,
                stamp,
                marginLeft + (invoiceProps.stamp.style?.margin?.left || 0),
                docHeight -
                    marginBottom -
                    stampHeight +
                    (invoiceProps.stamp.style?.margin?.top || 0),
                stampWidth,
                stampHeight,
                invoiceProps.stamp.type
            );
        } else {
            addImage(
                doc,
                stamp,
                marginLeft + (invoiceProps.stamp.style?.margin?.left || 0),
                docHeight -
                    marginBottom -
                    stampHeight +
                    (invoiceProps.stamp.style?.margin?.top || 0),
                stampWidth,
                stampHeight
            );
        }
    }
};
