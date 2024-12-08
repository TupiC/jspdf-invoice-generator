import { jsPDF, jsPDFOptions } from "jspdf";
import { CurrentHeight, InvoiceProps, ReturnObj } from "./types/invoice.types";
import { addHeight, addText, getPdfConfig, handleSave, setFontColor, setFontSize, splitTextAndGetHeight } from './utils/pdf';
import { addBusinessInfo, addClientAndInvoiceInfo, addInvoiceDesc } from './utils/invoice';
import { addTableHeader, getColumnAmount } from './utils/table/header';
import { addTableBody } from './utils/table/body';


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

  let currentHeight: CurrentHeight = { value: 0 };

  const options: jsPDFOptions = {
    orientation: props.pdfConfig?.orientation,
    compress: props.pdfConfig?.compress,
  };

  const doc = new jsPDF(options);
  props.onJsPDFDocCreation && props.onJsPDFDocCreation(doc);
  console.log(doc.getPageInfo(1))
  const docWidth = doc.internal.pageSize.width;
  const docHeight = doc.internal.pageSize.height;
  const pdfConfig = getPdfConfig(props);

  addHeight(currentHeight, pdfConfig.margin.top);
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

  const checkAndAddPageLandscape = () => {
    if (pdfConfig.orientation === "landscape" && currentHeight.value + invDescSize > 270) {
      doc.addPage();
      currentHeight.value = 10;
    }
  }

  const checkAndAddPagePortrait = (heightLimit = 173) => {
    if (pdfConfig.orientation === "portrait" && currentHeight.value + invDescSize > heightLimit) {
      doc.addPage();
      currentHeight.value = 10;
    }
  }

  const checkAndAddPage = () => {
    checkAndAddPagePortrait();
    checkAndAddPageLandscape();
  }

  checkAndAddPage();

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
      checkAndAddPage();
    }

    checkAndAddPage();

    setFontColor(doc, pdfConfig.headerFontColor)
    addHeight(currentHeight, pdfConfig.subLineHeight);
    addHeight(currentHeight, pdfConfig.subLineHeight);
    setFontSize(doc, pdfConfig.labelTextSize)

    if (doc.getNumberOfPages() > 1) {
      for (let i = 0; i < doc.getNumberOfPages(); i++) {
        setFontSize(doc, pdfConfig.fieldTextSize - 2)
        setFontColor(doc, pdfConfig.textFontColor)

        if (props.pageEnable) {
          addText(doc, props.footer?.text || "", docWidth / 2, docHeight - pdfConfig.margin.bottom, { align: "center", maxWidth: docWidth - pdfConfig.margin.left - pdfConfig.margin.right })
          doc.setPage(i + 1);
          addText(doc, `${props.pageLabel} ${i + 1} ${props.pageDelimiter || '/'} ${doc.getNumberOfPages()}`, docWidth - pdfConfig.margin.right, doc.internal.pageSize.height - 6)
        }

        checkAndAddPagePortrait(183);
        checkAndAddPageLandscape();
      }
    }


    addInvoiceDesc(doc, pdfConfig, props, currentHeight, docWidth)

    // addStamp(); //TODO

    //#region Add num of first page at the bottom
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
    pdfConfig: {
      compress: true,
      orientation: "portrait",
      margin: {
        right: 20,
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
      name: "Test",
      address: "8962 Gröbming, Wiesackstraße 1020",
      phone: "+43 660 85 70 879",
      email: "office@test.at",
      email_1: "",
      website: "www.test.at",
    },
    client: {
      name: "fullName",
      address: "address",
      label: "hallo label",
      phone: "phone",
      email: "data.email",
    },
    pageDelimiter: "/",
    invoice: {
      label: "Rechnung #: ",
      num: 1,
      invDate: `Rechnungsdatum:`,
      headerBorder: true,
      tableBodyBorder: true,
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
      table: [[
        { text: "1" },
        {
          text: `Produkt 1`,
          style: {
            align: 'left',
          }
        },
        {
          text: `10`,
          style: {
            align: 'right',
          }
        },
        { text: `1` },
        { text: `Stk` },
        {
          text: `10`,
          style: {
            align: 'right',
          }
        }
      ], [
        { text: "1" },
        {
          text: `Produkt 1`,
          style: {
            align: 'left',
          }
        },
        {
          text: `10`,
          style: {
            align: 'right',
          }
        },
        { text: `1` },
        { text: `Stk` },
        {
          text: `10`,
          style: {
            align: 'right',
          }
        }
      ]],
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
      invDesc: "Hinweis: Umsatzsteuerbefreit gemäß § 6 Abs. 1 Z 27 UStG. Bitte überweisen Sie den Betrag innerhalb von 14 Tagen auf das Konto: Test, AT123456789012345678, BIC: ABCDEFKH",
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
