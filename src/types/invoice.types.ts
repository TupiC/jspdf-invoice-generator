import jsPDF from 'jspdf';

export type OutputType = "arraybuffer" | "blob" | "bloburi" | "bloburl" | "datauristring" | "dataurlstring" | "pdfobjectnewwindow" | "pdfjsnewwindow" | "dataurlnewwindow" | "dataurl" | "datauri" | "save"

export type ReturnObj = {
    pagesNumber: number
    jsPDFDocObject: jsPDF
    blob: Blob
    dataUriString: string
    arrayBuffer: ArrayBuffer
}

export type PdfConfig = {
    headerTextSize?: number
    labelTextSize?: number
    fieldTextSize?: number
    lineHeight?: number
    subLineHeight?: number
    headerFontColor?: string
    textFontColor?: string
    startingAt?: number
    margin?: Margin
    spacing?: {
        beforeTable?: number
        afterBusinessInfo?: number
    }
}

export type InvoiceProps = {
    outputType: OutputType;
    fileName: string
    onJsPDFDocCreation?: (doc: jsPDF) => void
    returnJsPDFDocObject?: boolean
    pdfConfig?: PdfConfig
    orientation?: "landscape" | "portrait"
    compress?: boolean
    logo?: Logo
    stamp?: Logo & {
        inAllPages?: boolean
    }
    business?: PersonInfo & {
        email_1?: string
        website?: string
    }
    client?: PersonInfo & {
        label?: string
        otherInfo?: string
    }
    invoice?: {
        label?: string
        num?: number
        invDate?: string
        invGenDate?: string
        borderAfterHeader?: boolean
        headerBorder?: boolean
        tableBodyBorder?: boolean
        header?: TableRow
        table?: TableRow[]
        invDescLabel?: string
        invDesc?: string
        additionalRows?: {
            col1?: string
            col2?: string
            col3?: string
            style?: Style
        }[]
    }
    footer?: {
        text?: string
    }
    pageEnable?: boolean
    pageLabel?: string
}

type Style = Partial<{
    width?: number
    height?: number
    fontSize?: number
    align?: 'left' | 'center' | 'right'
    margin?: Partial<Margin>
}>

type Margin = {
    top?: number
    right?: number
    bottom?: number
    left?: number
}

type Logo = {
    src?: string
    type?: string
    style?: Style
}

type PersonInfo = {
    name?: string
    address?: string
    phone?: string
    email?: string
}

type TableRow = TableEntry[]

type TableEntry = {
    text: string;
    style?: Partial<Style>;
}