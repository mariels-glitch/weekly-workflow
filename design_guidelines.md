# Design Guidelines: Weekly Workflow Task Management App

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern productivity tools like Linear and Notion, with Apple's design language influence (glassmorphic effects, blur, refined shadows).

## Core Design Elements

### A. Typography
- **Primary Font**: System UI stack (`system-ui, -apple-system, "SF Pro Text"`)
- **Hierarchy**:
  - Brand/Titles: 15-16px, font-weight 600
  - Body/Tasks: 13px, font-weight 500
  - Metadata/Labels: 11-12px, font-weight 400-600
  - Captions: 10px, uppercase, letter-spacing 0.08em

### B. Layout System
**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, 10, 12, 16, 18
- Component padding: p-4 to p-6 (16-24px)
- Gap between elements: gap-2 to gap-4 (8-16px)
- Section margins: mb-3 to mb-4 (12-16px)

**Grid Structure**:
- Main layout: Two-column grid (1.15fr / 0.95fr ratio)
- Week calendar: 7 equal columns
- Responsive: Single column on mobile (<960px)

### C. Visual Treatment

**Color Palette** (Dark Theme):
- Background: Deep blacks with subtle gradients (#0b0c10 to #010104)
- Cards: rgba(255, 255, 255, 0.04) with glassmorphic blur
- Accent: Vibrant blue (#0a84ff to #0071e3)
- Success: #32d74b
- Danger: #ff453a
- Text: #f5f5f7 primary, #a1a1b3 muted
- Borders: rgba(255, 255, 255, 0.08-0.18)

**Effects**:
- Border radius: 14-22px for cards, 999px for pills
- Backdrop blur: 22px on elevated elements
- Shadows: Layered (0 18px 40px rgba(0,0,0,0.6))
- Gradients: Radial and linear, subtle overlays at 4-9% opacity

### D. Component Library

**Cards/Panels**:
- Glassmorphic background with gradient overlays
- 18px padding, 22px border-radius
- Subtle border (1px, 8% white opacity)
- Radial gradient accent overlay (top-left, 9% opacity)

**Buttons**:
- Primary (Icon): Circular, gradient background, strong shadow with accent color glow
- Pills: Rounded (999px), minimal background, 1px border
- States: Subtle transform (-1px Y), brightness filter, scale on hover

**Task Items**:
- Grid layout: checkbox | content | actions
- 14px border-radius, 7-9px padding
- Hover: Lift effect (-1px Y), stronger shadow
- Completed: 60% opacity, strikethrough, green tint

**Calendar Days**:
- Pill-shaped (14px radius), centered text
- Today: Stronger border (26% white)
- Selected: Radial gradient (blue), strong glow shadow
- Hover: Lift with shadow enhancement

**Input Fields**:
- Dark background (rgba(3,3,6,0.9))
- 16px border-radius, 8-9px padding
- Transparent input with subtle border

### E. Interactions

**Transitions**: 160ms ease-out for all state changes
**Hover States**: 
- Transform: translateY(-1px)
- Enhanced shadows
- Brightness/scale adjustments (1.03-1.05)

**Active States**:
- Reset Y transform
- Reduced shadow intensity
- Pill toggles: Add background color, slight lift

**Scrollbars**: 
- 6px width, transparent track
- 8% white opacity thumb, rounded

## Layout Specifications

**Header**:
- Pill-shaped (999px radius), glassmorphic
- Split layout: Brand left, metadata/avatar right
- Gradient background (135deg, 8% to 2% white)
- 14px vertical padding, 18px horizontal

**Main Content**:
- Two-panel grid with 18px gap
- Left panel: Task input + list (max-height 360px, scrollable)
- Right panel: Supporting features (insights/analytics)
- Panels use same glassmorphic treatment

**Task Input**:
- Dark inset container
- Row layout: input field + tag selector + add button
- Metadata row below (pills for priority, time, etc.)

**Week Calendar Strip**:
- 7-column grid, 6px gaps
- Each day: Label (uppercase, 10px) + Number (12px)
- Current selection uses radial gradient with strong glow

## Images
No hero images required. This is a focused productivity application with pure UI components and glassmorphic design.