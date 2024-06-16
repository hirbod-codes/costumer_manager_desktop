import SquareIcon from '@mui/icons-material/SquareOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import PauseIcon from '@mui/icons-material/PauseOutlined'
import PlayArrowIcon from '@mui/icons-material/PlayArrowOutlined'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDownOutlined';

import { useState, useEffect, useRef } from 'react'
import { CircularProgress, Modal, Typography, Slide, Stack, Paper, Box, IconButton, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TextField } from "@mui/material";
import { Order } from "../../../Electron/Costumers/Order";
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import type { costumerAPI } from '../../../Electron/Costumers/renderer/costumerAPI';
import type { configAPI } from '../../../Electron/Configuration/renderer/configAPI';
import { AddColumn } from './AddColumn';
import { DateTime } from 'luxon';
import { Date } from '../../../react/Lib/DateTime';
import { t } from 'i18next';

export function CostumerTable({ gridDate }: { gridDate: Date }) {
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [showAddColumnModal, setShowAddColumnModal] = useState<boolean>(false);

    const [columns, setColumns] = useState<GridColDef<Order>[] | undefined>(undefined)
    const [rows, setRowsState] = useState<any[] | undefined>(undefined)

    const setRows = async (newRows: Order[], shouldPersist = true): Promise<void> => {
        console.log(gridDate)
        console.log('setRows', newRows, shouldPersist, gridDate)
        if (shouldPersist)
            (window as typeof window & { costumerAPI: costumerAPI }).costumerAPI.set(gridDate, newRows).then(v => console.log('setRows result', v))

        setRowsState([...newRows].map((r, i) => ({ id: i, ...r })))
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

    const staticColumns: GridColDef<Order>[] = [
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
    ]

    const hasFetchedServices = useRef(false)
    if (columns === undefined && !hasFetchedServices.current) {
        console.log('fetching columns')
        hasFetchedServices.current = true;
        (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()
            .then(c => {
                setColumns([
                    ...(c.services ?? ['ps4 (1)', 'ps4 (2)', 'ps4 (3)', 'ps4 (4)', 'ps4 (5)', 'ps5 (1)', 'ps5 (2)', 'vip1', 'vip2', 'vip3', 'vip6', 'vip7', 'vip8']).map((field: string) => ({
                        field: field,
                        headerName: field,
                        // width: 100
                    }))
                ])
            })
    }

    // Timer
    const timer = useRef<NodeJS.Timeout | undefined>(undefined)
    useEffect(() => {
        if (rows && columns && timer.current === undefined)
            timer.current = setInterval(() => {
                console.log('timer ticked', DateTime.utc().toFormat('ss'))

                if (rows && rows.length > 0 && rows.find((r: Order) => Object.keys(r.services).length !== 0 && Object.entries(r.services).find(arr => arr[1].isActive === true) !== undefined) !== undefined)
                    setRows(rows.map((r: Order) => {
                        if (Object.keys(r.services).length === 0)
                            return r;

                        r.services = Object.fromEntries(Object.entries(r.services).map(arr => {
                            if (!arr[1].isActive)
                                return arr;

                            arr[1].duration = DateTime.utc().toUnixInteger() - arr[1].startedAt
                            return arr;
                        }));

                        return r;
                    }), false);
            }, 1000)

        return () => {
            clearInterval(timer.current)
            timer.current = undefined
        }
    }, [rows, columns])

    // Synchronize data
    const syncTimer = useRef<NodeJS.Timeout | undefined>(undefined)
    useEffect(() => {
        if (rows && columns && syncTimer.current === undefined)
            syncTimer.current = setInterval(() => {
                console.log('syncTimer ticked', DateTime.utc().toFormat('ss'))
                if (rows && rows.length > 0 && rows.find((r: Order) => Object.keys(r.services).length !== 0) !== undefined)
                    setRows(rows);
            }, 10000)

        return () => {
            clearInterval(syncTimer.current)
            syncTimer.current = undefined
        }
    }, [rows, columns])

    if (isLoading && columns !== undefined && rows !== undefined)
        setIsLoading(false)

    if (columns === undefined)
        return <CircularProgress />

    return (
        <>
            <TableContainer component={Paper}>
                <Stack direction='row'>
                    <IconButton color='primary' onClick={() => setShowAddColumnModal(true)}><ArrowCircleRightIcon /></IconButton>
                    <IconButton color='primary' onClick={async (e) => {
                        const addingRow: Order = { costumerName: 'Anonymous', services: {} }
                        if (addingRow.costumerName.trim() === '')
                            return

                        addingRow.costumerName = addingRow.costumerName.trim()

                        setRows([...rows, addingRow])
                    }}>
                        <ArrowCircleDownIcon />
                    </IconButton>
                </Stack>
                <Table sx={{ width: 1700 }}>
                    <TableHead>
                        <TableRow>
                            {[...staticColumns, ...columns]?.map((c, i) =>
                                <TableCell key={i} align='center'>{c.headerName}</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows?.map((row: Order & { id: any }, ri) => (
                            <TableRow
                                key={ri}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align='center'><IconButton onClick={() => setRows(rows.filter((f, fi) => fi !== row.id))}><DeleteIcon /></IconButton></TableCell>
                                <TableCell align='center'>
                                    <TextField label={t('Name')} value={row.costumerName} onChange={(e) => {
                                        const str: string = e.target.value.trim()
                                        if (str.length === 0)
                                            return
                                        setRows(rows.map((m: Order, mi) => {
                                            if (mi !== row.id)
                                                return m

                                            m.costumerName = str
                                            return m
                                        }))
                                    }} />
                                </TableCell>
                                <TableCell align='center'>
                                    <Stack direction='row'>
                                        <IconButton onClick={() => setRows(rows.map((m: Order, mi) => {
                                            if (mi !== row.id)
                                                return m

                                            m.services = Object.fromEntries(Object.entries(m.services).map((arr) => {
                                                arr[1].startedAt = DateTime.utc().toUnixInteger() - arr[1].duration;
                                                arr[1].isActive = true;
                                                return arr
                                            }))
                                            return m
                                        }))}>
                                            <PlayArrowIcon />
                                        </IconButton>
                                        <IconButton onClick={() => setRows(rows.map((m: Order, mi) => {
                                            if (mi !== row.id)
                                                return m

                                            m.services = Object.fromEntries(Object.entries(m.services).map((arr) => { arr[1].isActive = false; return arr }))
                                            return m
                                        }))}>
                                            <PauseIcon />
                                        </IconButton>
                                        <IconButton onClick={() => setRows(rows.map((m: Order, mi) => {
                                            if (mi !== row.id)
                                                return m

                                            m.services = {}
                                            return m
                                        }))}>
                                            <SquareIcon />
                                        </IconButton>
                                    </Stack>
                                </TableCell>

                                {columns.map((c, ci) =>
                                    <TableCell key={ci} align='center'>
                                        {
                                            row.services[c.field]
                                                ?
                                                <Typography
                                                    onClick={() =>
                                                        setRows(rows.map((r: Order, i) => {
                                                            if (i !== row.id)
                                                                return r
                                                            r.services[c.field].isActive = false
                                                            return r
                                                        }))}
                                                >
                                                    {`${Math.floor(row.services[c.field].duration / 3600).toFixed(0)}:${Math.floor((row.services[c.field].duration % 3600) / 60).toFixed(0)}:${(((row.services[c.field].duration % 3600) % 60)).toFixed(0)}`}
                                                </Typography>
                                                :
                                                <IconButton
                                                    onClick={() =>
                                                        setRows(rows.map((r, i) => {
                                                            if (i !== row.id)
                                                                return r
                                                            r.services[c.field] = { startedAt: DateTime.utc().toUnixInteger(), duration: 0, isActive: true }
                                                            return r
                                                        }))}
                                                >
                                                    <PlayArrowIcon />
                                                </IconButton>
                                        }
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal onClose={() => { setShowAddColumnModal(false) }} open={showAddColumnModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showAddColumnModal ? 'up' : 'down'} in={showAddColumnModal} timeout={250}>
                    <Paper sx={{ maxWidth: '80%', maxHeight: '75%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <AddColumn onFinish={async (addingColumn: GridColDef<Order>) => {
                            if (addingColumn.field.trim() === '' || addingColumn.headerName.trim() === '')
                                return

                            addingColumn.field = addingColumn.field.trim()
                            addingColumn.headerName = addingColumn.headerName.trim();

                            if (columns.find(c => c.field === addingColumn.field) !== undefined) {
                                setShowAddColumnModal(false)
                                return
                            }

                            const config = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig();
                            (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig({ ...config, services: [...columns.map(c => c.field), addingColumn.field] })

                            setColumns([...columns, addingColumn])
                            setShowAddColumnModal(false)
                        }} />
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}
