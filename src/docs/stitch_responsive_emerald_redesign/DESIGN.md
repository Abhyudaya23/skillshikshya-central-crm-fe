---
name: Lumina CRM Systems
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4a43'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a73'
  outline-variant: '#bccac1'
  surface-tint: '#006c4e'
  primary: '#00694c'
  on-primary: '#ffffff'
  primary-container: '#008561'
  on-primary-container: '#f5fff7'
  inverse-primary: '#67dbae'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#4d5d73'
  on-tertiary: '#ffffff'
  tertiary-container: '#66768d'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#84f8c9'
  primary-fixed-dim: '#67dbae'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter-desktop: 24px
  margin-desktop: 32px
  gutter-mobile: 16px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

The design system is anchored in a **Corporate / Modern** aesthetic, engineered to convey precision, efficiency, and reliability. It targets professional teams who require high information density without sacrificing clarity or visual comfort. 

The brand personality is "The Quiet Expert"—sophisticated, understated, yet technically superior. By utilizing a "cool" color temperature and generous whitespace, the UI evokes a sense of calm under pressure. Visual interest is achieved through high-quality typography and subtle depth rather than decorative elements, ensuring that the user's focus remains entirely on data-driven decision-making.

## Colors

This design system follows a strict **60-30-10 color rule** to maintain professional balance:

*   **60% Neutrals (Foundation):** A base of `#F8FAFC` (Slate-50) for backgrounds and `#FFFFFF` for containers. This creates a clean, airy workspace that reduces cognitive load.
*   **30% Secondary (Structure & Contrast):** Deep Slate (`#1E293B`) is used for sidebars, primary headings, and navigation elements to provide a "grounded" architectural feel. Mid-tone grays (`#64748B`) are used for secondary text and borders.
*   **10% Primary (Impact):** The brand green (`#1DA077`) is reserved exclusively for high-priority actions, success states, and key data indicators. This ensures that interactive elements are immediately recognizable.

System states use standard semantic mapping: Blue for info, Amber for warnings, and Red for errors, all calibrated to match the cool saturation levels of the primary green.

## Typography

The typography strategy pairs **Hanken Grotesk** for headings and **Inter** for UI components. Hanken Grotesk provides a sharp, contemporary "tech" feel that distinguishes the brand, while Inter ensures maximum legibility for complex data tables and long-form CRM entries.

**JetBrains Mono** is introduced sparingly as a label font for metadata, IDs, and technical values to lean into the "cool," precise aesthetic.

*   **Hierarchy:** Use tight letter spacing on larger headings to maintain a modern, "compact" look.
*   **Contrast:** Primary headings should always use the Secondary Slate color (`#1E293B`), while body text should utilize the Tertiary Slate (`#64748B`) to create clear visual tiers.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for the main content area, anchored by a fixed left-hand navigation sidebar (280px). 

*   **Rhythm:** An 8px/4px base unit drives all spacing decisions. Large sections are separated by 32px or 48px to maintain the requested "spacious" feel.
*   **Responsibility:** On tablet, the sidebar collapses into an icon-only rail (80px). On mobile, the layout shifts to a single-column stack with a bottom navigation bar or hamburger menu, and margins reduce to 16px to maximize screen real estate.
*   **Data Density:** While the overall layout is spacious, internal component spacing (like table rows) can be toggled between "Comfortable" (16px padding) and "Compact" (8px padding) to suit different user needs.

## Elevation & Depth

To maintain a clean, professional aesthetic, this design system avoids heavy drop shadows in favor of **Tonal Layers** and **Ambient Shadows**.

*   **The Base:** The page background is Slate-50.
*   **Level 1 (Cards/Content):** White surfaces with a 1px border (`#E2E8F0`) and an extremely subtle, diffused shadow: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`.
*   **Level 2 (Dropdowns/Modals):** Elevated surfaces use a more pronounced ambient shadow to indicate interactivity and focus: `0 10px 15px -3px rgba(0, 0, 0, 0.08)`.

Transitions between layers should be crisp, avoiding gradients to maintain the "cool" and modern feel.

## Shapes

The shape language is **Refined and Consistent**. A standard 8px (0.5rem) radius is applied to most UI components to strike a balance between friendly modernism and professional structure.

*   **Standard (0.5rem):** Used for cards, input fields, and buttons.
*   **Large (1rem):** Reserved for large modal containers or featured dashboard widgets.
*   **Pill:** Used exclusively for "Status Badges" (e.g., "Active", "Pending") and Tags to differentiate them from actionable buttons.

## Components

*   **Buttons:** Primary buttons use the Primary Green (`#1DA077`) with white text. Secondary buttons use a Slate-50 background with Slate-900 text and a subtle border. Ghost buttons are reserved for utility actions in headers.
*   **Input Fields:** High-contrast borders in Slate-200 that darken to Primary Green on focus. Use Inter 14px for input text and JetBrains Mono 12px for field labels.
*   **Cards:** Pure white background, 8px corner radius, and a 1px border in Slate-100. Header sections within cards should have a subtle Slate-50 bottom border.
*   **Data Tables:** Header cells use Slate-50 background with JetBrains Mono labels in uppercase. Rows use alternating subtle tints or simple 1px dividers to maintain horizontal flow.
*   **Chips/Status:** Use the Pill shape with low-opacity background tints of the semantic color (e.g., Success Green at 10% opacity) and full-strength text color for high legibility.
*   **Side Navigation:** Uses the deep Secondary Slate background. Active states are indicated by a high-impact Primary Green vertical bar on the left edge and a subtle highlight on the menu item itself.