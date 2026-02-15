# Rayo - Accessibility Mapping for Public Services in Rwanda

## Description

Rayo empowers users to discover and evaluate accessibility features of public service buildings across Rwanda. Instead of relying on disability labels, the app uses a needs-based framework to present information about:

- Step-free entrances and pathways
- Elevator availability and accessibility
- Service locations within buildings
- Signage and wayfinding support
- Floor-by-floor accessibility details

The system combines:

- **Mobile App**: React Native/Expo interface with interactive maps showing service locations
- **Backend System**: Structured environmental data storage with RESTful APIs
- **Machine Learning**: Classification and consistency validation of accessibility features

By providing transparency about physical accessibility, Rayo helps users plan their visits to essential services like government offices, banks, educational institutions, and healthcare facilities.

## GitHub Repository

[https://github.com/Ruran8wa/Rayo](https://github.com/Ruran8wa/Rayo)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Expo Go app (iOS/Android) for testing
- Git

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ruran8wa/Rayo.git
   cd Rayo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```
   API_BASE_URL=https://api.rayo.rw
   MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. **Start the development server**

   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

### Project Structure

```
Rayo/
├── app/                    # Expo Router navigation
│   ├── (tabs)/            # Tab navigation (Explore, Buildings, Profile)
│   └── _layout.tsx        # Root layout with providers
├── src/
│   ├── screens/           # Main screens (ExploreScreen, BuildingsScreen)
│   ├── components/        # Reusable UI components
│   ├── services/          # API client and services
│   ├── contexts/          # React Context (Auth, Location)
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript definitions
│   └── config/            # App configuration
└── assets/                # Images, fonts, icons
```

## Designs

### Application Screenshots

**Explore Screen - Map View**

- Interactive Leaflet map centered on Kigali
- Green location markers for accessible services
- Search bar with voice input
- Category filters (Schools, Government, Banks)
- Draggable bottom sheet with service listings

**Service Details**

- Service name and address
- Open/Closed status with opening hours
- Accessibility indicators (Fully Accessible / Limited Access)
- Visual icons for service types

**Bottom Sheet - Services Panel**

- Collapsible panel (15% to 80% screen height)
- Filter options: Sort by, Open now, Fully Accessible
- Scrollable list of nearby services
- Quick accessibility status at a glance

### Figma Design

- [Figma Design File](https://www.figma.com/design/X89riJUJCWXBi5NzDRO9eq/Rayo?node-id=4-83&t=xFfoHjMyFaxsoGdT-1)

## Technology Stack

### Frontend (Mobile App)

- **Framework**: Expo SDK 54
- **Language**: TypeScript 5.9
- **UI Library**: React Native 0.81
- **Navigation**: Expo Router 6.0
- **Maps**: Leaflet 1.9 via react-native-webview
- **State Management**: React Context API
- **Storage**: AsyncStorage

### Backend (Planned)

- **Framework**: NestJS (Node.js)
- **Database**: Supabase (PostgreSQL with PostGIS, Auth, Storage)
- **API**: RESTful with JWT authentication (via Supabase Auth)
- **ML Service**: Python with TensorFlow/PyTorch
- **Hosting**: Supabase (backend services), Vercel/Railway (NestJS API if needed)
- **Note**: Supabase provides hosted PostgreSQL, authentication, file storage, and real-time subscriptions. Additional cloud infrastructure (AWS/Azure) may only be needed for ML model hosting or scaling beyond Supabase's limits.

### Development Tools

- **Version Control**: Git & GitHub
- **Code Quality**: ESLint, TypeScript strict mode
- **Module Resolution**: Path aliases (@components, @services, etc.)
