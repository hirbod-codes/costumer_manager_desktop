import { ipcRenderer } from 'electron'
import { Order } from '../Order'

export async function get(date: string): Promise<Order[] | undefined> {
    return await ipcRenderer.invoke('get-costumers', { date })
}

export async function set(date: string, costumer: Order[]): Promise<boolean> {
    return await ipcRenderer.invoke('set-costumers', { date, costumer })
}
