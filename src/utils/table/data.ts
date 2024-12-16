import { TableRow } from '../../types/invoice.types';

export const getTableData = (): TableRow[] => {
    const row: TableRow[] = [];

    for (let i = 1; i <= 4; i++) {
        row.push(
            [
                { text: i.toString(), },
                { text: "Item " + i },
                { text: "10", },
                { text: "3" },
                { text: "Pcs" },
                { text: "30", }
            ]
        )
    }
    return row;
}
