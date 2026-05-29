# Easykanji - Easy Japanese Lyrics by Furigara PRD

## Overview

A tiny client-side web app to help users **practice singing Japanese songs** by
displaying **furigana (振り仮名)** above kanji.

Users paste lyrics using an inline markup:

```txt
｜漢字｜かな｜
```

The app renders proper HTML using:

```html
<ruby>漢字<rt>かな</rt></ruby>
```

## Goals

- Make Spotify-style kanji-heavy lyrics readable while singing.
- Keep the implementation **minimal**: no backend, no database, no auth.
- Provide a clean preview and a print-friendly A4 layout.
- Auto-generate furigana using client-side morphological analysis.
- Make the UI minimal, modern, and asthetic

## Non-goals

- Accounts, sync, or server storage.

## Core Features

### 1. Smart Editor

- **Multiline Input**: A `<textarea>` for pasting/editing lyrics with
  placeholder examples.
- **Auto-Furigana Generator**:
  - "Generate ✨" button analyzes text using `kuromoji.js` (client-side).
  - Automatically inserts `｜漢字｜かな｜` markup.
  - Lazy-loads dictionary (~2MB) on first use.
- **Manual Override**: Users can directly edit the generated markup to correct
  readings.

### 2. Live Preview & Studio Layout

- **Real-time Rendering**: Converts markup to `<ruby><rt>` tags instantly.
- **Adaptive Layout**:
  - **Mobile**: Stacked (Editor → Preview).
  - **Desktop**: Two-column side-by-side (Editor 50% | Preview 50%).
- **Focus Mode**: Toggle to hide the editor, centering the preview for an
  optimized reading/singing experience.

### 3. Parser Engine

- **Syntax Rules**:
  - Format: `｜kanji｜kana｜` (starts with full-width pipe).
  - Supports multiple tags per line.
  - Preserves all other text and line breaks.

### 4. Import / Export

- **Export**: Downloads a JSON file containing
  `{ "title": "...", "lyrics": "..." }`.
- **Import**: Uploads a JSON file to restore editor content.

### 5. Print to PDF

- **Optimization**:
  - Hides editor and UI controls (`.no-print`).
  - Formats for A4 paper.
  - Avoids page breaks inside ruby blocks.

### 6. Copy to Clipboard

- Copies the rendered HTML (with `<ruby>` tags) to the clipboard.

## Technical Architecture

### Tech Stack

- **Framework**: Next.js (App Router), React, TypeScript.
- **Styling**: TailwindCSS.
- **Deployment**: Static export (`output: 'export'`) to GitHub Pages.
- **Fonts**: Geist (default).

### Key Dependencies

- **Analysis**: `kuromoji` (Japanese morphological analyzer).

### Component Structure

- **`LayoutShell`**: Responsive Grid/Flex container.
- **`Toolbar`**: Actions (Generate, Hide Editor, Import/Export, Print).
- **`EditorPane`**: Collapsible input area.
- **`PreviewPane`**: Real-time renderer.

### State Management

```typescript
const [lyrics, setLyrics] = useState<string>('');
const [showEditor, setShowEditor] = useState<boolean>(true);
const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
```

### CSS Strategy

- **Grid Layout**: `grid grid-cols-1 lg:grid-cols-[400px_1fr]`
- **Print Styles**:
  ```css
  @media print {
    .no-print {
      display: none !important;
    }
    .print-only {
      width: 100%;
      margin: 0;
    }
  }
  ```

## Non-Functional Requirements

- **Performance**: Lazy-load Kuromoji dictionary; cache tokenizer promise.
- **Accessibility**: Semantic `<ruby>` markup; keyboard navigable.
- **Browser Support**: Modern browsers; CSS `break-inside` support.
- **Client-Side Only**: Zero backend dependencies.
