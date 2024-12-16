import { jsPDF, jsPDFOptions } from "jspdf";
import { CurrentHeight, InvoiceProps, ReturnObj } from "./types/invoice.types";
import { addHeight, addText, getPdfConfig, handleSave, setFontColor, setFontSize, splitTextAndGetHeight } from './utils/pdf';
import { addBusinessInfo, addClientAndInvoiceInfo, addInvoiceDesc, addStamp } from './utils/invoice';
import { addTableHeader, getColumnAmount } from './utils/table/header';
import { addTableBody } from './utils/table/body';
import { getTableData } from './utils/table/data';


const generateInvoice = (props: InvoiceProps) => {
  if (!props.invoice?.table || !props.invoice?.header) {
    throw Error("Please provide a table and a header in the invoice object.");
  }
  if (props.invoice?.header.length < 2 || props.invoice?.table[0].length < 2) {
    throw Error("Header and table must contain at least 2 columns.");
  }
  if (props.invoice?.table.length && props.invoice?.table[0].length != props.invoice?.header.length) {
    throw Error("Length of header and table column must be equal.");
  }

  let currentHeight: CurrentHeight = { value: 0 };

  const options: jsPDFOptions = {
    orientation: props.pdfConfig?.orientation,
    compress: props.pdfConfig?.compress,
  };

  const doc = new jsPDF(options);
  props.onJsPDFDocCreation && props.onJsPDFDocCreation(doc);
  const docWidth = doc.internal.pageSize.width;
  const docHeight = doc.internal.pageSize.height;
  const pdfConfig = getPdfConfig(props);

  addHeight(currentHeight, pdfConfig.margin.top);
  addBusinessInfo(doc, pdfConfig, currentHeight, docWidth, props);

  if (props.invoice.borderAfterHeader) {
    doc.line(pdfConfig.margin.left, currentHeight.value, docWidth - pdfConfig.margin.right, currentHeight.value);
  }
  addHeight(currentHeight, pdfConfig.spacing.afterBusinessInfo);
  addClientAndInvoiceInfo(doc, pdfConfig, currentHeight, docWidth, props);
  addHeight(currentHeight, pdfConfig.spacing.beforeTable);

  const columnAmount = getColumnAmount(props);

  const customColumnWidth = props.invoice.header.map(x => x?.style?.width || 0).filter(x => x > 0);
  const customWidthOfAllColumns = customColumnWidth.reduce((a, b) => a + b, 0);
  let defaultColumnWidth = (docWidth - (pdfConfig.margin.left + pdfConfig.margin.right)) / columnAmount;
  defaultColumnWidth = (docWidth - 20 - customWidthOfAllColumns) / (props.invoice.header.length - customColumnWidth.length);

  addTableHeader(doc, props, pdfConfig, currentHeight, defaultColumnWidth);

  addTableBody(doc, props, currentHeight, docWidth, pdfConfig, defaultColumnWidth);

  const invDescSize = splitTextAndGetHeight(doc,
    props.invoice.invDesc || "",
    docWidth / 2
  ).height;

  setFontColor(doc, pdfConfig.headerFontColor);
  setFontSize(doc, pdfConfig.labelTextSize);
  currentHeight.value += pdfConfig.lineHeight;

  if (props.invoice.additionalRows && props.invoice.additionalRows.length > 0) {
    doc.line(docWidth / 2, currentHeight.value, docWidth - pdfConfig.margin.right, currentHeight.value);
    currentHeight.value += pdfConfig.lineHeight;

    for (const row of props.invoice.additionalRows || []) {
      currentHeight.value += pdfConfig.lineHeight;
      setFontSize(doc, row?.style?.fontSize || pdfConfig.fieldTextSize)

      addText(doc, row.col1 || "", docWidth / 1.5, currentHeight.value, { align: "right" })
      addText(doc, row.col2 || "", docWidth - 5 - pdfConfig.margin.right, currentHeight.value, { align: "right" })
      addText(doc, row.col3 || "", docWidth - pdfConfig.margin.right, currentHeight.value, { align: "right" })
    }

    setFontColor(doc, pdfConfig.headerFontColor)
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    setFontSize(doc, pdfConfig.labelTextSize)

    if (doc.getNumberOfPages() > 1 && props.pageEnable) {
      for (let i = 0; i < doc.getNumberOfPages(); i++) {
        setFontSize(doc, pdfConfig.fieldTextSize - 2)
        setFontColor(doc, pdfConfig.textFontColor)

        if (props.stamp?.inAllPages) {
          addStamp(doc, props, docHeight, pdfConfig);
        }
        addText(doc, props.footer?.text || "", docWidth / 2, docHeight - pdfConfig.margin.bottom, { align: "center", maxWidth: docWidth - pdfConfig.margin.left - pdfConfig.margin.right })
        doc.setPage(i + 1);
        addText(doc, `${props.pageLabel} ${i + 1} ${props.pageDelimiter || '/'} ${doc.getNumberOfPages()}`, docWidth - pdfConfig.margin.right, doc.internal.pageSize.height - 6, { align: "right" }
        )
      }
    }


    addInvoiceDesc(doc, pdfConfig, props, currentHeight, docWidth)

    addStamp(doc, props, docHeight, pdfConfig);

    if (doc.getNumberOfPages() === 1 && props.pageEnable) {
      setFontSize(doc, pdfConfig.fieldTextSize - 2);
      setFontColor(doc, pdfConfig.textFontColor);
      addText(doc, props.footer?.text || "", docWidth / 2, docHeight - pdfConfig.margin.bottom, { align: "center", maxWidth: docWidth - pdfConfig.margin.left - pdfConfig.margin.right })
      addText(doc,
        `${props.pageLabel} 1 ${props.pageDelimiter || '/'} 1`,
        docWidth - pdfConfig.margin.right,
        docHeight - pdfConfig.margin.bottom,
        { align: "right" }
      )
    }

    let returnObj: Partial<ReturnObj> = {
      pagesNumber: doc.getNumberOfPages(),
    };

    if (props.returnJsPDFDocObject) {
      returnObj = {
        ...returnObj,
        jsPDFDocObject: doc,
      };
    }

    return handleSave(doc, props, returnObj);
  }
}

