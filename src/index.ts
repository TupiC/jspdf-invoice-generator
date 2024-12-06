import { jsPDF, jsPDFOptions } from "jspdf";
import { InvoiceProps, ReturnObj } from "./types/invoice.types";

function jsPDFInvoiceTemplate(props: InvoiceProps) {
  const param: InvoiceProps = {
    outputType: props.outputType || "save",
    onJsPDFDocCreation: props.onJsPDFDocCreation,
    returnJsPDFDocObject: props.returnJsPDFDocObject || false,
    fileName: props.fileName || "",
    orientationLandscape: props.orientationLandscape || false,
    pdfConfig: {
      headerTextSize: props.pdfConfig?.headerTextSize || 20,
      labelTextSize: props.pdfConfig?.labelTextSize || 12,
      fieldTextSize: props.pdfConfig?.fieldTextSize || 10,
      lineHeight: props.pdfConfig?.lineHeight || 6,
      subLineHeight: props.pdfConfig?.subLineHeight || 4,
      headerFontColor: props.pdfConfig?.headerFontColor || "#000000",
      textFontColor: props.pdfConfig?.textFontColor || "#4d4e53",
    },
    compress: props.compress || false,
    logo: {
      src: props.logo?.src || "",
      type: props.logo?.type || "",
      style: {
        width: props.logo?.style?.width || 0,
        height: props.logo?.style?.width || 0,
        margin: {
          top: props.logo?.style?.margin?.top || 0,
          left: props.logo?.style?.margin?.left || 0,
        }
      },
    },
    stamp: {
      inAllPages: props.stamp?.inAllPages || false,
      src: props.stamp?.src || "",
      style: {
        width: props.stamp?.style?.width || 0,
        height: props.stamp?.style?.height || 0,
        margin: {
          top: props.stamp?.style?.margin?.top || 0,
          left: props.stamp?.style?.margin?.left || 0,
        },
      }
    },
    business: {
      name: props.business?.name || "",
      address: props.business?.address || "",
      phone: props.business?.phone || "",
      email: props.business?.email || "",
      email_1: props.business?.email_1 || "",
      website: props.business?.website || "",
    },
    contact: {
      label: props.contact?.label || "",
      name: props.contact?.name || "",
      address: props.contact?.address || "",
      phone: props.contact?.phone || "",
      email: props.contact?.email || "",
      otherInfo: props.contact?.otherInfo || "",
    },
    invoice: {
      label: props.invoice?.label || "",
      num: props.invoice?.num || 0,
      invDate: props.invoice?.invDate || "",
      invGenDate: props.invoice?.invGenDate || "",
      headerBorder: props.invoice?.headerBorder || false,
      tableBodyBorder: props.invoice?.tableBodyBorder || false,
      header: props.invoice?.header || [],
      table: props.invoice?.table || [],
      invDescLabel: props.invoice?.invDescLabel || "",
      invDesc: props.invoice?.invDesc || "",
      additionalRows: props.invoice?.additionalRows?.map(x => {
        return {
          col1: x?.col1 || "",
          col2: x?.col2 || "",
          col3: x?.col3 || "",
          style: {
            fontSize: x?.style?.fontSize || 12,
          }
        }
      })
    },
    footer: {
      text: props.footer?.text || "",
    },
    pageEnable: props.pageEnable || false,
    pageLabel: props.pageLabel || "Page",
  };

  const splitTextAndGetHeight = (text: string, size: number) => {
    var lines = doc.splitTextToSize(text, size);
    return {
      text: lines,
      height: doc.getTextDimensions(lines).h,
    };
  };
  if (param.invoice?.table && param.invoice?.table.length) {
    if (param.invoice?.table[0].length != param.invoice?.header?.length)
      throw Error("Length of header and table column must be equal.");
  }

  const options: jsPDFOptions = {
    orientation: param.orientationLandscape ? "landscape" : "portrait",
    compress: param.compress
  };

  var doc = new jsPDF(options);
  props.onJsPDFDocCreation && props.onJsPDFDocCreation(doc);

  var docWidth = doc.internal.pageSize.width;
  var docHeight = doc.internal.pageSize.height;

  //starting at 15mm
  var currentHeight = 15;

  doc.setFontSize(param.pdfConfig.headerTextSize);
  doc.setTextColor(param.pdfConfig.headerFontColor);
  doc.text(param.business.name, docWidth - 10, currentHeight, { align: "right" });
  doc.setFontSize(param.pdfConfig.fieldTextSize);

  if (param.logo?.src) {
    let imageHeader: HTMLImageElement = new Image();
    if (typeof window === "undefined") {
      imageHeader.src = param.logo.src;
    } else {
      imageHeader = new Image();
      imageHeader.src = param.logo.src;
    }

    if (param.logo.type)
      doc.addImage(
        imageHeader,
        param.logo.type,
        10 + (param.logo.style?.margin?.left || 0),
        currentHeight - 5 + (param.logo.style?.margin?.top || 0),
        param.logo.style?.width || 0,
        param.logo.style?.height || 0
      );
    else
      doc.addImage(
        imageHeader,
        10 + (param.logo.style?.margin?.left || 0),
        currentHeight - 5 + (param.logo.style?.margin?.top || 0),
        param.logo.style?.width || 0,
        param.logo.style?.height || 0
      );
  }

  doc.setTextColor(param.pdfConfig.textFontColor);

  currentHeight += param.pdfConfig.subLineHeight;
  currentHeight += param.pdfConfig.subLineHeight;
  doc.text(param.business.address, docWidth - 10, currentHeight, { align: "right" });
  currentHeight += param.pdfConfig.subLineHeight;
  doc.text(param.business.phone, docWidth - 10, currentHeight, { align: "right" });
  doc.setFontSize(param.pdfConfig.fieldTextSize);
  currentHeight += param.pdfConfig.subLineHeight;
  doc.text(param.business.email, docWidth - 10, currentHeight, { align: "right" });

  currentHeight += param.pdfConfig.subLineHeight;
  doc.text(param.business.email_1, docWidth - 10, currentHeight, { align: "right" });

  currentHeight += param.pdfConfig.subLineHeight;
  doc.text(param.business.website, docWidth - 10, currentHeight, { align: "right" });

  //line breaker after logo & business info
  if (param.invoice.header.length) {
    currentHeight += param.pdfConfig.subLineHeight;
    doc.line(10, currentHeight, docWidth - 10, currentHeight);
  }

  //Contact part
  doc.setTextColor(param.pdfConfig.textFontColor);
  doc.setFontSize(param.pdfConfig.fieldTextSize);
  currentHeight += param.pdfConfig.lineHeight;
  if (param.contact.label) {
    doc.text(param.contact.label, 10, currentHeight);
    currentHeight += param.pdfConfig.lineHeight;
  }

  doc.setTextColor(param.pdfConfig.headerFontColor);
  doc.setFontSize(param.pdfConfig.headerTextSize - 5);
  if (param.contact.name) doc.text(param.contact.name, 10, currentHeight);

  if (param.invoice.label && param.invoice.num) {
    doc.text(
      param.invoice.label + param.invoice.num,
      docWidth - 10,
      currentHeight,
      { align: "right" }
    );
  }

  if (param.contact.name || (param.invoice.label && param.invoice.num))
    currentHeight += param.pdfConfig.subLineHeight;

  doc.setTextColor(param.pdfConfig.textFontColor);
  doc.setFontSize(param.pdfConfig.fieldTextSize - 2);

  if (param.contact.address || param.invoice.invDate) {
    doc.text(param.contact.address, 10, currentHeight);
    doc.text(param.invoice.invDate, docWidth - 10, currentHeight, { align: "right" });
    currentHeight += param.pdfConfig.subLineHeight;
  }

  if (param.contact.phone || param.invoice.invGenDate) {
    doc.text(param.contact.phone, 10, currentHeight);
    doc.text(param.invoice.invGenDate || "", docWidth - 10, currentHeight, { align: "right" });
    currentHeight += param.pdfConfig.subLineHeight;
  }

  if (param.contact.email) {
    doc.text(param.contact.email, 10, currentHeight);
    currentHeight += param.pdfConfig.subLineHeight;
  }

  if (param.contact.otherInfo)
    doc.text(param.contact.otherInfo, 10, currentHeight);
  else currentHeight -= param.pdfConfig.subLineHeight;
  //end contact part

  //TABLE PART
  //var tdWidth = 31.66;
  //10 margin left - 10 margin right
  var tdWidth = (docWidth - 20) / param.invoice.header.length;

  //#region TD WIDTH
  if (param.invoice.header.length > 2) { //add style for 2 or more columns
    const customColumnNo = param.invoice.header.map(x => x?.style?.width || 0).filter(x => x > 0);
    let customWidthOfAllColumns = customColumnNo.reduce((a, b) => a + b, 0);
    tdWidth = (docWidth - 20 - customWidthOfAllColumns) / (param.invoice.header.length - customColumnNo.length);
  }
  //#endregion

  //#region TABLE HEADER BORDER
  var addTableHeaderBorder = () => {
    currentHeight += 2;
    const lineHeight = 7;
    let startWidth = 0;
    for (let i = 0; i < param.invoice.header.length; i++) {
      const currentTdWidth = param.invoice.header[i]?.style?.width || tdWidth;
      if (i === 0) doc.rect(10, currentHeight, currentTdWidth, lineHeight);
      else {
        const previousTdWidth = param.invoice.header[i - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.rect(startWidth + 10, currentHeight, currentTdWidth, lineHeight);
      }
    }
    currentHeight -= 2;
  };
  //#endregion

  //#region TABLE BODY BORDER
  var addTableBodyBorder = (lineHeight: number) => {
    let startWidth = 0;
    for (let i = 0; i < param.invoice.header.length; i++) {
      const currentTdWidth = param.invoice.header[i]?.style?.width || tdWidth;
      if (i === 0) doc.rect(10, currentHeight, currentTdWidth, lineHeight);
      else {
        const previousTdWidth = param.invoice.header[i - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.rect(startWidth + 10, currentHeight, currentTdWidth, lineHeight);
      }
    }
  };
  //#endregion

  //#region TABLE HEADER
  var addTableHeader = () => {
    if (param.invoice.headerBorder) addTableHeaderBorder();

    currentHeight += param.pdfConfig.subLineHeight;
    doc.setTextColor(param.pdfConfig.headerFontColor);
    doc.setFontSize(param.pdfConfig.fieldTextSize);
    //border color
    doc.setDrawColor(param.pdfConfig.textFontColor);
    currentHeight += 2;

    let startWidth = 0;
    param.invoice.header.forEach(function (row, index) {
      if (index == 0) doc.text(row.title, 11, currentHeight);
      else {
        const currentTdWidth = row?.style?.width || tdWidth;
        const previousTdWidth = param.invoice.header[index - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.text(row.title, startWidth + 11, currentHeight);
      }
    });

    currentHeight += param.pdfConfig.subLineHeight - 1;
    doc.setTextColor(param.pdfConfig.textFontColor);
  };
  //#endregion

  addTableHeader();

  //#region TABLE BODY
  var tableBodyLength = param.invoice.table.length;
  param.invoice.table.forEach((row: any[], index: number) => {
    doc.line(10, currentHeight, docWidth - 10, currentHeight);

    //get nax height for the current row
    var getRowsHeight = function () {
      let rowsHeight: number[] = [];
      row.forEach((rr, index: number) => {
        const widthToUse = param.invoice.header[index]?.style?.width || tdWidth;

        let item = splitTextAndGetHeight(rr.toString(), widthToUse - 1); //minus 1, to fix the padding issue between borders
        rowsHeight.push(item.height + 2);
      });

      return rowsHeight;
    };

    var maxHeight = Math.max(...getRowsHeight());

    //body borders
    if (param.invoice.tableBodyBorder) addTableBodyBorder(maxHeight + 1);

    let startWidth = 0;
    row.forEach((rr, index) => {
      const widthToUse = param.invoice.header[index]?.style?.width || tdWidth;
      let item = splitTextAndGetHeight(rr.toString(), widthToUse - 1); //minus 1, to fix the padding issue between borders

      if (index == 0) doc.text(item.text, 11, currentHeight + 4);
      else {
        const currentTdWidth = rr?.style?.width || tdWidth;
        const previousTdWidth = param.invoice.header[index - 1]?.style?.width || tdWidth;
        const widthToUse = currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.text(item.text, 11 + startWidth, currentHeight + 4);
      }
    });

    currentHeight += maxHeight - 4;

    //td border height
    currentHeight += 5;

    //pre-increase currentHeight to check the height based on next row
    if (index + 1 < tableBodyLength) currentHeight += maxHeight;

    if (
      param.orientationLandscape &&
      (currentHeight > 185 ||
        (currentHeight > 178 && doc.getNumberOfPages() > 1))
    ) {
      doc.addPage();
      currentHeight = 10;
      if (index + 1 < tableBodyLength) addTableHeader();
    }

    if (
      !param.orientationLandscape &&
      (currentHeight > 265 ||
        (currentHeight > 255 && doc.getNumberOfPages() > 1))
    ) {
      doc.addPage();
      currentHeight = 10;
      if (index + 1 < tableBodyLength) addTableHeader();
      //else
      //currentHeight += param.pdfConfig.subLineHeight + 2 + param.pdfConfig.subLineHeight - 1; //same as in addtableHeader
    }

    //reset the height that was increased to check the next row
    if (index + 1 < tableBodyLength && currentHeight > 30)
      // check if new page
      currentHeight -= maxHeight;
  });
  //doc.line(10, currentHeight, docWidth - 10, currentHeight); //if we want to show the last table line 
  //#endregion

  var invDescSize = splitTextAndGetHeight(
    param.invoice.invDesc || "",
    docWidth / 2
  ).height;

  //#region PAGE BREAKER
  var checkAndAddPageLandscape = function () {
    if (!param.orientationLandscape && currentHeight + invDescSize > 270) {
      doc.addPage();
      currentHeight = 10;
    }
  }

  var checkAndAddPageNotLandscape = function (heightLimit = 173) {
    if (param.orientationLandscape && currentHeight + invDescSize > heightLimit) {
      doc.addPage();
      currentHeight = 10;
    }
  }
  var checkAndAddPage = function () {
    checkAndAddPageNotLandscape();
    checkAndAddPageLandscape();
  }
  //#endregion

  //#region Stamp
  var addStamp = () => {
    let _addStampBase = () => {
      let stampImage: HTMLImageElement = new Image();
      if (typeof window === "undefined") {
        stampImage.src = param.stamp.src || "";
      } else {
        stampImage = new Image();
        stampImage.src = param.stamp.src || "";
      }

      if (param.stamp.type)
        doc.addImage(
          stampImage,
          param.stamp.type,
          10 + (param.stamp.style?.margin?.left || 0),
          docHeight - 22 + (param.stamp.style?.margin?.top || 0),
          param.stamp.style?.width || 0,
          param.stamp.style?.height || 0
        );
      else
        doc.addImage(
          stampImage,
          10 + (param.stamp.style?.margin?.left || 0),
          docHeight - 22 + (param.stamp.style?.margin?.top || 0),
          param.stamp.style?.width || 0,
          param.stamp.style?.height || 0
        );
    };

    if (param.stamp.src) {
      if (param.stamp.inAllPages)
        _addStampBase();
      else if (!param.stamp.inAllPages && doc.getCurrentPageInfo().pageNumber == doc.getNumberOfPages())
        _addStampBase();
    }
  }
  //#endregion

  checkAndAddPage();

  doc.setTextColor(param.pdfConfig.headerFontColor);
  doc.setFontSize(param.pdfConfig.labelTextSize);
  currentHeight += param.pdfConfig.lineHeight;

  //#region additionalRows
  if (param.invoice.additionalRows?.length || 0 > 0) {
    //#region Line breaker before invoce total
    doc.line(docWidth / 2, currentHeight, docWidth - 10, currentHeight);
    currentHeight += param.pdfConfig.lineHeight;
    //#endregion

    for (const row of param.invoice.additionalRows || []) {
      currentHeight += param.pdfConfig.lineHeight;
      doc.setFontSize(row?.style?.fontSize || param.pdfConfig.fieldTextSize);

      doc.text(row.col1 || "", docWidth / 1.5, currentHeight, { align: "right" });
      doc.text(row.col2 || "", docWidth - 25, currentHeight, { align: "right" });
      doc.text(row.col3 || "", docWidth - 10, currentHeight, { align: "right" });
      checkAndAddPage();
    }
    //#endregion

    checkAndAddPage();

    doc.setTextColor(param.pdfConfig.headerFontColor);
    currentHeight += param.pdfConfig.subLineHeight;
    currentHeight += param.pdfConfig.subLineHeight;
    doc.setFontSize(param.pdfConfig.labelTextSize);

    //#region Add num of pages at the bottom
    if (doc.getNumberOfPages() > 1) {
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setFontSize(param.pdfConfig.fieldTextSize - 2);
        doc.setTextColor(param.pdfConfig.textFontColor);

        if (param.pageEnable) {
          doc.text(param.footer.text, docWidth / 2, docHeight - 10, { align: "center" });
          doc.setPage(i);
          doc.text(
            param.pageLabel + " " + i + " / " + doc.getNumberOfPages(),
            docWidth - 20,
            doc.internal.pageSize.height - 6
          );
        }

        checkAndAddPageNotLandscape(183);
        checkAndAddPageLandscape();
        addStamp();
      }
    }
    //#endregion

    //#region INVOICE DESCRIPTION
    var addInvoiceDesc = () => {
      doc.setFontSize(param.pdfConfig.labelTextSize);
      doc.setTextColor(param.pdfConfig.headerFontColor);

      doc.text(param.invoice.invDescLabel, 10, currentHeight);
      currentHeight += param.pdfConfig.subLineHeight;
      doc.setTextColor(param.pdfConfig.textFontColor);
      doc.setFontSize(param.pdfConfig.fieldTextSize - 1);

      var lines = doc.splitTextToSize(param.invoice.invDesc || "", docWidth / 2);
      //text in left half
      doc.text(lines, 10, currentHeight);
      currentHeight +=
        doc.getTextDimensions(lines).h > 5
          ? doc.getTextDimensions(lines).h + 6
          : param.pdfConfig.lineHeight;

      return currentHeight;
    };
    addInvoiceDesc();
    //#endregion

    addStamp();

    //#region Add num of first page at the bottom
    if (doc.getNumberOfPages() === 1 && param.pageEnable) {
      doc.setFontSize(param.pdfConfig.fieldTextSize - 2);
      doc.setTextColor(param.pdfConfig.textFontColor);
      doc.text(param.footer.text, docWidth / 2, docHeight - 10, { align: "center" });
      doc.text(
        param.pageLabel + "1 / 1",
        docWidth - 20,
        doc.internal.pageSize.height - 6
      );
    }
    //#endregion

    let returnObj: Partial<ReturnObj> = {
      pagesNumber: doc.getNumberOfPages(),

    };

    if (param.returnJsPDFDocObject) {
      returnObj = {
        ...returnObj,
        jsPDFDocObject: doc,
      };
    }

    switch (param.outputType) {
      case "save":
        doc.save(param.fileName);
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
            filename: param.fileName,
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
          filename: param.fileName,
        });
    }

    return returnObj;
  }
}

