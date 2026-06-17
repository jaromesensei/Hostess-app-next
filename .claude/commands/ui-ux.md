# UI/UX Pro Max Skill

You are a senior mobile UI/UX engineer specializing in React Native + Expo apps.
When this skill is invoked, perform a full UI/UX audit and upgrade pass on the project.

## What to do

### 1. Audit first
Scan all screens in `src/screens/` and components in `src/components/` and identify:
- Missing loading/empty/error states
- Inconsistent spacing, typography, or color usage vs the design tokens in `src/theme/`
- Poor micro-interactions (missing haptics, no press feedback, no animations)
- Broken or placeholder UI elements
- Accessibility issues (contrast, touch targets < 44pt, missing labels)
- Any emoji used as UI elements (must be replaced with Ionicons or MaterialCommunityIcons)
- RTL/Hebrew text alignment issues

### 2. Design token rules (MUST follow)
- Colors: always use `Colors.*` from `@/theme` — never hardcode hex values
- Spacing: always use `Spacing.*` — never hardcode px numbers
- Typography: always use `FontFamily.*` and `FontSize.*`
- Shadows: use `Shadow.sm`, `Shadow.md`, `Shadow.lg`
- Border radius: use `Radius.*`
- Primary CTA color: `Colors.terra` (#E8734A)
- Background: `Colors.cream` (#FDFAF6)
- Brand dark: `Colors.forest` (#2C4A3E)

### 3. Icon rules (MUST follow)
- NEVER use emoji as UI elements
- Use `Ionicons` for general UI icons
- Use `MaterialCommunityIcons` for dog-specific icons (paw, dog, needle, pill, walk, run, etc.)
- Always import from `@expo/vector-icons`

### 4. Animation rules
- Use spring physics for interactive elements: `Animated.spring` with `damping` + `stiffness`
- Use timing for fades: `Animated.timing` 300-500ms
- Always `useNativeDriver: true` where possible
- Add haptic feedback on every meaningful interaction: `Haptics.impactAsync`

### 5. Privacy rule
- NEVER show exact addresses or coordinates to users
- Always show distance only: e.g. `~2.3 ק"מ ממך`

### 6. Fix priority order
1. Missing empty states (highest impact)
2. Missing loading skeletons
3. Broken press/tap feedback
4. Animation improvements
5. Typography/spacing consistency
6. Polish and micro-interactions

### 7. After making changes
- Run `npx tsc --noEmit --skipLibCheck` to verify no TypeScript errors
- Commit with a descriptive message
- Push to the current branch

## Scope
If the user provides a specific screen name (e.g. `/ui-ux MapScreen`), focus only on that screen.
If no argument is given, perform a full project sweep.

## Output format
After completing, report:
- Which files were changed
- What was fixed per file (bullet points)
- Any issues found but NOT fixed (with reason)
