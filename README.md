# Rayo - Production Expo App 🚀

A production-ready Expo application with a clean, scalable architecture.

## 🏗️ Project Structure

```
Rayo/
├── app/                    # Expo Router navigation
│   ├── (tabs)/            # Tab-based routes
│   ├── _layout.tsx        # Root layout with providers
│   └── modal.tsx          # Modal screens
├── src/                    # Source code (production structure)
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── services/          # API services & HTTP client
│   ├── contexts/          # React Context (Auth included)
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utilities (storage, validation, formatting)
│   ├── types/             # TypeScript definitions
│   ├── config/            # Environment & app configuration
│   └── constants/         # Theme & constants
└── assets/                # Static assets
```

## 🚀 Get Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the app

```bash
npm start
```

Choose your platform:

- **a** - Open on Android
- **i** - Open on iOS
- **w** - Open in web browser

## 📦 Features

- ✅ **Production-ready architecture** with clear separation of concerns
- ✅ **Type-safe API client** with error handling
- ✅ **Authentication context** with storage persistence
- ✅ **Utility functions** for validation, formatting, storage
- ✅ **Path aliases** configured for clean imports
- ✅ **Environment configuration** for dev/staging/prod

## 🛠️ Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser
npm run lint       # Lint code
```

## 📖 Documentation

For detailed information about the project structure and features, see:

- [STRUCTURE.md](STRUCTURE.md) - Complete architecture documentation
- [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Setup summary
- [FIXES_APPLIED.md](FIXES_APPLIED.md) - Recent fixes and improvements

## 🔧 Technology Stack

- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## 🤝 Contributing

This is a production-ready starter template. Feel free to customize it for your needs.

## 📄 License

This project is open source and available under the MIT License.
