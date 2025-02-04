import jsPDF from "jspdf";

export type OutputType = "blob" | "save" | "arraybuffer";

export type ReturnObj = {
    pagesNumber: number;
    jsPDFDocObject: jsPDF;
    blob: Blob | URL;
    dataUriString: string;
    arrayBuffer: ArrayBuffer;
};

export type PdfConfig = {
    headerTextSize?: number;
    labelTextSize?: number;
    fieldTextSize?: number;
    lineHeight?: number;
    subLineHeight?: number;
    headerFontColor?: string;
    textFontColor?: string;
    margin?: Margin;
    spacing?: {
        afterClientInfo?: number;
        afterBusinessInfo?: number;
    };
    orientation?: "landscape" | "portrait";
    compress?: boolean;
};

export type InvoiceProps = {
    outputType: OutputType;
    fileName: string;
    beforePDFCreation?: (doc: jsPDF) => void;
    afterPDFCreation?: (returnObj: Partial<ReturnObj>) => void;
    returnJsPDFDocObject?: boolean;
    pdfConfig?: PdfConfig;
    logo?: Logo;
    stamp?: Logo & {
        inAllPages?: boolean;
    };
    businessName?: string;
    businessInfo?: string[];
    clientLabel?: string;
    clientName?: string;
    clientInfo?: string[];
    invoice?: {
        label?: string;
        number?: number;
        invDate?: string;
        invGenDate?: string;
        borderAfterHeader?: boolean;
        header?: TableRow;
        table?: TableRow[];
        invoiceDescriptionLabel?: string;
        invoiceDescription?: string;
        additionalRows?: {
            key: string;
            value: string;
            style?: Style;
        }[];
    };
    footer?: string;
    displayPageLabel?: boolean;
    pageLabel?: string;
    pageDelimiter?: string;
};

type Style = Partial<{
    width?: number;
    height?: number;
    fontSize?: number;
    align?: "left" | "center" | "right";
    margin?: Partial<Margin>;
}>;

type Margin = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};

type Logo = {
    src?: string;
    type?: string;
    style?: Style;
};

export type TableRow = TableEntry[];

export type TableEntry = {
    text: string;
    style?: Partial<Style>;
};

export type CurrentHeight = {
    value: number;
};
