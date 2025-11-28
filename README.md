# Multilingual Translator

This is a multilingual translator application built with React and Capacitor, enabling it to run as a web app and a native Android app. It leverages Google's Gemini API for translation and dictionary lookups and Cloudflare Workers for serverless functions.

## Key Technologies

- **Frontend:** React, Vite
- **Mobile:** Capacitor
- **Backend:** Cloudflare Workers
- **Translation:** Google Gemini API

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js and pnpm](https://pnpm.io/installation)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for deployment)

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/translator.git
    cd translator
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

## Build Instructions

### Development

To build the application for development and run it locally, use the following command:

```bash
pnpm run dev
```

This will start a local development server at `http://localhost:8788`.

### Production

To build the application for production, use the following command:

```bash
pnpm run build
```

This will create a production-ready build in the `dist` directory.

## Deployment

### Web (Cloudflare Pages)

The web application is deployed to Cloudflare Pages. The `wrangler.toml` file is configured for this purpose. To deploy the application, run the following command:

```bash
wrangler pages deploy dist
```

### Android

1.  **Sync the Capacitor project:**
    ```bash
    npx cap sync
    ```

2.  **Open the Android project in Android Studio:**
    ```bash
    npx cap open android
    ```

3.  **Build the Android app:**
    In Android Studio, you can build the app and run it on an emulator or a physical device.
