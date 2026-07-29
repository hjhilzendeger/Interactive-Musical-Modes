# Mode Atlas

Mode Atlas is an interactive musical-modes explorer covering all 84 combinations of 12 parent major keys and seven modes.

**[Open the live app](https://mode-atlas-musical-modes.heather-hilzendeger.chatgpt.site/)**

## Features

- Explore Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian in every major key
- Play complete scales or individual scale tones
- Hear home chords, common chords, character chords, and flavor chords
- Play chord groups as modal progressions
- Adjust playback tempo and tone
- Switch between light and dark themes
- Save the selected key, mode, audio settings, and theme locally
- Responsive, keyboard-accessible controls

The musical-mode dataset was adapted from the project presentation *Musical Modes - Complete Reference*. The original presentation and assignment build-rules PDF are not included in this repository.

## Run locally

Requires Node.js 22.13 or later.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Validate

```bash
npm run lint
npm run build
```
