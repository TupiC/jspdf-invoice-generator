import { jsPDF, jsPDFOptions } from "jspdf";
import { InvoiceProps, ReturnObj } from "./types/invoice.types";
import { addText, getPdfConfig, splitTextAndGetHeight } from './utils';

function jsPDFInvoiceTemplate(props: InvoiceProps) {
  if (!props.invoice?.table || !props.invoice?.header) {
    throw Error("Please provide a table and a header in the invoice object.");
  }
  if (props.invoice?.table.length && props.invoice?.table[0].entries.length != props.invoice?.header.entries.length) {
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

  let currentHeight = pdfConfig.startingAt;

  doc.setFontSize(pdfConfig.headerTextSize);
  doc.setTextColor(pdfConfig.headerFontColor);
  doc.text(props.business?.name || "", docWidth - pdfConfig.margin.right, currentHeight, { align: "right" });
  doc.setFontSize(pdfConfig.fieldTextSize);

  if (props.logo?.src) {
    const imageHeader: HTMLImageElement = new Image();
    imageHeader.src = props.logo.src;

    if (props.logo.type)
      doc.addImage(
        imageHeader,
        props.logo.type,
        pdfConfig.margin.left + (props.logo.style?.margin?.left || 0),
        currentHeight - 5 + (props.logo.style?.margin?.top || 0),
        props.logo.style?.width || 64,
        props.logo.style?.height || 64
      );
    else
      doc.addImage(
        imageHeader,
        pdfConfig.margin.left + (props.logo.style?.margin?.left || 0),
        currentHeight - 5 + (props.logo.style?.margin?.top || 0),
        props.logo.style?.width || 64,
        props.logo.style?.height || 64
      );
  }

  doc.setTextColor(pdfConfig.textFontColor);

  currentHeight += pdfConfig.subLineHeight * 2;

  doc.text(props.business?.address || "", docWidth - pdfConfig.margin.right, currentHeight, { align: "right" });
  currentHeight += pdfConfig.subLineHeight;
  doc.text(props.business?.phone || "", docWidth - pdfConfig.margin.right, currentHeight, { align: "right" });
  doc.setFontSize(pdfConfig.fieldTextSize);
  currentHeight += pdfConfig.subLineHeight;
  doc.text(props.business?.email || "", docWidth - pdfConfig.margin.right, currentHeight, { align: "right" });
  currentHeight += pdfConfig.subLineHeight;

  if (props.business?.email_1) {
    doc.text(props.business?.email_1 || "", docWidth - pdfConfig.margin.right, currentHeight, { align: "right" });
    currentHeight += pdfConfig.subLineHeight;
  }

  doc.text(props.business?.website || "", docWidth - pdfConfig.margin.right, currentHeight, { align: "right" });

  currentHeight += pdfConfig.spacing.afterBusinessInfo;

  if (props.invoice.borderAfterHeader) {
    doc.line(pdfConfig.margin.left, currentHeight, docWidth - pdfConfig.margin.right, currentHeight);
  }

  //client part
  doc.setTextColor(pdfConfig.textFontColor);
  doc.setFontSize(pdfConfig.fieldTextSize);
  currentHeight += pdfConfig.lineHeight;
  if (props.client?.label) {
    doc.text(props.client.label, pdfConfig.margin.left, currentHeight);
    currentHeight += pdfConfig.lineHeight;
  }

  doc.setTextColor(pdfConfig.headerFontColor);
  doc.setFontSize(pdfConfig.headerTextSize - 5);

  if (props.client?.name) {
    doc.text(props.client?.name, pdfConfig.margin.left, currentHeight);
    // currentHeight += pdfConfig.lineHeight;
  }

  if (props.invoice?.label && props.invoice?.num) {
    doc.text(
      props.invoice.label + props.invoice.num,
      docWidth - pdfConfig.margin.right,
      currentHeight,
      { align: "right" }
    );
    currentHeight += pdfConfig.lineHeight;
  }

  doc.setTextColor(pdfConfig.textFontColor);
  doc.setFontSize(pdfConfig.fieldTextSize - 2);

  if (props.client?.address || props.invoice?.invDate) {
    addText(doc, props.client?.address, pdfConfig.margin.left, currentHeight)
    addText(doc, props.invoice?.invDate, docWidth - pdfConfig.margin.right, currentHeight, { align: "right" })
    currentHeight += pdfConfig.subLineHeight;
  }

  if (props.client?.phone || props.invoice?.invGenDate) {
    addText(doc, props.client?.phone, pdfConfig.margin.left, currentHeight)
    addText(doc, props.invoice?.invGenDate, docWidth - pdfConfig.margin.right, currentHeight, { align: "right" })
    currentHeight += pdfConfig.subLineHeight;
  }

  if (props.client?.email) {
    doc.text(props.client.email, pdfConfig.margin.left, currentHeight);
    currentHeight += pdfConfig.subLineHeight;
  }


  if (props.client?.otherInfo) {
    doc.text(props.client.otherInfo, pdfConfig.margin.left, currentHeight);
  }
  else {
    currentHeight -= pdfConfig.subLineHeight
  }
  //end contact part

  currentHeight += pdfConfig.spacing.beforeTable;

  //TABLE PART

  const columnAmount = props.invoice?.header.length || 1;

  let tdWidth = (docWidth - (pdfConfig.margin.left + pdfConfig.margin.right)) / columnAmount;

  //#region TD WIDTH
  if (columnAmount > 2) { //add style for 2 or more columns
    const customColumnNo = props.invoice.header.map(x => x?.style?.width || 0).filter(x => x > 0);
    let customWidthOfAllColumns = customColumnNo.reduce((a, b) => a + b, 0);
    tdWidth = (docWidth - 20 - customWidthOfAllColumns) / (props.invoice.header.length - customColumnNo.length);
  }
  //#endregion

  //#region TABLE HEADER BORDER
  const addTableHeaderBorder = () => {
    currentHeight += 2;
    const lineHeight = 7;
    let startWidth = 0;

    if (!props.invoice?.header) {
      return;
    }
    for (let i = 0; i < props.invoice.header?.length; i++) {
      const currentTdWidth = props.invoice.header[i]?.style?.width || tdWidth;
      if (i === 0) {
        doc.rect(pdfConfig.margin.left, currentHeight, currentTdWidth, lineHeight);
      } else {
        const previousTdWidth = props.invoice.header[i - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.rect(startWidth + pdfConfig.margin.left, currentHeight, currentTdWidth, lineHeight);
      }
    }
    currentHeight -= 2;
  };
  //#endregion

  //#region TABLE BODY BORDER
  const addTableBodyBorder = (lineHeight: number) => {
    let startWidth = 0;

    if (!props.invoice?.header) {
      return;
    }

    for (let i = 0; i < props.invoice.header.length; i++) {
      const currentTdWidth = props.invoice.header[i].style?.width || tdWidth;
      if (i === 0) {
        doc.rect(pdfConfig.margin.left, currentHeight, currentTdWidth, lineHeight);
      } else {
        const previousTdWidth = props.invoice.header[i - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.rect(startWidth + pdfConfig.margin.left, currentHeight, currentTdWidth, lineHeight);
      }
    }
  };
  //#endregion

  //#region TABLE HEADER
  const addTableHeader = () => {
    if (props.invoice?.headerBorder) {
      addTableHeaderBorder();
    }

    currentHeight += pdfConfig.subLineHeight;
    doc.setTextColor(pdfConfig.headerFontColor);
    doc.setFontSize(pdfConfig.fieldTextSize);
    doc.setDrawColor(pdfConfig.textFontColor);

    currentHeight += 2;

    let startWidth = 0;

    props.invoice?.header?.forEach((row, index) => {
      if (index == 0) {
        doc.text(row.text, pdfConfig.margin.left, currentHeight);
      }
      else {
        const currentTdWidth = row?.style?.width || tdWidth;
        if (!props.invoice?.header) {
          return;
        }
        const previousTdWidth = props.invoice?.header[index - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.text(row.text, startWidth + pdfConfig.margin.left, currentHeight);
      }
    });

    currentHeight += pdfConfig.subLineHeight - 1;
    doc.setTextColor(pdfConfig.textFontColor);
  };
  //#endregion

  addTableHeader();

  //#region TABLE BODY
  const tableBodyLength = props.invoice.table.length;
  props.invoice.table.forEach((row, index) => {
    doc.line(pdfConfig.margin.left, currentHeight, docWidth - pdfConfig.margin.right, currentHeight);

    const getRowsHeight = () => {
      let rowsHeight: number[] = [];
      row.forEach((entry, index: number) => {
        if (!props.invoice?.header) {
          return;
        }

        const widthToUse = props.invoice?.header[index].style?.width || tdWidth;

        let item = splitTextAndGetHeight(doc, entry.text, widthToUse - 1);
        rowsHeight.push(item.height + 1);
      });

      return rowsHeight;
    };

    const maxHeight = Math.max(...getRowsHeight());

    //body borders
    if (props.invoice?.tableBodyBorder) {
      addTableBodyBorder(maxHeight + 1);
    }

    let startWidth = 0;
    row.forEach((entry, index) => {
      if (!props.invoice?.header) {
        return;
      }
      const widthToUse = props.invoice?.header[index].style?.width || tdWidth;

      let item = splitTextAndGetHeight(doc, entry.text, widthToUse - 1);

      if (index == 0) {
        doc.text(item.text, pdfConfig.margin.left + 1, currentHeight + 4);
      } else {
        const currentTdWidth = entry.style?.width || tdWidth;
        const previousTdWidth = props.invoice?.header[index - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.text(item.text, pdfConfig.margin.left + 1 + startWidth, currentHeight + 4);
      }
    });

    currentHeight += maxHeight - 4;

    //td border height
    currentHeight += 5;

    //pre-increase currentHeight to check the height based on next row
    if (index + 1 < tableBodyLength) currentHeight += maxHeight;

    if (
      props.orientation &&
      (currentHeight > 185 ||
        (currentHeight > 178 && doc.getNumberOfPages() > 1))
    ) {
      doc.addPage();
      currentHeight = 10;
      if (index + 1 < tableBodyLength) addTableHeader();
    }

    if (!props.orientation && (currentHeight > 265 || (currentHeight > 255 && doc.getNumberOfPages() > 1))) {
      doc.addPage();
      currentHeight = 10;
      if (index + 1 < tableBodyLength) {
        addTableHeader();
      }
    }

    if (index + 1 < tableBodyLength && currentHeight > 30) {
      currentHeight -= maxHeight;
    }
  });
  //#endregion

  const invDescSize = splitTextAndGetHeight(doc,
    props.invoice.invDesc || "",
    docWidth / 2
  ).height;

  //#region PAGE BREAKER
  const checkAndAddPageLandscape = () => {
    if (props.orientation === "landscape" && currentHeight + invDescSize > 270) {
      doc.addPage();
      currentHeight = 10;
    }
  }

  const checkAndAddPagePortrait = (heightLimit = 173) => {
    if (props.orientation === "portrait" && currentHeight + invDescSize > heightLimit) {
      doc.addPage();
      currentHeight = 10;
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
  currentHeight += pdfConfig.lineHeight;

  //#region additionalRows
  if (props.invoice.additionalRows?.length || 0 > 0) {
    //#region Line breaker before invoce total
    doc.line(docWidth / 2, currentHeight, docWidth - 10, currentHeight);
    currentHeight += pdfConfig.lineHeight;
    //#endregion

    for (const row of props.invoice.additionalRows || []) {
      currentHeight += pdfConfig.lineHeight;
      doc.setFontSize(row?.style?.fontSize || pdfConfig.fieldTextSize);

      doc.text(row.col1 || "", docWidth / 1.5, currentHeight, { align: "right" });
      doc.text(row.col2 || "", docWidth - 25, currentHeight, { align: "right" });
      doc.text(row.col3 || "", docWidth - 10, currentHeight, { align: "right" });
      checkAndAddPage();
    }
    //#endregion

    checkAndAddPage();

    doc.setTextColor(pdfConfig.headerFontColor);
    currentHeight += pdfConfig.subLineHeight;
    currentHeight += pdfConfig.subLineHeight;
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

      doc.text(props.invoice?.invDescLabel || "", 10, currentHeight);
      currentHeight += pdfConfig.subLineHeight;
      doc.setTextColor(pdfConfig.textFontColor);
      doc.setFontSize(pdfConfig.fieldTextSize - 1);

      const lines = doc.splitTextToSize(props.invoice?.invDesc || "", docWidth / 2);
      //text in left half
      doc.text(lines, pdfConfig.margin.left, currentHeight);
      currentHeight +=
        doc.getTextDimensions(lines).h > 5
          ? doc.getTextDimensions(lines).h + 6
          : pdfConfig.lineHeight;

      return currentHeight;
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
      case "datauristring":
        returnObj = {
          ...returnObj,
          dataUriString: doc.output("datauristring", {
            filename: props.fileName,
          }),
        };
        break;
      case "arraybuffer":
        returnObj = {
          ...returnObj,
          arrayBuffer: doc.output("arraybuffer"),
        };
        break;
      default:
        doc.output("dataurlnewwindow", {
          filename: props.fileName,
        });
    }

    return returnObj;
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
