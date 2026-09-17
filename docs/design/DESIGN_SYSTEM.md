# Fridge Magnets Design System

## Overview

The Fridge Magnets app uses a unified design system with two primary design languages:

1. **Material 3 (M3)** — General-purpose components for modals, dialogs, and CTAs
2. **Glass Components** — Frosted glass design for the main app chrome (navigation, add-magnet button, header actions)

All button components are centralized in `src/app/components/design-system.tsx` and re-exported from `chrome.tsx` and `glass-nav.tsx` for backwards compatibility.

---

## Button Components

### 1. M3Button (Material 3)

General-purpose button for dialogs, forms, and secondary CTAs. Supports 4 variants with consistent styling.

**Import:**
```tsx
import { M3Button } from '@/components/chrome'
// or
import { M3Button } from '@/components/design-system'
```

**Props:**
- `variant?: "filled" | "tonal" | "outline" | "text"` — defaults to `"filled"`
- `icon?: ReactNode` — optional leading icon (lucide-react)
- `full?: boolean` — span full width
- `className?: string` — additional CSS classes
- All standard `<button>` attributes

**Variants:**

| Variant | Use Case | Example |
|---------|----------|---------|
| `filled` | Primary CTAs | "Save", "Add", "Confirm" |
| `tonal` | Secondary actions | "Cancel", "Skip", "Learn more" |
| `outline` | Tertiary actions | Alternative to tonal |
| `text` | Low-emphasis actions | Inline links, lightweight actions |

**Examples:**

```tsx
// Primary CTA
<M3Button variant="filled" onClick={handleSave}>
  Save changes
</M3Button>

// With icon
<M3Button variant="filled" icon={<Plus />}>
  Add magnet
</M3Button>

// Secondary action
<M3Button variant="tonal" onClick={handleCancel}>
  Cancel
</M3Button>

// Full-width (forms)
<M3Button variant="filled" full>
  Continue
</M3Button>

// Text-only (low-emphasis)
<M3Button variant="text">
  Learn more
</M3Button>
```

---

### 2. GlassTabToggle (Tab Navigation)

Animated toggle for switching between Fridge and Map views. Uses spring animation for the active pill underlay.

**Import:**
```tsx
import { GlassTabToggle, GlassTabNav } from '@/components/glass-nav'
// or
import { GlassTabToggle } from '@/components/design-system'
```

**Props:**
- `value: "fridge" | "map"` — currently active tab
- `onChange: (v: "fridge" | "map") => void` — callback when tab changes

**Example:**

```tsx
const [activeTab, setActiveTab] = useState<"fridge" | "map">("fridge");

return (
  <GlassTabToggle 
    value={activeTab} 
    onChange={setActiveTab} 
  />
);
```

**Note:** `GlassTabNav` is a deprecated alias for `GlassTabToggle`. Both work identically.

---

### 3. GlassIconButton (Add Magnet)

Large rounded icon button for primary actions in the bottom nav. Typically used for the "add magnet" action.

**Import:**
```tsx
import { GlassIconButton } from '@/components/glass-nav'
// or
import { GlassIconButton } from '@/components/design-system'
```

**Props:**
- `icon?: ReactNode` — icon to display (defaults to Plus)
- `onClick?: () => void` — click handler
- `label?: string` — aria-label for accessibility

**Example:**

```tsx
import { Plus } from 'lucide-react';

<GlassIconButton 
  label="Add magnet"
  icon={<Plus size={22} />}
  onClick={handleAddMagnet}
/>
```

---

### 4. GlassSquareIconButton (Header Actions)

Smaller square icon button for header actions (notifications, profile/settings, etc.). Uses frosted glass treatment (semi-transparent white + backdrop blur).

**Import:**
```tsx
import { GlassSquareIconButton } from '@/components/glass-nav'
// or
import { GlassSquareIconButton } from '@/components/design-system'
```

**Props:**
- `icon?: ReactNode` — icon to display (defaults to CircleUserRound)
- `onClick?: () => void` — click handler
- `label: string` — aria-label for accessibility (required)

**Example:**

