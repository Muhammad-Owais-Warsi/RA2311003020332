import { type Log } from "./types";

export default function Log(log: Log) {
    fetch(`${process.env.TEST_SERVER_BASE}/logs`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(log),
    })
        .then(async (result) => {
            if (result.ok) {
                return { message: "Success: Log registered successfully" };
            }
            const errorData = await result.text();
            return {
                error: `Failed to send log. Status: ${result.status}`,
                details: errorData,
            };
        })
        .catch((e) => {
            return {
                error: `Internal server error. Please try later. ${e.message}`,
            };
        });
}
