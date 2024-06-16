export type Order = {
    costumerName: string;
    services: { [k: string]: { startedAt: number; duration: number; isActive: boolean; }; };
};