```tsx
import { Bell, Settings } from 'lucide-react';

// Notifications
<GlassSquareIconButton
  icon={<Bell size={22} />}
  label="Notifications"
  onClick={handleNotifications}
/>

// Settings
<GlassSquareIconButton
  icon={<Settings size={22} />}
  label="Settings"
  onClick={handleSettings}
/>
```

---

### 5. BottomNavBar (Composed)

Full bottom navigation bar combining the tab toggle and add-magnet button. Manages the dark scrim, spacing, and z-index automatically.

**Import:**
```tsx
import { BottomNavBar } from '@/components/glass-nav'
// or
import { BottomNavBar } from '@/components/design-system'
```

**Props:**
- `value: "fridge" | "map"` — currently active tab
- `onTabChange: (v: "fridge" | "map") => void` — fired when user switches tabs
- `onAdd: () => void` — fired when user clicks the add-magnet button

**Example:**

```tsx
const [tab, setTab] = useState<"fridge" | "map">("fridge");

return (
  <BottomNavBar
    value={tab}
    onTabChange={setTab}
    onAdd={handleAddMagnet}
  />
);
```

---

## Supporting Components

### TextField

Material 3 text input with optional label, hint, and trailing icon.

**Example:**
```tsx
<TextField
  label="Magnet title"
  hint="50 characters max"
  placeholder="Enter title"
  trailing={<Check size={16} />}
/>
```

### SearchBar

Circular search input with leading search icon. Preset styling for search-specific use.

**Example:**
```tsx
<SearchBar placeholder="Search magnets..." />
```

### VerifiedBadge

Small inline badge for verified status. Shows a checkmark and label.

**Example:**
```tsx
<VerifiedBadge label="Verified" />
```

---

## Design Tokens

All components use CSS classes and Tailwind tokens defined in your project's theme:

### Colors
- `primary` / `primary-foreground` — Main brand color (orange)
- `primary-container` — Light primary tint (for text-variant hover)
- `secondary`, `secondary-foreground` — Accent color
- `destructive` — Error/warning red
- `foreground`, `background` — Text/surface defaults
- `muted-foreground` — Disabled/hint text color

### Spacing
- Buttons: 6rem horizontal padding (`px-6`), 3rem height (`h-12`)
- Icon buttons: 68px square or 40px square
- Gap between components: `gap-3`

### Borders & Effects
- All components use `border-white/30` (frosted glass aesthetic)
- Backdrop blur: `backdrop-blur-[7px]` (glass components)
- Border radius: `rounded-2xl` (buttons), `rounded-[21px]` (glass buttons)

---

## Migration Guide

If you're using old imports:

### Before (Old)
```tsx
import { M3Button } from '@/components/chrome';
import { GlassTabNav, GlassIconButton } from '@/components/glass-nav';
```

### After (New)
```tsx
// Same imports still work! (backwards compatible)
import { M3Button } from '@/components/chrome';
import { GlassTabNav, GlassIconButton } from '@/components/glass-nav';

// Or use the centralized design system:
import { M3Button, GlassTabNav, GlassIconButton } from '@/components/design-system';
```

---

## Best Practices

1. **Use M3Button for modals/dialogs** — Not for main navigation
2. **Use GlassIconButton only for primary actions** — Icon buttons in bottom nav should be prominent
3. **Always provide `label` prop** — Accessibility (screen readers)
4. **Icons from lucide-react** — Use consistent icon library
5. **No custom styling on buttons** — Extend through variants if needed
6. **Test in light & dark** — All components support dark mode

---

## Files

- **Source:** `src/app/components/design-system.tsx`
- **Re-exports:** `src/app/components/chrome.tsx`, `src/app/components/glass-nav.tsx`
- **Documentation:** This file (`DESIGN_SYSTEM.md`)

---

## Future Enhancements

- [ ] Add loading states to all buttons
- [ ] Add focus indicators for keyboard navigation
- [ ] Storybook integration for component preview
- [ ] Add more M3Button variants (e.g., `danger`, `success`)
- [ ] Create GlassButton variant for secondary glass CTAs