document.getElementById("test")?.addEventListener("click", () => {
  jsPDFInvoiceTemplate({
    outputType: "dataurlnewwindow",
    returnJsPDFDocObject: true,
    fileName: `Rechnung_.pdf`,
    orientationLandscape: false,
    compress: true,
    logo: {
      src: "https://res.cloudinary.com/dmowrqef3/image/upload/v1733485063/logo_light_512_6baddaae81.png",
      type: 'PNG',
      style: {
        width: 42,
        height: 42,
        margin: {
          top: -8,
          left: -8
        }
      },
    },
    pdfConfig: {
      fieldTextSize: 10,
      headerTextSize: 0,
      labelTextSize: 0,
      lineHeight: 0,
      subLineHeight: 0,
      headerFontColor: '',
      textFontColor: ''
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
    contact: {
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
      header: [
        {
          title: "#",
          style: {
            width: 10
          }
        },
        {
          title: "Produkt",
          style: {
            width: 40,
            height: 20,
          }
        },
        { title: "Preis" },
        { title: "Menge" },
        { title: "Einheit" },
        { title: "Gesamt" }
      ],
      table: [
        ["1", "Käse", "€ 10", "2", "Stk", "€ 20"],
        ["2", "Wurst", "€ 5", "3", "Stk", "€ 15"],
        ["3", "Brot", "€ 2", "1", "Stk", "€ 2"],
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
