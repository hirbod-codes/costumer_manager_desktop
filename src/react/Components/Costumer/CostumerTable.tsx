import { useState, useEffect, useRef } from 'react'
import { CircularProgress, Modal, Typography, Slide, Paper, Stack, IconButton } from "@mui/material";
import { Order } from "../../../Electron/Costumers/Order";
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import type { costumerAPI } from '../../../Electron/Costumers/renderer/costumerAPI';
import type { configAPI } from '../../../Electron/Configuration/renderer/configAPI';
import { AddColumn } from './AddColumn';
import { AddRow } from './AddRow';

import AddIcon from '@mui/icons-material/Add'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDownOutlined';

export function CostumerTable({ gridDate }: { gridDate: string }) {
    if (gridDate === 'Invalid DateTime')
        return (<Typography>Invalid DateTime</Typography>)

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [showAddColumnModal, setShowAddColumnModal] = useState<boolean>(false);
    const [showAddRowModal, setShowAddRowModal] = useState<boolean>(false);

    const [columns, setColumns] = useState<GridColDef<Order>[] | undefined>(undefined)
    const [rows, setRowsState] = useState<any[] | undefined>(undefined)

    const setRows = async (newRows: Order[], shouldPersist = true): Promise<void> => {
        console.log('setRows', newRows, shouldPersist, gridDate)
        if (shouldPersist)
            (window as typeof window & { costumerAPI: costumerAPI }).costumerAPI.set(gridDate, newRows)

        setRowsState([...newRows].map((r, i) => ({ id: i, ...r })).map((r, i) => ({
            id: i,
            delete: 'null',
            name: r.costumerName,
            actions: 'actions',
            ...Object.fromEntries(columns.slice(3).map(c=> [c.field, '-']))
        })))
    }

    const fetchRows = async () => {
        setIsLoading(true)
        try {
            const loadedRows = await (window as typeof window & { costumerAPI: costumerAPI }).costumerAPI.get(gridDate)
            console.log('fetchRows', loadedRows, gridDate)

            await setRows(loadedRows ?? [], false);
        }
        finally { setIsLoading(false) }
    }

    useEffect(() => {
        setIsLoading(true)
        try { fetchRows() }
        finally { setIsLoading(false) }
    }, [gridDate])

    // Columns
    const hasFetchedServices = useRef(false)
    if (columns === undefined && !hasFetchedServices.current) {
        console.log('fetching columns')
        hasFetchedServices.current = true;
        (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()
            .then(c => {
                setColumns([
                    {
                        field: 'delete',
                        headerName: '',
                        // width: 50
                    },
                    {
                        field: 'name',
                        headerName: 'Name',
                        // width: 100
                    },
                    {
                        field: 'actions',
                        headerName: 'Actions',
                        // width: 150
                    },
                    ...(c.services ?? ['ps4 (1)', 'ps4 (2)', 'ps4 (3)', 'ps4 (4)', 'ps4 (5)', 'ps5 (1)', 'ps5 (2)', 'vip1', 'vip2', 'vip3', 'vip6', 'vip7', 'vip8']).map((elm: string) => ({
                        field: elm,
                        headerName: elm,
                        // width: 100
                    }))
                ])
            })
    }

    if (isLoading && columns !== undefined && rows !== undefined)
        setIsLoading(false)

    if (columns === undefined)
        return <CircularProgress />

    return (
        <>
            <DataGrid
                slots={{
                    toolbar: () => (
                        <Stack direction='row'>
                            <GridToolbar />
                            <IconButton color='primary' onClick={() => setShowAddRowModal(true)}><ArrowCircleDownIcon /></IconButton>
                            <IconButton color='primary' onClick={() => setShowAddColumnModal(true)}><ArrowCircleRightIcon /></IconButton>
                        </Stack>
                    ),
                    footer: () => null
                }}
                columns={columns}
                rows={rows ?? []}
                density='comfortable'
                rowSelection={false}
                loading={isLoading}
            />

            <Modal onClose={() => { setShowAddColumnModal(false) }} open={showAddColumnModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showAddColumnModal ? 'up' : 'down'} in={showAddColumnModal} timeout={250}>
                    <Paper sx={{ maxWidth: '80%', maxHeight: '75%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <AddColumn onFinish={async (addingColumn: GridColDef<Order>) => {
                            if (addingColumn.field.trim() === '' || addingColumn.headerName.trim() === '')
                                return

                            addingColumn.field = addingColumn.field.trim()
                            addingColumn.headerName = addingColumn.headerName.trim();

                            const config = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig();
                            (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig({ ...config, services: [...columns.map(c => c.field), addingColumn.field] })

                            setColumns([...columns, addingColumn])
                            setShowAddColumnModal(false)
                        }} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal onClose={() => { setShowAddRowModal(false) }} open={showAddRowModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showAddRowModal ? 'up' : 'down'} in={showAddRowModal} timeout={250}>
                    <Paper sx={{ maxWidth: '80%', maxHeight: '75%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <AddRow onFinish={async (addingRow: Order) => {
                            if (addingRow.costumerName.trim() === '')
                                return

                            addingRow.costumerName = addingRow.costumerName.trim()

                            // const result = await (window as typeof window & { costumerAPI: costumerAPI }).costumerAPI.set(gridDate, [...rows, addingRow])
                            // console.log(result)

                            setRows([...rows, addingRow])
                            setShowAddRowModal(false)
                        }} />
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}
