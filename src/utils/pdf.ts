import jsPDF, { TextOptionsLight } from "jspdf";
import { CurrentHeight, InvoiceProps, ReturnObj } from "../types/invoice.types";

export const splitTextAndGetHeight = (
    doc: jsPDF,
    text: string,
    size: number
) => {
    const line = doc.splitTextToSize(text, size) as string;
    return {
        text: line,
        height: doc.getTextDimensions(line).h,
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
        margin: {
            bottom: props.pdfConfig?.margin?.bottom || 10,
            top: props.pdfConfig?.margin?.top || 15,
            left: props.pdfConfig?.margin?.left || 10,
            right: props.pdfConfig?.margin?.right || 10,
        },
        spacing: {
            beforeTable: props.pdfConfig?.spacing?.afterClientInfo || 10,
            afterBusinessInfo:
                props.pdfConfig?.spacing?.afterBusinessInfo || 10,
        },
        compress: props.pdfConfig?.compress || false,
        orientation: props.pdfConfig?.orientation || "portrait",
    };
};

export const addText = (
    doc: jsPDF,
    text: string | undefined,
    x: number,
    y: number,
    options?: TextOptionsLight
) => {
    if (text) {
        doc.text(text, x, y, options);
    }
};

export const addImage = (
    doc: jsPDF,
    image: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    type?: string
) => {
    if (type) {
        doc.addImage(image, type, x, y, w, h);
    } else {
        doc.addImage(image, x, y, w, h);
    }
};

export const addHeight = (currentHeight: CurrentHeight, height: number) => {
    currentHeight.value += height;
    return currentHeight.value;
};

export const setFontColor = (doc: jsPDF, color: string) => {
    doc.setTextColor(color);
};

export const setFontSize = (doc: jsPDF, size: number) => {
    doc.setFontSize(size);
};

export const handleSave = (
    doc: jsPDF,
    props: InvoiceProps,
    returnObj: Partial<ReturnObj>
) => {
    switch (props.outputType) {
        case "save":
            doc.save(props.fileName);
            break;
        case "blob":
            returnObj = {
                ...returnObj,
                blob: doc.output("blob"),
            };
            break;
        case "arraybuffer":
        default:
            returnObj = {
                ...returnObj,
                arrayBuffer: doc.output("arraybuffer"),
            };
    }
    return returnObj;
};
