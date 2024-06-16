import { Order } from '../Order';
import { Date } from '../../../react/Lib/DateTime'

export type costumerAPI = {
    get: (date: Date) => Promise<Order[] | undefined>;
    set: (date: Date, orders: Order[]) => Promise<boolean>;
};
