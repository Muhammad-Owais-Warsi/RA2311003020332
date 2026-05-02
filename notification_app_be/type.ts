type Notifications = {
    ID: string;
    Type: string;
    Message: string;
    Timestamp: string;
};

type NotificationCache = {
    notifications: Notifications[];
    last_fetched: string;
};

export type { NotificationCache, Notifications };
