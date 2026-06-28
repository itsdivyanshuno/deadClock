# deadClock — Interaction Hierarchy

## Principles

1. **No two components share the same hover signature.** Each interaction type has a distinct feel.
2. **Motion is information.** Lifts tell you "this navigates." Glows tell you "this reveals data." Tints tell you "this acts."
3. **Linear > Vercel pattern.** Restrained, purposeful motion. Nothing floats without a reason.

---

## Tier 1 — Hero / Primary Actions

**Elements:** Send button, "New task" button, primary CTA in empty states, Focus Today card

**Responds to hover with:**
- `translateY(-2px)` lift
- `scale(1.02)` subtle breathe
- Stronger shadow (`shadow-lg` + accent-colored shadow)
- Border brightens to accent color
- All via `transition-all duration-200`

**Framer Motion:** `whileHover={{ y: -2, scale: 1.02 }}` + stronger box-shadow via className

**Why:** These are the actions that drive the app. They deserve physical weight.

---

## Tier 2 — Destination Cards

**Elements:** Goal cards, Insight cards, Dashboard Focus Today card

**Responds to hover with:**
- `translateY(-1px)` — barely perceptible lift
- Shadow grows `shadow-sm` → `shadow-md`
- Border goes `border-border` → `border-border-strong`
- Insights: border tint shifts toward variant color (danger → brighter red, etc.)
- No scale change — cards should feel anchored

**Framer Motion:** `whileHover={{ y: -1 }}` — max displacement 1px, no scale

**Why:** Cards contain information. They invite reading, not clicking through force.

---

## Tier 3 — Navigation & Selection

**Elements:** Sidebar nav items, Tab triggers, Command palette items, Settings nav items

**Responds to hover with:**
- Background: `bg-border-light` → `bg-border` (subtle shade shift, no border change)
- Text: muted → full contrast
- Active indicator: `layoutId` spring animation (existing)
- NO shadow. NO lift. NO scale.

**Framer Motion:** `whileTap={{ scale: 0.97 }}` on press only

**Why:** Navigation is structural. It should feel like switching channels, not lifting a card.

---

## Tier 4 — Contextual Reveal

**Elements:** Task row actions (delete, checkbox), Copy message button, Dark mode toggle

**Responds to hover with:**
- `group-hover:opacity-100` reveal (currently present)
- Hover target (icon button): background tint only, no lift
- Danger actions: `hover:bg-danger-soft` red-tinted background
- No scale, no shadow on the parent — these are ephemeral

**Framer Motion:** none — pure CSS `group-hover`

**Why:** Contextual actions are hidden for a reason. When they appear, they should be visible but not demanding.

---

## Tier 5 — Stat / Data Display

**Elements:** Dashboard stat cards, Progress bars, Priority badges

**Responds to hover with:**
- Background: slight warm glow (accent-soft or success-soft tint on the icon container)
- Icon container: `bg-accent-soft` → `bg-accent/10` (10% accent fill)
- Numbers: `tabular-nums` already; optional `group-hover:brightness-110`
- No lift, no shadow increase

**Framer Motion:** none for stat cards; keep existing `motion.div` stagger on mount only

**Why:** Stats are read-only displays. They glow softly to acknowledge attention, not to invite interaction.

---

## Tier 6 — Subtle Embellishment

**Elements:** Sidebar collapsible section headers, Task mini items in sidebar, Badge elements

**Responds to hover with:**
- Single `hover:text-text-secondary` text brighten
- Or `hover:bg-border-light/80` (two-stop opacity change)
- No border, no shadow, no lift, no scale

**Why:** These are supporting UI. They respond to prove they're alive, then get out of the way.

---

## Anti-Patterns to Eliminate

| Don't | Do Instead |
|-------|-----------|
| `hover:bg-border-light` on every element | Tier-specific tints |
| `whileHover={{ y: -1 }}` on every motion.div | Only on destination cards |
| `hover:shadow-sm` everywhere | Shadow only on Tiers 1+2 |
| `hover:scale` on cards | Only primary actions scale |
| Uniform `transition-all` | `transition-colors` / `transition-transform` per tier |

---

## Implementation Priority

1. **Primary actions** — Send, New Task, Focus Today card (highest visibility)
2. **Cards** — Goal and Insight cards diverge from each other
3. **Navigation** — Sidebar, tabs, palette items stop using `hover:bg-border-light`
4. **Contextual** — Task delete, copy button get tier-4 treatment
5. **Stats** — Dashboard stat cards get subtle glow instead of shadow
