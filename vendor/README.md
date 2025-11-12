# FoodieFind Vendor App - Native Mobile Development

This document provides instructions for developers on how to set up, build, and run the native mobile versions (iOS and Android) of the FoodieFind Vendor Dashboard using Capacitor.

## Overview

This web application is enhanced with [Capacitor](https://capacitorjs.com/) to create native mobile apps from the same codebase. This allows us to access native device features.

**Current Native Features:**
- **Camera Access**: Vendors can use their device's camera to take photos of menu items directly within the "Add/Edit Menu Item" modal.

## 1. Prerequisites

Before you begin, ensure you have the following tools installed on your system:

- **Node.js and npm**: Required for running the web application and Capacitor commands.
- **Capacitor CLI**: Install it globally for ease of use:
  ```bash
  npm install -g @capacitor/cli
  ```
- **Xcode**: Required for iOS development (macOS only). Install from the Mac App Store.
- **Android Studio**: Required for Android development. Download from the [official Android developer website](https://developer.android.com/studio).

## 2. Initial Setup (First Time Only)

If you are setting up the native project for the first time, you need to add the desired platforms.

1.  **Navigate to the vendor directory**:
    ```bash
    cd vendor
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Add Native Platforms**:
    ```bash
    # For iOS
    npx cap add ios

    # For Android
    npx cap add android
    ```
    This will create `ios` and `android` folders in the `vendor` directory, containing the native project files.

## 3. Development Workflow

Follow these steps to build the web app and run it on a native simulator or device.

#### Step 1: Build the Web App

First, you need to create a production build of the React application. This compiles all the web assets into the `dist` directory, which Capacitor uses.

```bash
# From the vendor/ directory
npm run build
```

#### Step 2: Sync Web Assets with Native Projects

The `sync` command copies your web build (`dist` folder) into the native projects. It also updates native dependencies and configuration.

```bash
npx cap sync
```
*Tip: Run `npx cap sync` every time you make changes to the web code and want to see them in the native app.*

#### Step 3: Open and Run in the Native IDE

After syncing, open the native project in its respective IDE to build, run, and debug.

**For iOS:**

```bash
npx cap open ios
```
This command will open the project in Xcode. From there, select a simulator or a connected device and click the "Run" button (▶).

**For Android:**

```bash
npx cap open android
```
This command will open the project in Android Studio. From there, select an emulator or a connected device and click the "Run" button (▶).

## Managing Native Configurations

- **`capacitor.config.ts`**: This is the main configuration file for Capacitor. Here you can change the app ID, name, and other high-level settings.
- **Permissions**: Native permissions are managed in the native project files.
  - **iOS**: Edit `ios/App/App/Info.plist` to add or modify permission strings (e.g., for Camera or Location).
  - **Android**: Edit `android/app/src/main/AndroidManifest.xml` to add permission tags.
- **Native Code**: If you need to write custom native Swift/Kotlin code, you can do so directly within the `ios` and `android` projects.
