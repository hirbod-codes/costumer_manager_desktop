import { useState } from "react";
import { Order } from "../../../Electron/Costumers/Order";
import { IconButton, TextField } from "@mui/material";
import { t } from "i18next";

import DoneIcon from '@mui/icons-material/DoneOutline'

export function AddRow({ onFinish }: { onFinish: (o: Order) => Promise<void> | void }) {
    const [row, setRow] = useState<Order>({ costumerName: t('Anonymous'), services: {} })

    return (
        <>
            <h1>Add a column</h1>

            <TextField label='Costumer name' value={row.costumerName} onChange={(e) => setRow({ ...row, costumerName: e.target.value })} />

            <IconButton onClick={() => onFinish(row)} >
                <DoneIcon />
            </IconButton>
        </>
    )
}
