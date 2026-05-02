import express from "express";
import cors from "cors";
import { NotificationManager } from "./notification-controller";
import Log from "../logging_middleware/log";

const app = express();
app.use(cors());
app.use(express.json());

const notificationManager = new NotificationManager();

app.get("/notifications", async (req, res) => {
    const { limit, page, notification_type } = req.query;
    Log({
        stack: "backend",
        package: "controller",
        level: "info",
        message: "Payload received. Fetching notifications.",
    });

    try {
        const notifications = await notificationManager.getNotifications({
            limit,
            page,
            notification_type,
        });

        Log({
            stack: "backend",
            package: "controller",
            level: "info",
            message: "Notifications fetched successfully.",
        });
        res.status(200).json(notifications);
    } catch (error) {
        Log({
            stack: "backend",
            package: "controller",
            level: "fatal",
            message: error.message,
        });
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

app.listen(8000, () => {
    Log({
        stack: "backend",
        package: "controller",
        level: "info",
        message: "server running",
    });
});
