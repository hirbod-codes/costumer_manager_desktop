import { ipcRenderer } from 'electron'
import { Order } from '../Order'
import { Date } from '../../../react/Lib/DateTime'

export async function get(date: Date): Promise<Order[] | undefined> {
    return await ipcRenderer.invoke('get-costumers', { date })
}

export async function set(date: Date, orders: Order[]): Promise<boolean> {
    return await ipcRenderer.invoke('set-costumers', { date, orders })
}
