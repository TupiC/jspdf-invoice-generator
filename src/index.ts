import { jsPDF, jsPDFOptions } from "jspdf";
import { CurrentHeight, InvoiceProps, ReturnObj } from "./types/invoice.types";
import { addHeight, getPdfConfig, handleSave, splitTextAndGetHeight } from './utils/pdf';
import { addBusinessInfo, addClientAndInvoiceInfo } from './utils/invoice';
import { addTableHeader, getColumnAmount } from './utils/table/header';
import { addTableBody } from './utils/table/body';

let currentHeight: CurrentHeight = { value: 0 };

function jsPDFInvoiceTemplate(props: InvoiceProps) {
  if (!props.invoice?.table || !props.invoice?.header) {
    throw Error("Please provide a table and a header in the invoice object.");
  }
  if (props.invoice?.header.length < 2 || props.invoice?.table[0].length < 2) {
    throw Error("Header and table must contain at least 2 columns.");
  }
  if (props.invoice?.table.length && props.invoice?.table[0].length != props.invoice?.header.length) {
    throw Error("Length of header and table column must be equal.");
  }

  const options: jsPDFOptions = {
    orientation: props.orientation,
    compress: props.compress,
  };

  const doc = new jsPDF(options);
  props.onJsPDFDocCreation && props.onJsPDFDocCreation(doc);
  const docWidth = doc.internal.pageSize.width;
  const docHeight = doc.internal.pageSize.height;
  const pdfConfig = getPdfConfig(props);

  addHeight(currentHeight, pdfConfig.startingAt);

  addBusinessInfo(doc, pdfConfig, currentHeight, docWidth, props);

  if (props.invoice.borderAfterHeader) {
    doc.line(pdfConfig.margin.left, currentHeight.value, docWidth - pdfConfig.margin.right, currentHeight.value);
  }

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

  //#region PAGE BREAKER
  const checkAndAddPageLandscape = () => {
    if (props.orientation === "landscape" && currentHeight.value + invDescSize > 270) {
      doc.addPage();
      currentHeight.value = 10;
    }
  }

  const checkAndAddPagePortrait = (heightLimit = 173) => {
    if (props.orientation === "portrait" && currentHeight.value + invDescSize > heightLimit) {
      doc.addPage();
      currentHeight.value = 10;
    }
  }

  const checkAndAddPage = () => {
    checkAndAddPagePortrait();
    checkAndAddPageLandscape();
  }
  //#endregion

  checkAndAddPage();

  doc.setTextColor(pdfConfig.headerFontColor);
  doc.setFontSize(pdfConfig.labelTextSize);
  currentHeight.value += pdfConfig.lineHeight;

  //#region additionalRows
  if (props.invoice.additionalRows?.length || 0 > 0) {
    //#region Line breaker before invoce total
    doc.line(docWidth / 2, currentHeight.value, docWidth - 10, currentHeight.value);
    currentHeight.value += pdfConfig.lineHeight;
    //#endregion

    for (const row of props.invoice.additionalRows || []) {
      currentHeight.value += pdfConfig.lineHeight;
      doc.setFontSize(row?.style?.fontSize || pdfConfig.fieldTextSize);

      doc.text(row.col1 || "", docWidth / 1.5, currentHeight.value, { align: "right" });
      doc.text(row.col2 || "", docWidth - 25, currentHeight.value, { align: "right" });
      doc.text(row.col3 || "", docWidth - 10, currentHeight.value, { align: "right" });
      checkAndAddPage();
    }
    //#endregion

    checkAndAddPage();

    doc.setTextColor(pdfConfig.headerFontColor);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    doc.setFontSize(pdfConfig.labelTextSize);

    //#region Add num of pages at the bottom
    if (doc.getNumberOfPages() > 1) {
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setFontSize(pdfConfig.fieldTextSize - 2);
        doc.setTextColor(pdfConfig.textFontColor);

        if (props.pageEnable) {
          doc.text(props.footer?.text || "", docWidth / 2, docHeight - pdfConfig.margin.bottom, { align: "center", maxWidth: docWidth - pdfConfig.margin.left - pdfConfig.margin.right });
          doc.setPage(i);
          doc.text(
            props.pageLabel + " " + i + " / " + doc.getNumberOfPages(),
            docWidth - pdfConfig.margin.right,
            doc.internal.pageSize.height - 6
          );
        }

        checkAndAddPagePortrait(183);
        checkAndAddPageLandscape();
        // addStamp();
      }
    }
    //#endregion

    //#region INVOICE DESCRIPTION
    const addInvoiceDesc = () => {
      doc.setFontSize(pdfConfig.labelTextSize);
      doc.setTextColor(pdfConfig.headerFontColor);

      doc.text(props.invoice?.invDescLabel || "", 10, currentHeight.value);
      addHeight(currentHeight, pdfConfig.subLineHeight);
      doc.setTextColor(pdfConfig.textFontColor);
      doc.setFontSize(pdfConfig.fieldTextSize - 1);

      const lines = doc.splitTextToSize(props.invoice?.invDesc || "", docWidth / 2);
      //text in left half
      doc.text(lines, pdfConfig.margin.left, currentHeight.value);
      currentHeight.value +=
        doc.getTextDimensions(lines).h > 5
          ? doc.getTextDimensions(lines).h + 6
          : pdfConfig.lineHeight;

      return currentHeight.value;
    };
    addInvoiceDesc();
    //#endregion

    // addStamp();

    //#region Add num of first page at the bottom
    if (doc.getNumberOfPages() === 1 && props.pageEnable) {
      doc.setFontSize(pdfConfig.fieldTextSize - 2);
      doc.setTextColor(pdfConfig.textFontColor);
      doc.text(props.footer?.text || "", docWidth / 2, docHeight - pdfConfig.margin.bottom, { align: "center", maxWidth: docWidth - pdfConfig.margin.left - pdfConfig.margin.right });
      doc.text(
        props.pageLabel + "1 / 1",
        docWidth - pdfConfig.margin.right,
        docHeight - pdfConfig.margin.bottom,
        { align: "right" }
      );
    }
    //#endregion

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
  jsPDFInvoiceTemplate({
    outputType: "pdfjsnewwindow",
    onJsPDFDocCreation: (doc) => {
      console.log(doc);
    },
    returnJsPDFDocObject: true,
    fileName: `Rechnung.pdf`,
    orientation: "portrait",
    compress: true,
    pdfConfig: {
      margin: {
        left: 20,
      }
    },
    logo: {
      src: "https://res.cloudinary.com/dmowrqef3/image/upload/v1733485063/logo_light_512_6baddaae81.png",
      type: 'PNG',
      style: {
        width: 42,
        height: 42,
        margin: {
          top: -8,
          left: -8,
        }
      },
    },
    stamp: {
      inAllPages: false,
    },
    business: {
      name: "Gourmet-Jausen",
      address: "8962 Gröbming, Wiesackstraße 1020",
      phone: "+43 660 85 70 879",
      email: "office@gourmet-jausen.at",
      email_1: "",
      website: "www.gourmet-jausen.at",
    },
    client: {
      name: "fullName",
      address: "address",
      label: "hallo label",
      phone: "phone",
      email: "data.email",
    },
    invoice: {
      label: "Rechnung #: ",
      num: 1,
      invDate: `Rechnungsdatum:`,
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
            text: "Produkt",
            style: {
              width: 40,
            }
          },
          {
            text: "Preis",
            style: {
              align: 'right',
            }
          },
          { text: "Menge" },
          { text: "Einheit" },
          { text: "Gesamt" }
        ],
      table: [[{
        text: "1",
      }, {
        text: "Käse",
      }, {
        text: "€ 10",
      }, {
        text: "2",
      }, {
        text: "Stk",
      }, {
        text: "€ 20",
      }
      ],
      [{
        text: "2",
      }, {
        text: "Käse",
      }, {
        text: "€ 10",
      }, {
        text: "2",
      }, {
        text: "Stk",
      }, {
        text: "€ 20",
      }
      ],
      ],
      additionalRows: [
        {
          col1: 'Zwischensumme:',
          col2: "100",
          style: {
            fontSize: 10 //optional, default 12
          }
        },
        {
          col1: 'Versandkosten:',
          col2: `+20`,
          col3: "€",
          style: {
            fontSize: 10 //optional, default 12
          }
        },
        {
          col1: 'Gesamtkosten:',
          col2: "40",
          style: {
            fontSize: 12 //optional, default 12
          }
        },
      ],
      invDesc: "Hinweis: Umsatzsteuerbefreit gemäß § 6 Abs. 1 Z 27 UStG\n\nBitte überweisen Sie den Betrag innerhalb von 14 Tagen auf das Konto: Gourmet-Jausen, AT123456789012345678, BIC: ABCDEFKH",
      invDescLabel: ''
    },
    footer: {
      text: "Für weitere Informationen kontaktieren Sie uns bitte unter den oben angegebenen Kontaktdaten.",
    },
    pageEnable: true,
    pageLabel: "Seite ",
  })
});
export default jsPDFInvoiceTemplate;
