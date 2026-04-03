# myFit Frontend

myFit Frontend is a cross-platform fitness and health application built with React Native (Expo), supporting Android, iOS, and Web.

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack%20Query-5.x-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-4.x-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white)
![AWS Cognito](https://img.shields.io/badge/AWS%20Cognito-Auth-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)

## Table of Contents

1. Project Overview
2. Tech Stack
3. Prerequisites
4. Run Locally
5. Environment Variables
6. Project Structure
7. Main Features
8. Backend Integration Notes
9. GitHub Flow
10. Deployment
11. Troubleshooting

## 1. Project Overview

The frontend provides:

- Authentication with AWS Cognito
- Workout planning and workout session tracking
- Diet and calorie tracking
- Health metrics and charts
- AI chat support
- User profile management

## 2. Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React Native with Expo (SDK 54) |
| Language | TypeScript |
| Navigation | React Navigation v7 |
| API Client | Axios |
| Server State | TanStack React Query v5 |
| Global State | Redux Toolkit |
| Styling | NativeWind (Tailwind for React Native) |
| Auth | AWS Cognito + expo-auth-session |
| Secure Storage | expo-secure-store |
| Charts | react-native-gifted-charts |
| Build/Delivery | Expo CLI, EAS, GitHub Actions |

## 3. Prerequisites

- Node.js 20+
- npm 10+
- Git
- Expo Go app (for physical device testing)
- Android Studio (Android emulator)
- Xcode (iOS simulator, macOS only)

Optional for native build/release:

- EAS CLI (`npm install -g eas-cli`)

## 4. Run Locally

### 4.1 Install dependencies

```bash
cd myFit-FrontEnd
npm install
```

### 4.2 Configure environment

Create `.env` from `.env.sample`.

PowerShell:

```powershell
Copy-Item .env.sample .env
```

Bash:

```bash
cp .env.sample .env
```

Update values in `.env` as needed (especially API base URL for your local network).

### 4.3 Start development server

```bash
npm start
```

`npm start` and `npm run start` are equivalent (both run `expo start`).

Or run one platform command directly:

```bash
npm run android
npm run ios
npm run web
```

Notes:

- If you test on a physical phone, do not use `localhost` for backend URL. Use your machine LAN IP (example: `http://192.168.1.9:8080`).
- Ensure backend and mobile device are on the same network.

## 5. Environment Variables

The project currently uses the following public Expo variables:

```env
EXPO_PUBLIC_NODE_ENV=development
EXPO_PUBLIC_BACKEND_API_URL=http://192.168.1.9:8080
EXPO_PUBLIC_COGNITO_URL=https://us-east-19aokpqzo1.auth.us-east-1.amazoncognito.com/login?client_id=...&response_type=code&scope=email+openid+profile
```

Guidelines:

- Keep secrets out of source control.
- Only use `EXPO_PUBLIC_*` for values safe to expose to the client.
- Use production values in CI/CD pipeline, not in local `.env`.

## 6. Project Structure

```text
myFit-FrontEnd/
  .github/workflows/deploy-frontend.yml
  docs/
  src/
    api/             # axios client and interceptors
    app/             # app providers and app bootstrap
    components/      # reusable UI components
    config/          # app constants/config
    hooks/           # typed/custom hooks
    layouts/         # shared layout wrappers
    navigation/      # stacks, tabs, root navigator
    screens/         # feature screens
    services/        # API service layer
    store/           # Redux store and slices
    types/           # shared TypeScript types
    utils/           # helper utilities
  app.json
  eas.json
  package.json
```

## 7. Main Features

- Auth: Cognito login flow with token handling and secure local storage.
- Workout: browse exercises, manage plans, track sessions.
- Diet: track food, calories, and macros.
- Health: body metrics, calculations (BMI/BMR/TDEE), trend charts.
- AI Chat: assistant for fitness and nutrition guidance.
- Profile: user data management and account actions.

## 8. Backend Integration Notes

This frontend is designed to work with the backend repository in `../myFit-api`.

Integration highlights:

- API base URL is configured by `EXPO_PUBLIC_BACKEND_API_URL`.
- Auth follows Cognito + OAuth flow.
- Backend accepts access token for API authorization.
- Frontend parses ID token for client-side profile claims when needed.

If backend is not running, screens that rely on API calls will fail to load data.

## 9. GitHub Flow

Recommended branch model in this project:

- `main`: production-ready branch (web deploy pipeline is triggered from this branch).
- `develop`: integration branch for feature merge before production release.

### Feature workflow

1. Branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<short-name>
```

2. Commit using Conventional Commits:

```bash
git add .
git commit -m "feat: add workout plan filtering"
```

3. Push and open PR to `develop`.
4. Request review and address comments.
5. Merge into `develop`.
6. Open PR from `develop` to `main` for release.
7. Merge to `main` to trigger deployment.

### Branch naming

- `feature/<name>`
- `fix/<name>`
- `hotfix/<name>`
- `chore/<name>`
- `refactor/<name>`

## 10. Deployment

### 10.1 Automated Web Deployment (GitHub Actions)

The repository contains an automated workflow:

- File: `.github/workflows/deploy-frontend.yml`
- Trigger: push to `main` or manual dispatch

Current pipeline steps:

1. Checkout source
2. Configure AWS credentials (OIDC)
3. Install dependencies
4. Build Expo web bundle (`npx expo export --platform web --clear`)
5. Detect output folder (`dist` or `web-build`)
6. Sync static files to S3 bucket
7. Invalidate CloudFront distribution

Environment values are configured in the workflow for:

- `AWS_REGION`
- `EXPO_PUBLIC_BACKEND_API_URL`
- `EXPO_PUBLIC_COGNITO_URL`
- `FRONTEND_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

### 10.2 Manual Web Deployment (optional)

If you need manual deploy from local machine:

```bash
npm install
npx expo export --platform web --clear
aws s3 sync dist s3://<your-frontend-bucket> --delete --region <aws-region>
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

### 10.3 Native Build (EAS)

EAS profiles are configured in `eas.json` (`development`, `preview`, `production`, `production-apk`).

Examples:

```bash
eas build --platform android --profile development
eas build --platform android --profile production
eas build --platform ios --profile production
```

## 11. Troubleshooting

- App cannot reach backend on phone:
  - Use LAN IP instead of `localhost` in `.env`.
  - Verify backend is running and firewall allows traffic.
- Auth redirect issues:
  - Verify `EXPO_PUBLIC_COGNITO_URL` domain/client settings.
  - Verify app redirect handling in auth service.
- Web build output not found in CI:
  - Check whether Expo emitted `dist` or `web-build`.
