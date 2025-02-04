import { TableEntry, TableRow } from "../../types/invoice.types";
import { TableProps } from "../../types/table.types";
import {
    addHeight,
    addText,
    setFontColor,
    setFontSize,
    splitTextAndGetHeight,
} from "../pdf";
import { getMaxDocumentHeight, getMaxRowHeight } from "./table.utils";

export const addTable = (props: TableProps) => {
    const tableBodyLength = props.invoiceProps.invoice?.table?.length || 2;
    const marginLeft = props.pdfConfig.margin?.left || 10;
    const marginRight = props.pdfConfig.margin?.right || 10;

    addHeight(props.currentHeight, props.pdfConfig.subLineHeight);
    setFontColor(props.doc, props.pdfConfig.headerFontColor);
    setFontSize(props.doc, props.pdfConfig.fieldTextSize);
    props.doc.setDrawColor(props.pdfConfig.textFontColor);

    addHeight(props.currentHeight, 2);

    let startWidth = { value: 0 };

    const header = props.invoiceProps.invoice?.header || [];

    header?.forEach((entry, i) => {
        addTableRow(
            header,
            entry,
            i,
            props,
            startWidth,
            marginLeft,
            marginRight
        );
    });

    addHeight(props.currentHeight, 2);
    setFontColor(props.doc, props.pdfConfig.textFontColor);

    const body = props.invoiceProps.invoice?.table || [];

    body.forEach((row, rowIndex) => {
        props.doc.line(
            marginLeft,
            props.currentHeight.value,
            props.docWidth - marginRight,
            props.currentHeight.value
        );
        const maxHeight = getMaxRowHeight(
            row,
            props.invoiceProps,
            props.doc,
            props.defaultColumnWidth
        );

        let startWidth = { value: 0 };
        row.forEach((entry, i) => {
            if (header.length < 1) {
                return;
            }
            const widthToUse =
                header[i].style?.width || props.defaultColumnWidth;

            let item = splitTextAndGetHeight(
                props.doc,
                entry.text,
                widthToUse - 1
            );

            addTableRow(
                header,
                item,
                i,
                props,
                startWidth,
                marginLeft,
                marginRight,
                4
            );
        });

        addHeight(props.currentHeight, maxHeight - 4);
        addHeight(props.currentHeight, 5);

        if (rowIndex + 1 < tableBodyLength) {
            addHeight(props.currentHeight, maxHeight);
        }

        if (
            props.pdfConfig.orientation === "portrait" &&
            props.currentHeight.value > getMaxDocumentHeight(props.invoiceProps)
        ) {
            props.doc.addPage();
            props.currentHeight.value = props.pdfConfig.margin.top || 10;
            addHeight(props.currentHeight, 4);

            if (rowIndex + 1 < tableBodyLength) {
                startWidth = { value: 0 };
                header?.forEach((entry, i) => {
                    addTableRow(
                        header,
                        entry,
                        i,
                        props,
                        startWidth,
                        marginLeft,
                        marginRight
                    );
                });
            }
            addHeight(props.currentHeight, 2);
        }

        if (
            props.pdfConfig.orientation === "landscape" &&
            props.currentHeight.value > getMaxDocumentHeight(props.invoiceProps)
        ) {
            props.doc.addPage();
            props.currentHeight.value = props.pdfConfig.margin.top || 10;
            addHeight(props.currentHeight, 4);

            if (rowIndex + 1 < tableBodyLength) {
                startWidth = { value: 0 };
                header?.forEach((entry, i) => {
                    addTableRow(
                        header,
                        entry,
                        i,
                        props,
                        startWidth,
                        marginLeft,
                        marginRight
                    );
                });
            }
            addHeight(props.currentHeight, 2);
        }

        if (rowIndex + 1 < tableBodyLength && props.currentHeight.value > 30) {
            addHeight(props.currentHeight, -maxHeight);
        }
    });
};

const addTableRow = (
    row: TableRow,
    entry: TableEntry,
    i: number,
    props: TableProps,
    startWidth: { value: number },
    marginLeft: number,
    marginRight: number,
    additionalHeight = 0
) => {
    if (i === 0) {
        addText(
            props.doc,
            entry.text,
            startWidth.value + marginLeft + 1,
            props.currentHeight.value + additionalHeight
        );
    } else if (i == row?.length - 1) {
        addText(
            props.doc,
            entry.text,
            props.docWidth - marginRight,
            props.currentHeight.value + additionalHeight,
            { align: "right" }
        );
    } else {
        const currentTdWidth = entry?.style?.width || props.defaultColumnWidth;
        const previousColumnWidth =
            row[i - 1]?.style?.width || props.defaultColumnWidth;
        const widthToUse =
            currentTdWidth == previousColumnWidth
                ? currentTdWidth
                : previousColumnWidth;
        startWidth.value += widthToUse;
        addText(
            props.doc,
            entry.text,
            startWidth.value + marginLeft + 1,
            props.currentHeight.value + additionalHeight
        );
    }
};
