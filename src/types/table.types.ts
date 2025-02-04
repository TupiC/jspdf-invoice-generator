import jsPDF from "jspdf";
import { InvoiceProps, PdfConfig, CurrentHeight } from "./invoice.types";

export type TableProps = {
    doc: jsPDF;
    invoiceProps: InvoiceProps;
    pdfConfig: Required<PdfConfig>;
    docWidth: number;
    currentHeight: CurrentHeight;
    defaultColumnWidth: number;
};
