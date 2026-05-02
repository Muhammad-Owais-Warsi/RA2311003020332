# Notification System Design

This document explains the current setup in three simple stages.

<img width="1869" height="921" alt="image" src="https://github.com/user-attachments/assets/e7908327-7941-4b73-8c41-ae302e206e48" />
<img width="1242" height="830" alt="image" src="https://github.com/user-attachments/assets/a30c4b94-28a0-49f6-b92f-d2895581f25a" />


## Stage 1: Logging middleware

- A shared `Log` function is used to send logs to the `/logs` endpoint.
- It accepts `stack`, `package`, `level`, and `message` fields.
- It is used to record key backend and frontend actions.

## Stage 2: Backend service

- The backend exposes `GET /notifications`.
- It accepts query parameters:
    - `limit`
    - `page`
    - `notification_type` (values like `Event`, `Placement`, `Result`)
- The controller builds the query string and forwards the request to the upstream API.
- The response can be either an array or `{ notifications: [...] }` and is returned as a plain array.
- Caching is currently disabled to keep results accurate for each filter.

## Stage 3: Frontend


- The frontend is built with Vite + React + Material UI.
- It provides filters for `limit`, `page`, and `notification_type`.
- Filter changes automatically trigger a new fetch.
- A manual refresh button is also available.
- The UI shows total count, unread count (local state), last refresh time, and a list of notifications.
- Logs are sent from the frontend using the same `Log` function path.
