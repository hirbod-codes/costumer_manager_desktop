import { useState } from "react";
import { Order } from "../../../Electron/Costumers/Order";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton, TextField } from "@mui/material";

import DoneIcon from '@mui/icons-material/DoneOutline'

export function AddColumn({ onFinish }: { onFinish: (o: GridColDef<Order>) => Promise<void> | void }) {
    const [column, setColumn] = useState<GridColDef<Order>>({ field: '', headerName: '' })

    return (
        <>
            <h1>Add a column</h1>

            <TextField label='Column name' value={column.headerName} onChange={(e) => setColumn({ ...column, field: e.target.value, headerName: e.target.value })} />
            <TextField label='Column width' value={column.width!.toString()} onChange={(e) => setColumn({ ...column, field: e.target.value, width: Number(e.target.value) })} />

            <IconButton onClick={() => onFinish(column)} >
                <DoneIcon />
            </IconButton>
        </>
    )
}
