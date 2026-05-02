import type { NotificationCache, Notifications } from "./type";
import { ApiCall } from "./utils";
import Log from "../logging_middleware/log";

type NotificationQuery = {
    limit?: string | string[] | number;
    page?: string | string[] | number;
    notification_type?: string | string[];
};

export class NotificationManager {
    notificationCache: NotificationCache = {
        notifications: [],
        last_fetched: "",
    };

    async getNotifications(
        query: NotificationQuery = {},
    ): Promise<Notifications[]> {
        const now = Date.now();
        const lastFetchedTime = this.notificationCache.last_fetched
            ? new Date(this.notificationCache.last_fetched).getTime()
            : 0;

        Log({
            stack: "backend",
            package: "controller",
            level: "info",
            message: "Checking the cache.",
        });
        // 1 min cache to reach almost real-time
        const isExpired = now - lastFetchedTime > 60000;

        if (this.notificationCache.notifications.length === 0 || isExpired) {
            Log({
                stack: "backend",
                package: "controller",
                level: "info",
                message: "Cache not found. Fetching the notifications.",
            });
            console.log("here");
            const params = new URLSearchParams();
            const normalize = (
                value: string | string[] | number | undefined,
            ): string | undefined =>
                value === undefined
                    ? undefined
                    : Array.isArray(value)
                      ? value[0]
                      : String(value);

            const limit = normalize(query.limit);
            const page = normalize(query.page);
            const notificationType = normalize(query.notification_type);

            if (limit !== undefined) {
                params.set("limit", limit);
            }
            if (page !== undefined) {
                params.set("page", page);
            }
            if (notificationType !== undefined) {
                params.set("notification_type", notificationType);
            }
            const path = params.toString()
                ? `/notifications?${params.toString()}`
                : "/notifications";
            const data = await ApiCall(path);
            console.log(data);
            if (Array.isArray(data)) {
                this.notificationCache = {
                    notifications: data as Notifications[],
                    last_fetched: new Date().toISOString(),
                };
            }
        }

        Log({
            stack: "backend",
            package: "controller",
            level: "info",
            message: "Cache found. Returning result from the cache",
        });
        return this.notificationCache.notifications;
    }
}
