import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { array, mixed, string } from 'yup'
import { Order } from './Order'

export function get(date: string): Order[] | undefined {
    try {
        if (!string().required().min(1).isValidSync(date))
            return undefined

        date = date.trim()

        const costumerFolder = path.join(app.getPath('appData'), app.getName(), 'Costumers')
        const costumerFile = path.join(costumerFolder, date + '.json')

        if (!fs.existsSync(costumerFolder))
            fs.mkdirSync(costumerFolder, { recursive: true })

        if (!fs.existsSync(costumerFile))
            return undefined

        const costumerJson = fs.readFileSync(costumerFile).toString()
        return JSON.parse(costumerJson)
    }
    finally { return undefined }
}

export function set(date: string, orders: Order[]): boolean {
    try {
        if (!string().required().min(1).isValidSync(date))
            return false

        if (!array().required().min(1).of(mixed<Order>().required()).isValidSync(orders))
            return false

        date = date.trim()

        const costumerFolder = path.join(app.getPath('appData'), app.getName(), 'Costumers')
        const costumerFile = path.join(costumerFolder, date + '.json')

        if (!fs.existsSync(costumerFolder))
            fs.mkdirSync(costumerFolder, { recursive: true })

        fs.writeFileSync(costumerFile, JSON.stringify(orders))

        return true
    }
    finally { return false }
}

export function handleCostumersEvents() {
    ipcMain.handle('get-costumers', (_e, { date }: { date: string }) => {
        return get(date)
    })

    ipcMain.handle('set-costumers', (_e, { date, orders }: { date: string, orders: Order[] }) => {
        return set(date, orders)
    })
}

