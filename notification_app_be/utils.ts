import Log from "../logging_middleware/log";

export async function ApiCall(path: string) {
    try {
        const response = await fetch(`${process.env.TEST_SERVER_BASE}${path}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.TOKEN}`,
            },
        });

        if (!response.ok) {
            Log({
                stack: "backend",
                package: "controller",
                level: "error",
                message: `API Failed: ${response.status} ${response.statusText}`,
            });
            throw new Error(`Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (e: any) {
        Log({
            stack: "backend",
            package: "controller",
            level: "fatal",
            message: e.message,
        });

        return { error: `Internal server error: ${e.message}` };
    }
}
