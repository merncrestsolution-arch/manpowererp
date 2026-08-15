This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started (localhost)

### 1. Start the database

```bash
docker compose up -d
```

PostgreSQL runs on **localhost:5435** (see `docker-compose.yml`).

### 2. Configure environment

```bash
cp .env.example .env
```

The included `.env` is already set for local development when using Docker Compose.

### 3. Prepare the database

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the web app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Dev login accounts:**

- Admin: `admin@jkmanpower.local` / `Admin@12345`
- Employee: `employee@jkmanpower.local` / `Employee@12345`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Mobile app (Expo)

The React Native app lives in `mobile/` and connects to the same backend via `/api/mobile/auth/*`.

```bash
# Terminal 1 — web API
npm run dev

# Terminal 2 — mobile app
cd mobile
cp .env.example .env
npm start
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your machine IP when testing on a physical device. Use `http://10.0.2.2:3000` for the Android emulator.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
