import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { array, mixed, string } from 'yup'
import { Order } from './Order'
import { Date } from '../../react/Lib/DateTime'

export function get(date: Date): Order[] | undefined {
    try {
        if (!mixed<Date>().required().isValidSync(date))
            return undefined

        const costumerFolder = path.join(app.getPath('appData'), app.getName(), 'Costumers')
        const costumerFileName = `${date.year.toFixed(0)}-${date.month.toFixed(0)}-${date.day.toFixed(0)}.json`
        const costumerFilePath = path.join(costumerFolder, costumerFileName)

        if (!fs.existsSync(costumerFolder))
            fs.mkdirSync(costumerFolder, { recursive: true })

        if (!fs.existsSync(costumerFilePath))
            return undefined

        const costumerJson = fs.readFileSync(costumerFilePath).toString()

        return JSON.parse(costumerJson)
    }
    catch (err) { console.error(err); return undefined }
}

export function set(date: Date, orders: Order[]): boolean {
    try {
        if (!mixed<Date>().required().isValidSync(date))
            return false

        if (!array().required().of(mixed<Order>().required()).isValidSync(orders))
            return false

        const costumerFolder = path.join(app.getPath('appData'), app.getName(), 'Costumers')
        const costumerFileName = `${date.year.toFixed(0)}-${date.month.toFixed(0)}-${date.day.toFixed(0)}.json`
        const costumerFilePath = path.join(costumerFolder, costumerFileName)

        if (!fs.existsSync(costumerFolder))
            fs.mkdirSync(costumerFolder, { recursive: true })

        const data = JSON.stringify(orders)
        fs.writeFileSync(costumerFilePath, data)

        return true
    }
    catch (err) { console.error(err); return false }
}

export function handleCostumersEvents() {
    ipcMain.handle('get-costumers', (_e, { date }: { date: Date }) => get(date))

    ipcMain.handle('set-costumers', (_e, { date, orders }: { date: Date, orders: Order[] }) => set(date, orders))
}

