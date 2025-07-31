# OneDraw 🎨

> A Modern Collaborative Designing Tool

**OneDraw** is a powerful, web-based collaborative designing tool that enables multiple users to create, edit, and design together in real-time. Built with modern web technologies, it provides an intuitive interface for teams, educators, and creative professionals to collaborate seamlessly on visual projects.

## 🌟 Features

### Core Functionality
- **Real-time Collaboration** - Multiple users can draw and design simultaneously
- **Vector-based Drawing** - Scalable graphics using modern web standards
- **Comprehensive Design Tools** - Complete toolkit for creating professional designs
- **Live User Presence** - See who's online and track real-time cursors
- **Project Management** - Save, load, and organize your design projects
- **Cross-platform** - Works seamlessly across all modern web browsers

### Design Tools
- 🖊️ **Freehand Drawing** - Pen and brush tools with pressure sensitivity
- 📐 **Shape Tools** - Rectangles, circles, lines, arrows, and custom shapes
- 📝 **Text Editor** - Rich text editing with typography controls
- 🎨 **Color Management** - Advanced color palettes and picker
- 📚 **Layer System** - Organize elements with professional layer management
- ↩️ **Undo/Redo** - Full history tracking for all operations

### Collaboration Features
- 👥 **Multi-user Editing** - Simultaneous editing without conflicts
- 💬 **Real-time Communication** - Built-in chat and commenting system
- 🔐 **Access Control** - Granular permissions and sharing options
- 👀 **Live Cursors** - See other users' cursors and selections in real-time
- 🔄 **Conflict Resolution** - Smart handling of simultaneous edits

## 🏗️ Technical Architecture

### Frontend Stack
```
React 18+ with TypeScript
├── 19 TSX Components - React UI components
├── 14 TS Modules - Business logic and utilities
├── 5 JS Files - Additional functionality
└── Modern CSS - Responsive and accessible styling
```

### Backend Infrastructure
```
Node.js + TypeScript
├── Prisma ORM - Type-safe database operations
├── SQL Database - Persistent data storage
├── WebSocket Server - Real-time communication
└── REST/GraphQL APIs - Frontend-backend communication
```

### Key Technologies
- **Frontend**: React, TypeScript, Modern CSS, Canvas/SVG
- **Backend**: Node.js, Prisma ORM, WebSockets
- **Database**: SQL with Prisma migrations
- **Build Tools**: Modern bundling and optimization
- **Development**: Hot reload, TypeScript checking, ESLint

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hemant2335/OneDraw.git
   cd OneDraw
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Access the application**
   ```
   Open http://localhost:3000 in your browser
   ```

## 📁 Project Structure

```
OneDraw/
├── src/
│   ├── components/          # React components (TSX)
│   │   ├── Canvas/         # Drawing canvas components
│   │   ├── Tools/          # Design tool components
│   │   ├── UI/             # Interface components
│   │   └── Collaboration/  # Real-time features
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── services/           # API and business logic
│   └── styles/             # CSS and styling
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── docs/                   # Documentation
└── tests/                  # Test suites
```

## 🎯 Use Cases

### Professional Teams
- **Design Collaboration** - Teams working on visual projects
- **Brainstorming Sessions** - Visual ideation and planning
- **Prototyping** - Quick mockups and wireframes
- **Client Presentations** - Interactive design reviews

### Educational
- **Teaching Tool** - Visual learning and instruction
- **Student Projects** - Collaborative assignments
- **Workshops** - Interactive design sessions
- **Remote Learning** - Online collaborative exercises

### Creative Projects
- **Artistic Collaboration** - Multi-artist creative projects
- **Community Art** - Open collaborative artworks
- **Design Challenges** - Competitive design events
- **Personal Projects** - Individual creative expression

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="your-database-connection-string"

# Authentication
JWT_SECRET="your-jwt-secret"
AUTH_PROVIDER="your-auth-provider"

# Real-time Features
WEBSOCKET_PORT=3001
REDIS_URL="your-redis-connection"

# File Storage
STORAGE_PROVIDER="local|aws|gcp"
STORAGE_PATH="/uploads"
```

### Customization Options
- **Theme Configuration** - Custom colors and styling
- **Tool Presets** - Default tool configurations
- **Collaboration Settings** - User limits and permissions
- **Performance Settings** - Optimization parameters

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
docker build -t onedraw .
docker run -p 3000:3000 onedraw
```

### Cloud Platforms
- **Vercel**: One-click deployment with automatic scaling
- **Netlify**: Static site deployment with serverless functions
- **AWS/GCP**: Full infrastructure deployment
- **Docker**: Containerized deployment anywhere

## 🧪 Development

### Running Tests
```bash
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
```

### Code Quality
```bash
npm run lint              # ESLint checking
npm run type-check        # TypeScript validation
npm run format            # Prettier formatting
```

### Database Operations
```bash
npx prisma studio         # Database GUI
npx prisma migrate dev    # Create migration
npx prisma db seed        # Seed database
```

## 📊 Performance Features

### Optimization Strategies
- **Efficient Rendering** - Optimized canvas operations and updates
- **State Management** - Minimized re-renders and memory usage
- **Network Optimization** - Compressed real-time updates
- **Caching** - Intelligent caching for faster loading
- **Code Splitting** - Lazy loading for optimal bundle size

### Scalability
- **Horizontal Scaling** - Multi-server deployment support
- **Database Optimization** - Efficient queries and indexing
- **CDN Integration** - Global asset distribution
- **Load Balancing** - Traffic distribution across servers

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Involved
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper tests
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting
- Be respectful and constructive in discussions

### Areas for Contribution
- 🐛 **Bug Fixes** - Help resolve issues and improve stability
- ✨ **New Features** - Add exciting new functionality
- 📖 **Documentation** - Improve guides and API docs
- 🎨 **UI/UX** - Enhance the user experience
- ⚡ **Performance** - Optimize speed and efficiency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Prisma Team** - For the excellent ORM and database tools
- **TypeScript Team** - For type safety and developer experience
- **Open Source Community** - For inspiration and contributions

## 📞 Support & Contact

- **GitHub Issues** - [Report bugs and feature requests](https://github.com/Hemant2335/OneDraw/issues)
- **Discussions** - [Join community discussions](https://github.com/Hemant2335/OneDraw/discussions)
- **Author** - [@Hemant2335](https://github.com/Hemant2335)

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Basic drawing tools and canvas
- ✅ Real-time collaboration
- ✅ User authentication
- ✅ Project management

### Version 1.1 (Upcoming)
- 🔄 Advanced shape tools
- 🔄 Enhanced text editing
- 🔄 Mobile responsiveness
- 🔄 Performance optimizations

### Version 2.0 (Future)
- 📅 Plugin system
- 📅 Advanced animation tools
- 📅 AI-powered features
- 📅 Enterprise features

---

**Made with ❤️ by the OneDraw team**

*OneDraw - Where ideas come to life through collaboration*
