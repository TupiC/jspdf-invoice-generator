import { jsPDF, jsPDFOptions } from "jspdf";
import {
    CurrentHeight,
    InvoiceProps,
    ReturnObj as ReturnObject,
} from "./types/invoice.types";
import {
    addHeight,
    addText,
    getPdfConfig,
    handleSave,
    setFontColor,
    setFontSize,
} from "./utils/pdf";
import {
    addBusinessInfo,
    addClientAndInvoiceInfo,
    addInvoiceDesc,
    addStamp,
} from "./utils/invoice";
import { getColumnAmount } from "./utils/table/table.utils";
import { addTable } from "./utils/table/table";

const generateInvoice = (invoiceProps: InvoiceProps) => {
    if (!invoiceProps.invoice?.table || !invoiceProps.invoice?.header) {
        throw Error(
            "Please provide a table and a header in the invoice object."
        );
    }
    if (
        invoiceProps.invoice?.header.length < 2 ||
        invoiceProps.invoice?.table[0].length < 2
    ) {
        throw Error("Header and table must contain at least 2 columns.");
    }
    if (
        invoiceProps.invoice?.table.length &&
        invoiceProps.invoice?.table[0].length !=
            invoiceProps.invoice?.header.length
    ) {
        throw Error("Length of header and table column must be equal.");
    }

    let currentHeight: CurrentHeight = { value: 0 };

    const options: jsPDFOptions = {
        orientation: invoiceProps.pdfConfig?.orientation,
        compress: invoiceProps.pdfConfig?.compress,
    };

    const doc = new jsPDF(options);
    invoiceProps.beforePDFCreation && invoiceProps.beforePDFCreation(doc);

    const docWidth = doc.internal.pageSize.width;
    const docHeight = doc.internal.pageSize.height;
    const pdfConfig = getPdfConfig(invoiceProps);

    addHeight(currentHeight, pdfConfig.margin.top);
    addBusinessInfo({ doc, pdfConfig, currentHeight, docWidth, invoiceProps });

    if (invoiceProps.invoice.borderAfterHeader) {
        doc.line(
            pdfConfig.margin.left,
            currentHeight.value,
            docWidth - pdfConfig.margin.right,
            currentHeight.value
        );
    }

    addHeight(currentHeight, pdfConfig.spacing.afterBusinessInfo);
    addClientAndInvoiceInfo({
        doc,
        pdfConfig,
        currentHeight,
        docWidth,
        invoiceProps,
    });
    addHeight(currentHeight, pdfConfig.spacing.beforeTable);

    const columnAmount = getColumnAmount(invoiceProps);

    const customColumnWidth = invoiceProps.invoice.header
        .map((x) => x?.style?.width || 0)
        .filter((x) => x > 0);
    const customWidthOfAllColumns = customColumnWidth.reduce(
        (a, b) => a + b,
        0
    );
    let defaultColumnWidth =
        (docWidth - (pdfConfig.margin.left + pdfConfig.margin.right)) /
        columnAmount;
    defaultColumnWidth =
        (docWidth - 20 - customWidthOfAllColumns) /
        (invoiceProps.invoice.header.length - customColumnWidth.length);

    addTable({
        doc,
        invoiceProps,
        pdfConfig,
        docWidth,
        currentHeight,
        defaultColumnWidth,
    });

    setFontColor(doc, pdfConfig.headerFontColor);
    setFontSize(doc, pdfConfig.labelTextSize);
    currentHeight.value += pdfConfig.lineHeight;

    doc.line(
        docWidth / 2,
        currentHeight.value,
        docWidth - pdfConfig.margin.right,
        currentHeight.value
    );
    currentHeight.value += pdfConfig.lineHeight;

    for (const row of invoiceProps.invoice.additionalRows || []) {
        currentHeight.value += pdfConfig.lineHeight;
        setFontSize(doc, row?.style?.fontSize || pdfConfig.fieldTextSize);

        addText(doc, row.key, docWidth / 1.5, currentHeight.value, {
            align: "right",
        });
        addText(
            doc,
            row.value,
            docWidth - pdfConfig.margin.right,
            currentHeight.value,
            { align: "right" }
        );
    }

    setFontColor(doc, pdfConfig.headerFontColor);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    setFontSize(doc, pdfConfig.labelTextSize);

    if (doc.getNumberOfPages() > 1) {
        for (let i = 0; i < doc.getNumberOfPages(); i++) {
            setFontSize(doc, pdfConfig.fieldTextSize - 2);
            setFontColor(doc, pdfConfig.textFontColor);

            if (invoiceProps.stamp?.inAllPages) {
                addStamp(doc, invoiceProps, docHeight, pdfConfig);
            }
            addText(
                doc,
                invoiceProps.footer,
                docWidth / 2,
                docHeight - pdfConfig.margin.bottom,
                {
                    align: "center",
                    maxWidth:
                        docWidth -
                        pdfConfig.margin.left -
                        pdfConfig.margin.right,
                }
            );
            doc.setPage(i + 1);
            if (invoiceProps.displayPageLabel) {
                addText(
                    doc,
                    `${invoiceProps.pageLabel} ${i + 1} ${
                        invoiceProps.pageDelimiter || "/"
                    } ${doc.getNumberOfPages()}`,
                    docWidth - pdfConfig.margin.right,
                    doc.internal.pageSize.height - pdfConfig.margin.bottom,
                    { align: "right" }
                );
            }
        }
    }

    addInvoiceDesc({ doc, pdfConfig, invoiceProps, currentHeight, docWidth });

    addStamp(doc, invoiceProps, docHeight, pdfConfig);

    if (doc.getNumberOfPages() === 1) {
        setFontSize(doc, pdfConfig.fieldTextSize - 2);
        setFontColor(doc, pdfConfig.textFontColor);
        addText(
            doc,
            invoiceProps.footer,
            docWidth / 2,
            docHeight - pdfConfig.margin.bottom,
            {
                align: "center",
                maxWidth:
                    docWidth - pdfConfig.margin.left - pdfConfig.margin.right,
            }
        );
        if (invoiceProps.displayPageLabel) {
            addText(
                doc,
                `${invoiceProps.pageLabel} 1 ${
                    invoiceProps.pageDelimiter || "/"
                } 1`,
                docWidth - pdfConfig.margin.right,
                docHeight - pdfConfig.margin.bottom,
                { align: "right" }
            );
        }
    }

    let returnObject: Partial<ReturnObject> = {
        pagesNumber: doc.getNumberOfPages(),
    };

    if (invoiceProps.returnJsPDFDocObject) {
        returnObject = {
            ...returnObject,
            jsPDFDocObject: doc,
        };
    }

    returnObject = handleSave(doc, invoiceProps, returnObject);

    invoiceProps.afterPDFCreation &&
        invoiceProps.afterPDFCreation(returnObject);
};
export default generateInvoice;
