import generateInvoice from ".";

document.getElementById("test")?.addEventListener("click", () => {
    const returnObj = generateInvoice({
        outputType: "save",
        beforePDFCreation: (doc) => {
            console.log(doc);
        },
        afterPDFCreation: (returnObj) => {
            console.log(returnObj);
        },
        returnJsPDFDocObject: true,
        fileName: `Rechnung.pdf`,
        pdfConfig: {
            compress: true,
            orientation: "portrait",
            spacing: {
                afterBusinessInfo: 20,
                afterClientInfo: 10,
            },
        },
        logo: {
            src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSVLG1Y6rHkzILk_pauYmH48HjcNC7c94Frg&s",
            type: "PNG",
            style: {
                width: 16,
                height: 16,
                margin: {
                    top: -5,
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
        businessName: "Your Company",
        businessInfo: [
            "Your Address",
            "+31 323 83 83 29",
            "your@company.com",
            "www.company.at",
        ],
        clientLabel: "Invoice to:",
        clientName: "Client Name",
        clientInfo: [
            "Client Address",
            "+31 323 83 83 29",
            "Other info",
            "client@email.com",
        ],
        pageDelimiter: "/",
        invoice: {
            label: "Invoice #: ",
            invGenDate: `Invoice generated date: ${new Date().toLocaleDateString()}`,
            number: 1,
            invDate: `Invoice date: ${new Date().toLocaleDateString()}`,
            header: [
                {
                    text: "#",
                    style: {
                        width: 10,
                    },
                },
                {
                    text: "Product",
                    style: {
                        width: 40,
                    },
                },
                { text: "Price" },
                { text: "Quantity" },
                { text: "Unit" },
                { text: "Total" },
            ],
            table: [
                [
                    { text: "1" },
                    { text: "Item 1" },
                    { text: "10" },
                    { text: "3" },
                    { text: "Pcs" },
                    { text: "30 €" },
                ],
                [
                    { text: "2" },
                    { text: "Item 2" },
                    { text: "10" },
                    { text: "3" },
                    { text: "Pcs" },
                    { text: "30 €" },
                ],
            ],
            additionalRows: [
                {
                    key: "Subtotal:",
                    value: "12.000 €",
                    style: {
                        fontSize: 10,
                    },
                },
                {
                    key: "+20% Vat:",
                    value: "2.400 €",
                    style: {
                        fontSize: 10,
                    },
                },
                {
                    key: "Total:",
                    value: "14.400 €",
                    style: {
                        fontSize: 12,
                    },
                },
            ],
            invoiceDescriptionLabel: "Invoice Description",
            invoiceDescription:
                "This is a description of the invoice. You can add any information here.",
        },
        footer: "This is a h text",
        displayPageLabel: false,
        pageLabel: "Page",
    });

    console.log(returnObj);
});
