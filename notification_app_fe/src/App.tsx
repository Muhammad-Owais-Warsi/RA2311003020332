import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    AppBar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import Log from "../logging_middleware/log";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

type NotificationItem = {
    ID: string;
    Type: string;
    Message: string;
    Timestamp: string;
};

type NotificationTypeOption = "All" | "Event" | "Placement" | "Result";

const formatTimestamp = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString();
};

function App() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const [limit, setLimit] = useState("10");
    const [page, setPage] = useState("1");
    const [notificationType, setNotificationType] =
        useState<NotificationTypeOption>("All");
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [readIds, setReadIds] = useState<Record<string, boolean>>({});

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (limit.trim()) {
            params.set("limit", limit.trim());
        }
        if (page.trim()) {
            params.set("page", page.trim());
        }
        if (notificationType !== "All") {
            params.set("notification_type", notificationType);
        }
        return params.toString();
    }, [limit, page, notificationType]);

    const visibleNotifications = useMemo(() => {
        if (!showUnreadOnly) {
            return notifications;
        }
        return notifications.filter((item) => !readIds[item.ID]);
    }, [notifications, showUnreadOnly, readIds]);

    const unreadCount = useMemo(
        () => notifications.filter((item) => !readIds[item.ID]).length,
        [notifications, readIds],
    );

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            Log({
                stack: "frontend",
                package: "notifications",
                level: "info",
                message: "Fetching notifications",
            });
            const url = queryString
                ? `${API_BASE}/notifications?${queryString}`
                : `${API_BASE}/notifications`;
            const response = await fetch(url);
            if (!response.ok) {
                const message = await response.text();
                throw new Error(
                    message || `Request failed with ${response.status}`,
                );
            }
            const data = (await response.json()) as unknown;
            if (!Array.isArray(data)) {
                throw new Error("Unexpected response format");
            }
            setNotifications(data as NotificationItem[]);
            setLastUpdated(new Date());
            Log({
                stack: "frontend",
                package: "notifications",
                level: "info",
                message: `Loaded ${data.length} notifications`,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load";
            setError(message);
            Log({
                stack: "frontend",
                package: "notifications",
                level: "error",
                message,
            });
        } finally {
            setLoading(false);
        }
    }, [queryString]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleToggleRead = (id: string) => {
        setReadIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
            <AppBar position="static" color="transparent" elevation={0}>
                <Toolbar sx={{ py: 1 }}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            Notification Service
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Filter and review backend notifications
                        </Typography>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 4 }} maxWidth="lg">
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Total notifications
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {notifications.length}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Unread
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {unreadCount}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Last refreshed
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                                {lastUpdated
                                    ? lastUpdated.toLocaleTimeString()
                                    : "-"}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", md: "center" }}
                    >
                        <TextField
                            label="Limit"
                            type="number"
                            value={limit}
                            onChange={(event) => setLimit(event.target.value)}
                            inputProps={{ min: 1 }}
                            sx={{ minWidth: 140 }}
                        />
                        <TextField
                            label="Page"
                            type="number"
                            value={page}
                            onChange={(event) => setPage(event.target.value)}
                            inputProps={{ min: 1 }}
                            sx={{ minWidth: 140 }}
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="notification-type-label">
                                Type
                            </InputLabel>
                            <Select
                                labelId="notification-type-label"
                                value={notificationType}
                                label="Type"
                                onChange={(event) =>
                                    setNotificationType(
                                        event.target
                                            .value as NotificationTypeOption,
                                    )
                                }
                            >
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Events">Events</MenuItem>
                                <MenuItem value="Placement">Placement</MenuItem>
                                <MenuItem value="Result">Result</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showUnreadOnly}
                                    onChange={(event) =>
                                        setShowUnreadOnly(event.target.checked)
                                    }
                                />
                            }
                            label="Show unread only"
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            variant="contained"
                            onClick={fetchNotifications}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            justifyContent="space-between"
                        >
                            <Typography variant="h6" fontWeight={600}>
                                Notifications
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Chip
                                    label={`Type: ${notificationType}`}
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Limit: ${limit || "-"}`}
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Page: ${page || "-"}`}
                                    variant="outlined"
                                />
                            </Stack>
                        </Stack>
                        <Divider />

                        {loading && (
                            <Stack alignItems="center" sx={{ py: 6 }}>
                                <CircularProgress />
                                <Typography variant="body2" sx={{ mt: 2 }}>
                                    Loading notifications…
                                </Typography>
                            </Stack>
                        )}

                        {!loading && error && (
                            <Alert severity="error">{error}</Alert>
                        )}

                        {!loading &&
                            !error &&
                            visibleNotifications.length === 0 && (
                                <Alert severity="info">
                                    No notifications found.
                                </Alert>
                            )}

                        {!loading &&
                            !error &&
                            visibleNotifications.length > 0 && (
                                <Stack spacing={2}>
                                    {visibleNotifications.map((item) => {
                                        const isRead = !!readIds[item.ID];
                                        return (
                                            <Paper
                                                key={item.ID}
                                                variant="outlined"
                                                sx={{ p: 2 }}
                                            >
                                                <Stack
                                                    direction={{
                                                        xs: "column",
                                                        md: "row",
                                                    }}
                                                    spacing={2}
                                                    justifyContent="space-between"
                                                    alignItems={{
                                                        xs: "flex-start",
                                                        md: "center",
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight={600}
                                                        >
                                                            {item.Message}
                                                        </Typography>
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                            sx={{
                                                                mt: 1,
                                                                flexWrap:
                                                                    "wrap",
                                                            }}
                                                        >
                                                            <Chip
                                                                size="small"
                                                                label={
                                                                    item.Type
                                                                }
                                                            />
                                                            <Chip
                                                                size="small"
                                                                label={
                                                                    isRead
                                                                        ? "Read"
                                                                        : "Unread"
                                                                }
                                                                color={
                                                                    isRead
                                                                        ? "default"
                                                                        : "primary"
                                                                }
                                                                variant={
                                                                    isRead
                                                                        ? "outlined"
                                                                        : "filled"
                                                                }
                                                            />
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {formatTimestamp(
                                                                    item.Timestamp,
                                                                )}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                    <Button
                                                        variant="text"
                                                        onClick={() =>
                                                            handleToggleRead(
                                                                item.ID,
                                                            )
                                                        }
                                                    >
                                                        Mark as{" "}
                                                        {isRead
                                                            ? "Unread"
                                                            : "Read"}
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            )}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default App;
