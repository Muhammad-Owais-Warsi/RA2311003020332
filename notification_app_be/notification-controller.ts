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
        Log({
            stack: "backend",
            package: "controller",
            level: "info",
            message: "Fetching notifications (cache disabled).",
        });

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
        const normalizedType =
            notificationType === "Events" ? "Event" : notificationType;

        if (limit !== undefined) {
            params.set("limit", limit);
        }
        if (page !== undefined) {
            params.set("page", page);
        }
        if (normalizedType !== undefined) {
            params.set("notification_type", normalizedType);
        }
        const path = params.toString()
            ? `/notifications?${params.toString()}`
            : "/notifications";
        const data = await ApiCall(path);
        Log({
            stack: "backend",
            package: "controller",
            level: "debug",
            message: `Notifications response received.`,
        });
        const notifications = Array.isArray(data)
            ? data
            : Array.isArray(
                    (data as { notifications?: unknown })?.notifications,
                )
              ? (data as { notifications: Notifications[] }).notifications
              : [];

        return notifications;
    }
}
