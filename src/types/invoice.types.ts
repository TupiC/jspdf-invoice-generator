import jsPDF from 'jspdf';

export type OutputType = {
    Save: "save"
    DataUriString: "datauristring"
    DataUri: "datauri"
    DataUrlNewWindow: "dataurlnewwindow"
    Blob: "blob"
    ArrayBuffer: "arraybuffer"
}

export type ReturnObj = {
    pagesNumber: number
    jsPDFDocObject: jsPDF
    blob: Blob
    dataUriString: string
    arrayBuffer: ArrayBuffer
}

export type PdfConfig = {
    headerTextSize: number
    labelTextSize: number
    fieldTextSize: number
    lineHeight: number
    subLineHeight: number
    headerFontColor: string
    textFontColor: string
}

export type InvoiceProps = {
    outputType: OutputType | string
    onJsPDFDocCreation?: (doc: jsPDF) => void
    returnJsPDFDocObject?: boolean
    fileName: string
    orientationLandscape?: boolean
    compress?: boolean
    pdfConfig: PdfConfig
    logo: Logo
    stamp: Partial<Logo> & {
        inAllPages?: boolean
    }
    business: PersonInfo & {
        email_1: string
        website: string
    }
    contact: PersonInfo & {
        label?: string
        otherInfo?: string
    }
    invoice: {
        label?: string
        num?: number
        invDate: string
        invGenDate?: string
        headerBorder?: boolean
        tableBodyBorder?: boolean
        header:
        {
            title: string
            style?: Style
        }[]
        table?: any
        invDescLabel: string
        invDesc?: string
        additionalRows?: {
            col1?: string
            col2?: string
            col3?: string
            style?: Style
        }[]
    }
    footer: {
        text: string
    }
    pageEnable?: boolean
    pageLabel?: string
}

type Style = Partial<{
    width?: number
    height?: number
    fontSize?: number
    align?: 'left' | 'center' | 'right'
    margin?: {
        top?: number
        left?: number
    }
}>

type Logo = {
    src: string
    type?: string
    style?: Style
}

type PersonInfo = {
    name: string
    address: string
    phone: string
    email: string
}
