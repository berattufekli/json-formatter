# JSON Formatter - Format, Validate & Minify

A powerful and elegant tool to format, validate, and minify JSON with syntax highlighting.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-cyan?style=flat-square&logo=tailwind-css)

![JSON Formatter Screenshot](public/screenshot.png)

## 🚀 Live Demo

**🌐 Production:** https://json-formatter-ten-blond.vercel.app

## ✨ Features

### Core Functionality
- **Format JSON** - Beautify with custom indentation (2-8 spaces)
- **Minify JSON** - Compress for production use
- **Validate JSON** - Real-time syntax validation with error messages
- **Sort Keys** - Alphabetically sort object keys

### Editor Features
- **Input/Output Tabs** - Separate input and formatted output views
- **Syntax Highlighting** - Easy-to-read formatted JSON
- **Error Display** - Clear error messages for invalid JSON
- **Line Numbers** - Optional line number display

### Import/Export
- **Import JSON** - Load .json files from your computer
- **Export JSON** - Download formatted/minified JSON
- **Copy to Clipboard** - One-click copy functionality

### Appearance
- **Theme Support** - Light, Dark, and System modes
- **Font Family** - 4 modern fonts (Inter, Plus Jakarta Sans, Fira Code, JetBrains Mono)
- **Custom Font Size** - Adjustable from 10px to 20px
- **Auto Validate** - Real-time validation as you type

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.7 | React framework with App Router |
| **React** | 19 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | v4 | Utility-first styling |
| **shadcn/ui** | v4 | UI component library (base-ui) |
| **Lucide React** | latest | Icon system |

## 📁 Project Structure

```
json-formatter/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Root layout with providers
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── editor/
│   │   │   ├── json-input.tsx     # Input textarea
│   │   │   ├── json-output.tsx    # Output display
│   │   │   ├── toolbar.tsx       # Action toolbar
│   │   │   └── settings-drawer.tsx # Settings panel
│   │   ├── providers/
│   │   │   ├── theme-provider.tsx # Theme context
│   │   │   └── font-provider.tsx  # Font context
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/
│   │   └── use-local-storage.ts  # Persistent state
│   └── types/
│       └── formatter.ts           # TypeScript types
├── public/
│   └── screenshot.png            # App screenshot
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── components.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd ~/Desktop/bbStudio/json-formatter

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start formatting.

## ⌨️ Keyboard Shortcuts

| Action | Description |
|---------|-------------|
| Format | Beautify JSON with indentation |
| Minify | Compress JSON for production |
| Validate | Check JSON syntax |
| Copy | Copy to clipboard |
| Clear | Clear all content |

## 💾 Data Storage

All settings are stored in browser's **localStorage**:
- `json-formatter-settings` - Editor preferences

## 🎨 Theme Modes

The formatter supports three theme modes:
- **Light** - Clean light interface
- **Dark** - Easy on the eyes
- **System** - Follows system preference

## 📦 Components

Built with shadcn/ui components:
- Button, Input, Textarea
- Tabs, Tooltip, TooltipProvider
- DropdownMenu, Switch, Slider
- ScrollArea, Separator, Skeleton
- Badge, Card, Label

## 📄 License

MIT License - feel free to use and modify.

---

Built with ❤️ using Next.js, shadcn/ui, and Tailwind CSS
