---
name: Editorial Focus
colors:
  surface: '#121314'
  surface-dim: '#121314'
  surface-bright: '#39393a'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1b1c1d'
  surface-container: '#1f2021'
  surface-container-high: '#292a2b'
  surface-container-highest: '#343536'
  on-surface: '#e3e2e3'
  on-surface-variant: '#c4c9b4'
  inverse-surface: '#e3e2e3'
  inverse-on-surface: '#303031'
  outline: '#8e9380'
  outline-variant: '#444939'
  surface-tint: '#aad45e'
  primary: '#d6ff8e'
  on-primary: '#243600'
  primary-container: '#b8e36b'
  on-primary-container: '#466500'
  inverse-primary: '#486800'
  secondary: '#c6c7c5'
  on-secondary: '#2f3130'
  secondary-container: '#454746'
  on-secondary-container: '#b5b5b4'
  tertiary: '#f1f1ed'
  on-tertiary: '#2f312e'
  tertiary-container: '#d4d5d1'
  on-tertiary-container: '#5a5c59'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c5f177'
  primary-fixed-dim: '#aad45e'
  on-primary-fixed: '#131f00'
  on-primary-fixed-variant: '#354e00'
  secondary-fixed: '#e2e3e1'
  secondary-fixed-dim: '#c6c7c5'
  on-secondary-fixed: '#1a1c1b'
  on-secondary-fixed-variant: '#454746'
  tertiary-fixed: '#e2e3de'
  tertiary-fixed-dim: '#c6c7c3'
  on-tertiary-fixed: '#1a1c1a'
  on-tertiary-fixed-variant: '#454744'
  background: '#121314'
  on-background: '#e3e2e3'
  surface-variant: '#343536'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system embodies a calm, focused, and distinctly editorial approach to daily language acquisition. Rejecting the manic energy, aggressive gamification, streaks, and dopamine loops of typical language and short-form video products, this design system establishes an environment of quiet concentration and deliberate pacing.

The aesthetic blends warm minimalism with refined, publication-grade typography and structured spatial clarity. Visual interactions emulate the tactile grace of an archival reader or high-end cultural journal rather than a social feed:
- **Atmosphere:** Deep, matte, low-stimulation dark environments that respect cognitive bandwidth.
- **Rhythm:** Deliberate constraint (a finite 10-clip daily regimen) paired with unhurried transitions.
- **Demeanor:** Quietly sophisticated, intellectual, serene, and devoid of celebratory noise, confetti, flashing badges, or extrinsic pressure.

## Colors
The color architecture relies heavily on tonal discipline. Saturated colors are excluded to maintain a serene, distraction-free environment.

### Core Palette
- **Deep Matte Canvas (`#0F1011`):** The non-reflective ground across all viewports.
- **Base Surface (`#171819`):** Primary card bodies, inactive video viewport boundaries, and bottom bars.
- **Elevated Surface (`#202223`):** Modals, playback control pills, transcripts, and layered sheets.
- **Subtle Border (`#2E3032`):** Structural perimeter lines separating navigational zones.
- **Muted Border (`#6F716E`):** Low-contrast active borders and focused states.
- **Primary Text (`#F4F4F2`):** Warm off-white delivering high legibility without retinal strain.
- **Secondary Text (`#A7A8A4`):** Muted stone neutral for supporting context, phonetic transcriptions, and metadata.

### Accent Application
The single accent—**Soft Lime (`#B8E36B`)**—is strictly metered. It functions solely as a structural marker:
1. The 10-clip thin linear progress line.
2. The active bottom navigation item indicator.
3. The filled state of the saved vocabulary bookmark.
4. Key interaction CTA surfaces requiring unambiguous visual resolution. It must never appear as decorative backdrops or text fills.

## Typography
Typography is set in **Geist** (with system fallback to SF Pro and Pretendard). The hierarchy treats English dialogues with literary respect rather than gamified urgency.

### Typographic Directives
- **Subtitles & Transcripts:** Rendered in `body-lg` (`17px/26px`) with high contrast (`#F4F4F2`). Key vocabulary within sentences utilizes a medium weight (`500`) with a subtle underline in `#6F716E`.
- **Category Labels:** Tracked micro-labels (`label-caps`) use strictly capitalized characters with positive letter spacing (`0.08em`) to designate module genres (`PRONUNCIATION`, `SCENE`, `LISTENING`, `LESSON`).
- **Phonetics & Notes:** Rendered in `body-sm` using secondary neutral (`#A7A8A4`) to clearly distinguish supporting annotations from core dialogue.

## Layout & Spacing
The layout uses a mobile-first column model constrained to a maximum width of `480px` and centered on larger viewports. The vertical cadence follows an explicit 4px baseline.

