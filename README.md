# 1337 Pool Rank - Leaderboard System

A comprehensive ranking system for 1337 School poolers across Morocco campuses, built with React, TypeScript, and Deno.

## 🌟 Features

- **Real-time Rankings**: Live leaderboard of poolers sorted by level
- **Multi-Campus Support**: Tétouan, Rabat, Benguerir, and Khouribga campuses
- **42 OAuth Integration**: Secure authentication using 42 Intra API
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Interactive Podium**: Special display for top 3 performers
- **Infinite Scroll**: Load more users dynamically
- **User Profiles**: Direct links to 42 Intra profiles

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite
- **State Management**: React Hooks

### Backend (Deno + Oak)
- **Runtime**: Deno
- **Framework**: Oak (Express-like framework for Deno)
- **Database**: AloeDB (JSON-based database)
- **API Integration**: 42 Intra API

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Environment**: Production-ready setup

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- 42 Intra API credentials

### Environment Setup

1. **Backend Environment** (\`backend/.env\`):
\`\`\`env
UID=your_42_client_id
SECRET=your_42_client_secret
REDIRECT_URI=http://localhost/callback
BASE_URL=https://api.intra.42.fr
\`\`\`

2. **Frontend Environment** (\`app/.env\`):
\`\`\`env
VITE_CLIENT_ID=your_42_client_id
VITE_REDIRECT_URI=http://localhost/callback
VITE_PUBLIC_API_URL=http://localhost/api
\`\`\`

### Running the Application

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd Leaderboard1337-main

# Start all services
docker-compose up -d

# Access the application
open http://localhost
\`\`\`

## 📱 User Journey

### 1. Authentication Flow
1. User visits the login page
2. Clicks "Login with Intra" → Redirects to 42 OAuth
3. After authorization → Redirects to \`/callback\`
4. Backend processes the auth code and fetches user data
5. User is redirected to their campus leaderboard: \`/{campus_name}/{begin_at}\`

### 2. Leaderboard Experience
- **Top 3 Podium**: Special animated display for top performers
- **Complete Rankings**: Scrollable list of all poolers
- **User Cards**: Avatar, name, login, and level information
- **Campus/Promo Selection**: Dropdown filters for different cohorts
- **Profile Links**: Click any user to view their 42 profile

## 🔧 API Endpoints

### Authentication
- \`POST /api/login\` - Exchange OAuth code for access token

### Data Fetching
- \`POST /api/cursus_users\` - Get ranked users for specific campus/promo
- \`GET /api/campuses\` - Get available campuses

## 🎨 UI Components

### Key Pages
- **Login** (\`/src/pages/Login.tsx\`) - OAuth authentication
- **Callback** (\`/src/pages/Callback.tsx\`) - Handle OAuth redirect
- **Home** (\`/src/pages/Home.tsx\`) - Main leaderboard interface

### Styling Features
- **Glass Morphism**: Translucent cards with backdrop blur
- **Gradient Animations**: Dynamic color transitions
- **Responsive Design**: Mobile-first approach
- **Custom Animations**: Floating, pulsing, and stagger effects

## 🏛️ Campus Support

Currently supports 4 campuses:
- **Tétouan** (ID: 55)
- **Rabat** (ID: 75)
- **Benguerir** (ID: 21)
- **Khouribga** (ID: 16)

## 📊 Data Structure

### User Data
\`\`\`typescript
interface UserData {
  id: number | null
  order: number        // Ranking position
  login: string       // 42 username
  image: string       // Profile picture URL
  lvl: string         // Current level (e.g., "3.42")
  campus?: string     // Campus name
}
\`\`\`

### Campus Data
\`\`\`typescript
interface Campus {
  id: number
  name: string
}
\`\`\`

## 🔒 Security Features

- **OAuth 2.0**: Secure authentication via 42 Intra
- **Token Management**: Secure token storage and validation
- **CORS Protection**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data protection

## 🚀 Deployment

### Production Setup
1. Update environment variables for production URLs
2. Configure SSL certificates (recommended)
3. Set up domain DNS records
4. Deploy using Docker Compose

### Nginx Configuration
The included nginx.conf handles:
- Frontend routing (React Router)
- API proxying to backend
- Static asset serving
- WebSocket support for development

## 🛠️ Development

### Frontend Development
\`\`\`bash
cd app
npm install
npm run dev
\`\`\`

### Backend Development
\`\`\`bash
cd backend
deno run --allow-net --allow-read --allow-write main.ts
\`\`\`

### Database
- Uses JSON files for data persistence
- Automatic promo creation for new users
- Campus data cached locally

## 📈 Performance Optimizations

- **Lazy Loading**: Users loaded in batches of 100
- **Image Optimization**: Optimized avatar loading
- **Caching**: User details cached to reduce API calls
- **Pagination**: Infinite scroll for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include environment details and error logs

## 🔮 Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search
- [ ] Historical ranking data
- [ ] Performance analytics
- [ ] Mobile app version
- [ ] Additional campus support

---

**Built with ❤️ for the 1337 School community**
\`\`\`
