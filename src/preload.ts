import { contextBridge } from 'electron'
import * as menu from './Electron/Menu/renderer/menu'
import * as configs from './Electron/Configuration/renderer/configuration'
import * as costumer from './Electron/Costumers/renderer/costumer'
import type { menuAPI } from './Electron/Menu/renderer/menuAPI'
import { configAPI } from './Electron/Configuration/renderer/configAPI'
import { costumerAPI } from './Electron/Costumers/renderer/costumerAPI'


contextBridge.exposeInMainWorld('menuAPI', {
    openMenu: menu.openMenu,
    minimize: menu.minimize,
    maximize: menu.maximize,
    unmaximize: menu.unmaximize,
    maxUnmax: menu.maxUnmax,
    close: menu.close,
    isWindowMaximized: menu.isWindowMaximized,
} as menuAPI)

contextBridge.exposeInMainWorld('configAPI', {
    readConfig: configs.readConfig,
    writeConfig: configs.writeConfig,
} as configAPI)

contextBridge.exposeInMainWorld('costumerAPI', {
    get: costumer.get,
    set: costumer.set,
} as costumerAPI)