### Structural Parameters
- **Viewport Constraints:** Fixed mobile canvas at `390px` width; fluid scaling between `320px` and `480px`. Above `480px`, the canvas remains fixed at `480px` centered against a `#0F1011` background.
- **Margin & Padding:** Side margins are locked to `16px` (`margin`). Internal component padding uses strictly `space-sm` (8px), `12px`, `space-md` (16px), `space-lg` (20px), or `space-xl` (32px).
- **Player Geometry:** The vertical video adheres strictly to a clean `9:16` aspect ratio, surrounded by a `16px` or `20px` perimeter radius.
- **Non-Interfering Player Rule:** No interface metadata, subtitles, or controls may float on top of the active video frame. The video container remains pristine. Subtitles, category indicators, definitions, and actions are placed directly below the player frame within standard document flow.

## Elevation & Depth
Elevation is achieved purely through layered, tonal surface tiers and delicate outlines. Traditional drop shadows and glossy skeuomorphic cues are avoided.

### Surface Hierarchy
1. **Tier 0 (Base Canvas - `#0F1011`):** The non-illuminated viewport container.
2. **Tier 1 (Resting Module - `#171819`):** Housing the video frame, transcript sections, and bottom navigation bar.
3. **Tier 2 (Elevated Control - `#202223`):** Floating tooltips, contextual sheet flyouts, and pill buttons.

### Separation & Hairlines
Depth boundaries are delineated using 1px interior borders (`#2E3032`). When an active element demands focus, its border shifts to `#6F716E`. This creates a tactile, architectural structure without visual weight.

## Shapes
Geometry is disciplined and rounded without tipping into bubbly forms.

- **Video Container:** Corner radius is set to `16px` (`rounded-lg`) to balance the vertical format against screen edges.
- **Action Pills & Badges:** Use complete capsule shapes (`rounded-full`, 9999px) for category tags, audio playback toggles, and step trackers.
- **Interactive Sheets & Cards:** Standard cards utilize `12px` to `16px` corners. Inner nested elements use `8px` (`rounded`) to preserve nested concentricity.

## Components

### Video Player & Stage
- **Container:** Pure 9:16 aspect ratio box, `#171819` background fallback during load, framed with a 1px border (`#2E3032`) and a `16px` corner radius.
- **Viewport Integrity:** No subtitles, buttons, icons, or gradients overlap the video content. 
- **Playback Indicator:** A delicate 2px track located beneath the card with `#2E3032` for the groove and `#F4F4F2` for the playhead.

### Segmented Progress Bar (Daily 10)
- **Structure:** Positioned at the very top of the daily view. 10 equal horizontal bars separated by `4px` gaps.
- **States:**
  - *Completed:* `#B8E36B` solid fill.
  - *Current Active:* `#F4F4F2` with subtle pulse animation.
  - *Remaining:* `#202223` track.

### Category Badges
- **Display:** Pill shape (`9999px`), `4px 10px` internal padding.
- **Style:** Background `#202223`, border 1px `#2E3032`, text `#A7A8A4` set in `label-caps` (`PRONUNCIATION`, `SCENE`, `LISTENING`, `LESSON`).

### Subtitle & Vocabulary Display
- **Container:** Located immediately beneath the player.
- **Text:** `17px` Geist, `#F4F4F2`, with high line-height (`26px`) for reading comfort.
- **Target Terms:** Key vocabulary terms are styled with `#F4F4F2`, `font-weight: 500`, and a subtle `1px` underline in `#6F716E`. Tapping a term triggers an inline elevated tooltip (`#202223`) revealing definition, phonetic spelling, and audio cue without leaving the screen.

### Buttons & Interactive Controls
- **Primary Action (Continue / Next):** Pill container (`rounded-full`), `#B8E36B` background, `#0F1011` text, `font-weight: 500`, height `48px`.
- **Secondary / Action Icons (Replay, 0.8x Slow):** Pill container, `#171819` surface, 1px `#2E3032` border, `#F4F4F2` icon/label.
- **Save / Bookmark:** Minimal icon button. Resting state: `#A7A8A4` stroke outline. Saved state: `#B8E36B` solid fill.

### Navigation Bar
- **Position:** Fixed at the bottom of the viewport with a blur backdrop (`#0F1011` at 92% opacity, 12px blur) and a 1px `#2E3032` top border.
- **Structure:** Two primary destinations: **Today** and **Saved**.
- **Active State:** `#B8E36B` icon and label with an unobtrusive `3px` dot below the label. Inactive state: `#A7A8A4`.

### Completion State
- **Presentation:** Minimal, tranquil editorial conclusion screen replacing game celebrations.
- **Content:** Headline in `headline-md` ("Today's 10 clips complete."), followed by a clean list of the 10 captured expressions with their definitions. No stars, no XP tallies, no sound effects.