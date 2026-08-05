# KCN Command Center — Four Independent Systems

These four systems are being built as **separate projects**.  
They can later integrate under a unified KCN Command Center, but each stands alone as a fully functional platform.

**Owner access**: Fully free and unrestricted for the creator.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Projects](#projects)
  - [1. KCN Worldview](#1-kcn-worldview)
  - [2. KCN Cyber Security Headquarters](#2-kcn-cyber-security-headquarters)
  - [3. KCN Nano Banana World Design](#3-kcn-nano-banana-world-design)
  - [4. KCN Human AI Personal Growth & Development](#4-kcn-human-ai-personal-growth--development)
- [Installation & Setup](#installation--setup)
- [Development](#development)
- [Contributing](#contributing)
- [Project Status](#project-status)
- [License](#license)

---

## Overview

The **KCN Command Center** is an umbrella repository for four independent, integrated platforms designed to work together or standalone. Each system serves a distinct purpose but can leverage shared data models and infrastructure.

**Key Features Across All Systems:**
- 🌍 **Globe-based Visualization** — Interactive world maps for data exploration
- 🔗 **Entity Relationships** — Connected data and knowledge graphs
- 📊 **Real-time Data Fusion** — Multi-source intelligence aggregation
- 🛡️ **Security-First Design** — Privacy by default, role-based access
- 🤖 **AI-Powered Intelligence** — Smart recommendations and anomaly detection
- 📱 **Modern UI/UX** — React-based responsive interfaces

---

## Project Structure

```
kcn-worldview-command-center/
├── README.md                                    # This file
├── CONTRIBUTING.md                              # Contribution guidelines
├── .github/
│   ├── workflows/                              # CI/CD pipelines
│   └── ISSUE_TEMPLATE/                         # Issue templates
│
├── KCN-Worldview/
│   ├── README.md                               # Project-specific docs
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── ...
│
├── KCN-Cyber-Security-Headquarters/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   └── ...
│
├── KCN-Nano-Banana-World-Design/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   └── ...
│
└── KCN-Human-AI-Personal-Growth-Development/
    ├── README.md
    ├── package.json
    ├── src/
    └── ...
```

---

## Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or **yarn**)
- **Git**

### Clone & Navigate

```bash
# Clone the repository
git clone https://github.com/Evank253/kcn-worldview-command-center.git
cd kcn-worldview-command-center

# Navigate to any project
cd KCN-Worldview
```

### Install & Run (Per Project)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Each project runs independently on its own port (typically 5173+).

---

## Projects

### 1. KCN Worldview

**Path**: `./KCN-Worldview`

**Purpose**: Intelligence and knowledge-graph platform inspired by public recreations of Palantir-style systems.

**Key Features:**
- 🌐 Interactive 3D globe view with zoomable regions
- 🔗 Entity relationship mapping and knowledge graphs
- 📡 Multi-source data fusion and aggregation
- 🎯 Customizable data layers (cyber events, geopolitics, market intelligence)
- 📊 Advanced filtering and search capabilities
- 🔐 Role-based access control

**Technology Stack:**
- React 18.3+
- Three.js (3D globe rendering)
- Data processing pipeline
- RESTful API

**Getting Started:**
```bash
cd KCN-Worldview
npm install
npm run dev
# Open http://localhost:5173
```

**Documentation**: [KCN-Worldview/README.md](./KCN-Worldview/README.md)

---

### 2. KCN Cyber Security Headquarters

**Path**: `./KCN-Cyber-Security-Headquarters`

**Purpose**: Dedicated cyber intelligence platform for threat detection, incident response, and security monitoring.

**Key Features:**
- 🌍 Dedicated globe view for cyber-geographic attack mapping
- 📋 Wireshark-style live event list with packet-level details
- 💻 Systems health and infrastructure monitoring
- ⚠️ Attack and anomaly tracking with severity scoring
- 🚨 Real-time alert aggregation
- 🔍 Threat intelligence correlation

**Technology Stack:**
- React 18.3+
- WebSocket for real-time data
- Network data processing
- SIEM integration APIs

**Getting Started:**
```bash
cd KCN-Cyber-Security-Headquarters
npm install
npm run dev
# Open http://localhost:5174
```

**Documentation**: [KCN-Cyber-Security-Headquarters/README.md](./KCN-Cyber-Security-Headquarters/README.md)

---

### 3. KCN Nano Banana World Design

**Path**: `./KCN-Nano-Banana-World-Design`

**Purpose**: Full virtual architecture and landscape design platform with AI-powered design optimization.

**Key Features:**
- 🏗️ Full 3D virtual architecture editor (interior + exterior)
- 🌳 Landscape design and terrain generation
- 🤖 AI design swarm for automated optimization
- 📦 Real market catalogs with live pricing
- 📊 Cost estimation and quantity calculations
- ✅ Building code compliance checking
- 📈 End-to-end project job tracking

**Technology Stack:**
- React 18.3+
- Three.js (3D scene rendering)
- AI/ML design engine
- Database for material/cost catalogs
- Project management system

**Getting Started:**
```bash
cd KCN-Nano-Banana-World-Design
npm install
npm run dev
# Open http://localhost:5175
```

**Documentation**: [KCN-Nano-Banana-World-Design/README.md](./KCN-Nano-Banana-World-Design/README.md)

---

### 4. KCN Human AI Personal Growth & Development

**Path**: `./KCN-Human-AI-Personal-Growth-Development`

**Purpose**: Self-discovery and personal development platform powered by AI coaching and skill tracking.

**Key Features:**
- 👤 Comprehensive personal profile and identity management
- 🎯 Career pathway and skills mapping
- 📄 Resume and portfolio builder with templates
- 🏆 Proof-of-skill system with verification
- 🤖 Privacy-first AI companion for coaching
- 📚 Learning path recommendations
- 🔒 Privacy-by-default architecture

**Technology Stack:**
- React 18.3+
- AI/ML recommendation engine
- Secure authentication
- Data encryption and privacy controls
- Portfolio management system

**Getting Started:**
```bash
cd KCN-Human-AI-Personal-Growth-Development
npm install
npm run dev
# Open http://localhost:5176
```

**Documentation**: [KCN-Human-AI-Personal-Growth-Development/README.md](./KCN-Human-AI-Personal-Growth-Development/README.md)

---

## Installation & Setup

### Global Setup (All Projects)

```bash
# Clone repository
git clone https://github.com/Evank253/kcn-worldview-command-center.git
cd kcn-worldview-command-center

# Install all dependencies (if using monorepo setup)
npm install

# Or install per project
cd KCN-Worldview && npm install && cd ..
cd KCN-Cyber-Security-Headquarters && npm install && cd ..
cd KCN-Nano-Banana-World-Design && npm install && cd ..
cd KCN-Human-AI-Personal-Growth-Development && npm install && cd ..
```

### Environment Configuration

Each project may require environment variables. Create a `.env.local` file in each project root:

**Example for KCN Worldview:**
```env
VITE_API_URL=http://localhost:3000
VITE_GLOBE_RESOLUTION=1024
VITE_MAX_ENTITIES=10000
```

Refer to each project's README for specific environment variables.

### Development Server

```bash
# Run individual project
cd KCN-Worldview
npm run dev

# Or run all projects in parallel (if monorepo is configured)
npm run dev:all
```

### Production Build

```bash
cd KCN-Worldview
npm run build

# Preview build
npm run preview
```

---

## Development

### Code Standards

- **Language**: JavaScript/TypeScript
- **Framework**: React 18.3+
- **Build Tool**: Vite 8.2+
- **Linting**: ESLint (configured per project)
- **Code Formatting**: Prettier (configured per project)
- **Testing**: Jest + React Testing Library (recommended)

### Git Workflow

1. Create a feature branch from `Python-3`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit with clear messages:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. Push and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Request review and merge after approval.

### Running Tests

```bash
cd KCN-Worldview
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage  # Coverage report
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Before You Start

1. **Check Issues**: Look at open issues first to avoid duplicate work
2. **Discuss Large Changes**: Open an issue to discuss major features
3. **Fork & Branch**: Work on a feature branch, not `Python-3`

### Contribution Process

1. **Fork** this repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Make** your changes with meaningful commits
4. **Test** locally: `npm run dev` and `npm run build`
5. **Push** to your fork
6. **Create** a Pull Request with:
   - Clear description of changes
   - Link to related issue (if applicable)
   - Screenshots for UI changes
   - Test results

### Code Review Process

- All PRs require at least one approval
- GitHub Actions must pass (linting, builds, tests)
- Code must follow project standards
- Descriptive commit messages required

### Reporting Bugs

**Title**: `[Project Name] Brief description`

**Description** should include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/videos (if applicable)
- Environment info (OS, Node version, etc.)

### Requesting Features

**Title**: `[Project Name] Feature request: description`

**Description** should include:
- Use case / problem being solved
- Proposed solution
- Alternatives considered
- Additional context

---

## Project Status

| Project | Status | Latest Update |
|---------|--------|---|
| KCN Worldview | 🟡 In Development | 2026-08-05 |
| KCN Cyber Security HQ | 🟡 In Development | 2026-08-05 |
| KCN Nano Banana Design | 🟡 In Development | 2026-08-05 |
| KCN Human AI Growth | 🟡 In Development | 2026-08-05 |

**Legend:**
- 🟢 Production Ready
- 🟡 In Development
- 🔴 Not Started

---

## Roadmap

### Q3 2026
- [ ] Complete Worldview entity mapping
- [ ] Implement Cyber HQ live data pipeline
- [ ] Launch Nano Banana 3D editor beta
- [ ] Deploy Human AI profile system

### Q4 2026
- [ ] Cross-project data sync
- [ ] Unified dashboard
- [ ] Advanced analytics
- [ ] Performance optimizations

---

## Support & Resources

### Documentation
- **Main Docs**: Each project has its own `README.md`
- **API Docs**: (Link to API documentation)
- **Architecture Docs**: (Link to architecture diagrams)

### Community
- **Issues**: [GitHub Issues](https://github.com/Evank253/kcn-worldview-command-center/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Evank253/kcn-worldview-command-center/discussions)
- **Email**: (your contact info)

### Troubleshooting

**npm install fails:**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
# Use a different port
npm run dev -- --port 5180
```

**Build fails:**
```bash
# Check Node version (should be 18+)
node --version

# Clear build artifacts
rm -rf dist
npm run build
```

---

## License

All projects in the KCN Command Center are licensed under the **MIT License**.  
See [LICENSE](./LICENSE) for details.

**Attribution**: Based on public architectural principles from Palantir Gotham and similar intelligence platforms.

---

## Acknowledgments

- Built with **React** and **Vite**
- Globe visualization powered by **Three.js**
- Community inspiration from open-source intelligence platforms

---

## Contact & Updates

- **Repository**: [github.com/Evank253/kcn-worldview-command-center](https://github.com/Evank253/kcn-worldview-command-center)
- **Owner**: [@Evank253](https://github.com/Evank253)
- **Last Updated**: 2026-08-05

---

**Happy coding! 🚀**
