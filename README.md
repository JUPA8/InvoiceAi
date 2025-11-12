## Invoice AI System

This project is the frontend base for **Invoice AI**. The structure is designed to be **modular**, **scalable** and **easy to maintain**, making it suitable for long-term development and team collaboration.

## 📁 Project Structure

```
├── app/              # Main app using Next.js App Router with layout segments
│   ├── (public)/     # Public routes accessible without authentication
│   ├── (private)/    # Protected routes requiring authentication
├── lib/              # Integrations and business logic (e.g., auth, Stripe)
├── components/       # Reusable UI components (buttons, forms, icons)
├── hooks/            # Custom React hooks for reusable logic
├── actions/          # Next.js Server Actions for server-side logic
├── public/           # Static files accessible via URL (e.g., images, icons)


## 🧭 Routing Structure

This project uses the **App Router** from Next.js, which allows for file-based routing and nested layouts.

- **`app/(public)/`**: Contains routes that are accessible without authentication, such as:
  - `/login`
  - `/register`
  - `/about`

- **`app/(private)/`**: Contains protected routes that require authentication, such as:
  - `/dashboard`
  - `/billing`
  - `/profile`

```

## 🛠️ Development Guide

🔧 Initial Setup

Install project dependencies:

```bash
npm install
# or
yarn install
```

Run the development server:

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
