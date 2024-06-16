import { Order } from '../Order';

export type costumerAPI = {
    get: (date: string) => Promise<Order[] | undefined>;
    set: (date: string, costumer: Order[]) => Promise<boolean>;
};