document.getElementById("test")?.addEventListener("click", () => {
  generateInvoice({
    outputType: "pdfjsnewwindow",
    onJsPDFDocCreation: (doc) => {
      console.log(doc);
    },
    returnJsPDFDocObject: true,
    fileName: `Rechnung.pdf`,
    pdfConfig: {
      compress: true,
      orientation: "portrait",
      margin: {
      },
      spacing: {
        afterBusinessInfo: 10,
      }

    },
    logo: {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSVLG1Y6rHkzILk_pauYmH48HjcNC7c94Frg&s",
      type: 'PNG',
      style: {
        width: 16,
        height: 16,
        margin: {
          top: -5
        },
      },
    },
    stamp: {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Rickrolling_QR_code.png",
      style: {
        width: 24,
        height: 24,
      },
      inAllPages: false,
    },
    business: {
      name: "Your Company",
      address: "Your Address",
      phone: "+31 323 83 83 29",
      email: "your@company.com",
      email_1: "your2@companry.com",
      website: "www.company.at",
    },
    client: {
      name: "Client Name",
      address: "Client Address",
      label: "Invoice to:",
      phone: "+31 323 83 83 29",
      otherInfo: "Other info",
      email: "client@email.com",
    },
    pageDelimiter: "/",
    invoice: {
      label: "Invoice #: ",
      invGenDate: `Invoice generated date: ${new Date().toLocaleDateString()}`,
      num: 1,
      invDate: `Invoice date: ${new Date().toLocaleDateString()}`,
      headerBorder: false,
      tableBodyBorder: false,
      header:
        [
          {
            text: "#",
            style: {
              width: 10,
            }
          },
          {
            text: "Product",
            style: {
              width: 40,
            }
          },
          { text: "Price" },
          { text: "Quantity" },
          { text: "Unit" },
          { text: "Total" }
        ],
      table: getTableData(),
      additionalRows: [
        {
          col1: "Subtotal:",
          col2: "45",
          col3: "$",
          style: {
            fontSize: 10
          }
        },
        {
          col1: '+20% Vat:',
          col2: "20",
          col3: "$",
          style: {
            fontSize: 10
          }
        },
        {
          col1: 'Total:',
          col2: "65",
          col3: "$",
          style: {
            fontSize: 12
          }
        },
      ],
      invDesc: "This is a description of the invoice. You can add any information here.",
      invDescLabel: "Invoice Description",
    },
    footer: {
      text: "This is a footer text",
    },
    pageEnable: true,
    pageLabel: "Page",
  })
});

export default generateInvoice;
