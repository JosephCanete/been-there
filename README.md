# 🇵🇭 Been There Philippines

A modern, interactive travel tracking application for exploring the beautiful archipelago of the Philippines. Track your adventures, mark regions you've visited, and visualize your Philippine journey.

![Been There Philippines](https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🗺️ Interactive Map
- **Full-screen interactive SVG map** of the Philippines with all regions
- **Pan and zoom functionality** for detailed exploration
- **Click-to-mark regions** with different visit statuses
- **Visual feedback** with color-coded regions
- **Mobile-responsive design** optimized for all devices

### 📊 Travel Status Tracking
- **Been There** 🟢 - Places you've visited and explored
- **Stayed There** 🔵 - Destinations where you've spent the night
- **Passed By** 🟡 - Places you've passed through during transit
- **Not Visited** ⚪ - Areas you haven't explored yet

### 🔐 Authentication & Personalization  
- **Google OAuth integration** for secure sign-in
- **Protected routes** for personalized experiences
- **User profile display** with Google account information
- **Session management** with persistent login state

### 📈 Statistics Dashboard
- **Progress tracking** with completion percentages
- **Detailed breakdowns** of visited regions
- **Achievement system** with unlockable badges:
  - 🌟 First Explorer (1+ regions)
  - 🗺️ Regional Explorer (5+ regions)  
  - 🏝️ Island Hopper (10+ regions)
  - 🏆 Halfway Hero (50%+ completion)
  - 🇵🇭 Philippines Master (100% completion)
- **Visual progress bars** and charts

### 💾 Data Persistence
- **Local storage** for offline functionality
- **Automatic save/load** of travel progress
- **Cross-session persistence** of marked regions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Google OAuth credentials (for authentication)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/JosephCanete/been-there.git
cd been-there
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a \`.env.local\` file in the root directory:
\`\`\`env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

4. **Get Google OAuth credentials**
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add \`http://localhost:3000/api/auth/callback/google\` to authorized redirect URIs

5. **Generate NextAuth Secret**
\`\`\`bash
openssl rand -base64 32
\`\`\`

6. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

7. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

\`\`\`
src/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── api/auth/[...nextauth]/   # NextAuth.js API route
│   ├── auth/signin/              # Custom sign-in page
│   ├── map/                      # Interactive map page
│   ├── stats/                    # Statistics dashboard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable React components
│   ├── AuthProvider.tsx          # Authentication provider
│   ├── InteractiveMap.tsx        # Main map component
│   ├── InteractiveMapReal.tsx    # Enhanced map component
│   ├── MapLegend.tsx             # Map legend component
│   ├── MapStats.tsx              # Statistics component
│   └── ProtectedRoute.tsx        # Route protection wrapper
├── data/                         # Static data files
│   ├── philippineRegions.ts      # Region definitions
│   └── regionCoordinates.ts      # Coordinate mappings
├── types/                        # TypeScript type definitions
│   └── map.ts                    # Map-related types
└── utils/                        # Utility functions
    └── mapUtils.ts               # Map helper functions
\`\`\`

## 🛠️ Built With

### Core Technologies
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework

### Authentication & Security
- **[NextAuth.js](https://next-auth.js.org/)** - Complete authentication solution
- **Google OAuth Provider** - Secure Google sign-in integration
- **Protected Routes** - Route-level authentication guards

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Turbopack](https://turbo.build/pack)** - Fast development bundler
- **PostCSS** - CSS preprocessing

## 📱 Usage

### 1. Landing Page
- **Welcome interface** with authentication status
- **Feature previews** and call-to-action buttons
- **Sign in with Google** for full access

### 2. Interactive Map
- **Click regions** to cycle through visit statuses
- **Pan and zoom** to explore different areas
- **Real-time progress** updates in the sidebar
- **Legend** showing all status types

### 3. Statistics Dashboard
- **Overview cards** showing completion percentage
- **Detailed breakdowns** of visited regions
- **Achievement badges** for milestones
- **Progress visualization** with charts

### 4. About Page
- **How-to guide** for using the application
- **Feature explanations** with visual examples
- **Tips and best practices** for travel tracking

## 🎨 Design Features

- **Modern gradient design** with blue-to-indigo theme
- **Responsive layout** for mobile and desktop
- **Smooth animations** and transitions
- **Accessible UI** with proper contrast and focus states
- **Loading states** and error handling
- **Professional typography** with clear hierarchy

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| \`NEXTAUTH_URL\` | Application URL | ✅ |
| \`NEXTAUTH_SECRET\` | NextAuth.js secret key | ✅ |
| \`OAUTH_CLIENT_ID\` | Google OAuth client ID | ✅ |
| \`GOOGLE_CLIENT_SECRET\` | Google OAuth client secret | ✅ |

### Available Scripts
- \`npm run dev\` - Start development server with Turbopack
- \`npm run build\` - Build production application  
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint code analysis

## 🌟 Key Features in Detail

### Interactive SVG Map
- High-quality vector graphics for crisp display at any zoom level
- Predefined coordinate system for accurate region positioning
- Color-coded regions based on visit status
- Hover effects and click interactions

### Data Management
- Local storage for offline functionality
- Automatic data persistence across sessions
- Import/export capabilities for backup
- Real-time statistics calculation

### User Experience
- Intuitive click-to-mark interface
- Visual feedback for all interactions
- Progress tracking with achievements
- Mobile-optimized touch interactions

## 🚧 Future Enhancements

- [ ] Export travel data to PDF/CSV
- [ ] Share travel maps on social media
- [ ] Add travel notes and photos to regions
- [ ] Travel timeline and history view
- [ ] Multi-user collaboration features
- [ ] Offline-first PWA capabilities
- [ ] Integration with travel APIs
- [ ] Advanced statistics and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Joseph Canete** - [GitHub](https://github.com/JosephCanete)

## 🙏 Acknowledgments

- Philippines SVG map data and geographic boundaries
- Google Maps for inspiration on interactive mapping
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- The Filipino developer community

---

<div align="center">
  <p>Made with ❤️ for Filipino travelers and adventurers</p>
  <p>🇵🇭 <strong>Mabuhay Philippines!</strong> 🇵🇭</p>
</div>
