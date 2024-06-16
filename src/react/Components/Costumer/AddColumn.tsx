import { useState } from "react";
import { Order } from "../../../Electron/Costumers/Order";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton, TextField, Typography } from "@mui/material";
import { t } from "i18next";

import DoneIcon from '@mui/icons-material/DoneOutline'

export function AddColumn({ onFinish }: { onFinish: (o: GridColDef<Order>) => Promise<void> | void }) {
    const [column, setColumn] = useState<GridColDef<Order>>({ field: '', headerName: '' })

    return (
        <>
            <Typography component={'h1'}>{t('Add a column')}</Typography>

            <TextField label='Column name' value={column.headerName} onChange={(e) => setColumn({ ...column, field: e.target.value, headerName: e.target.value })} />

            <IconButton onClick={() => onFinish(column)} >
                <DoneIcon />
            </IconButton>
        </>
    )
}
