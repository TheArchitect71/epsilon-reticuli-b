# Epsilon Reticuli B — Betazed MongoDB frontend

The combined Epsilon Reticuli B and Event Horizon application now lives here under the `epsilon-reticuli-b` name. This Angular people workspace is the frontend for [Betazed MongoDB](https://github.com/TheArchitect71/betazed-mongodb), with account registration, JWT login, and MongoDB-backed directory CRUD.

## Features

- Account registration, sign-in, sign-out, and expired-session handling.
- Each signed-in account has its own directory; the API enforces record ownership.
- Overview, searchable/filterable directory, card/table views, profile details, create/edit forms, and confirmed deletion.
- URL-based filter state and browser-back navigation, loading/error/empty states, and responsive mobile navigation.
- JSON export and an optional historical astronaut sample on the About page.

## Run the pair

Use Node 26.10.0 from `.nvmrc` (backend tests require Node >=24.9). Run processes in foreground terminals and stop each with **Ctrl+C**.

First, make sure local MongoDB is running. If you already have MongoDB on port 27017, reuse it. In a terminal:

```sh
cd "../betazed-mongodb"
npm ci
npm run setup:local
MONGODB_URI='mongodb://127.0.0.1:27017/betazed' PORT=3001 npm run start:dev
```

Alternatively, follow Betazed’s README to start a separate local replica set on port 27018; then omit the `MONGODB_URI` override. Setup preserves an existing `.env.local` and generates a private JWT secret if one is absent.

In another terminal, from this repository:

```sh
npm ci
npm start
```

Open http://127.0.0.1:4202, create an account, and add people. The directory starts empty. The About page can add a sample profile that you can edit or delete.

Angular’s `proxy.conf.json` forwards `/api/**` to `http://127.0.0.1:3001`, removing the `/api` prefix. Change the target if Betazed uses a different port.

## Persistence and deployment

People records are stored in MongoDB. The bearer token is kept in sessionStorage for the current browser tab and survives a reload; clearing browser storage signs you out without deleting server records. JWT sessions expire after one hour. Signing in again retrieves the account’s directory.

The former Event Horizon localStorage directory is not automatically uploaded; that historical version remains available in its archived repository. Sample records are historical and are not a current NASA roster.

Production hosting must serve `index.html` for frontend routes and reverse-proxy `/api` to Betazed, stripping that prefix. The Angular development proxy is used only by `ng serve`.

## Preview and verification

![Epsilon people workspace on desktop](docs/screenshots/desktop.png)

<details>
<summary>Mobile view</summary>

![Epsilon people workspace on mobile](docs/screenshots/mobile.png)

</details>

Screenshots show an isolated test account with sample/test records; these are not automatically added to a fresh account. Desktop (1280×900) and mobile (390×844) checks exercised the built frontend with the real NestJS API and a separate local MongoDB test database. The finite test harness supplied compiled frontend files and forwarded API requests directly to NestJS; it did not start a development server. Test data was removed after verification.

```sh
npm run build
npm run typecheck
npm test -- --browsers=ChromeHeadless
```

Set `CHROME_BIN` if Chromium is outside its standard installation path. Frontend tests verify login, route protection, authenticated requests, confirmed writes, error handling, account-state clearing, and the CRUD/navigation workflows.

## Repositories

- **This repository:** active combined frontend; Epsilon’s original Git history is preserved.
- **[Betazed MongoDB](https://github.com/TheArchitect71/betazed-mongodb):** active backend, authentication, and database persistence.
- **[Event Horizon](https://github.com/TheArchitect71/Event-Horizon):** archived predecessor, preserving its separate Git history.
