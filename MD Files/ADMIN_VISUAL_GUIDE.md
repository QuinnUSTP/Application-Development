# Admin Panel Visual Guide

## Admin Panel Interface

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  🔐 Admin Dashboard                                          [Logout 🚪]  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌─ NAVIGATION TABS ─────────────────────────────────────────────────────────┐
│                                                                            │
│  [📦 Products] [👥 Users] [📋 Orders] [⚙️ Settings]                      │
│   (Active)                                                                 │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌─ PRODUCTS TAB ────────────────────────────────────────────────────────────┐
│                                                                            │
│ Products Management                                                        │
│                                                                            │
│ [➕ Add New Product]                                                       │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ID │ Name │ Price │ Stock │ Category │ Actions                      │  │
│ ├──────────────────────────────────────────────────────────────────────┤  │
│ │ 1  │ T-Shirt │ $50 │ [15] │ Clothing │ [Edit] [Delete]            │  │
│ │ 2  │ Jeans  │ $60 │ [20] │ Clothing │ [Edit] [Delete]            │  │
│ │ 3  │ Shoes  │ $80 │ [10] │ Footwear │ [Edit] [Delete]            │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌─ Add New Product (Hidden) ────────────────────────────────────────────┐  │
│ │ Product Name:   [___________________________]                        │  │
│ │ Price:          [______]                                            │  │
│ │ Category:       [___________________________]                        │  │
│ │ Description:    [___________________________|                        │  │
│ │                 |___________________________|                        │  │
│ │ Image URL:      [___________________________]                        │  │
│ │ Stock:          [______]                                            │  │
│ │ Rating:         [______]                                            │  │
│ │                                                                      │  │
│ │ [Save Product] [Cancel]                                            │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Users Tab View

```
┌─ USERS TAB ───────────────────────────────────────────────────────────────┐
│                                                                            │
│ Users Management                                                           │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ID │ Username │ Email │ Role │ Created │ Actions               │  │
│ ├──────────────────────────────────────────────────────────────────────┤  │
│ │ 1  │ admin    │ a@r.c │ ADMIN│ 1/15   │ (Admin)               │  │
│ │ 2  │ testuser │ t@r.c │ USER │ 1/16   │ [Promote] [Delete]   │  │
│ │ 3  │ john     │ j@r.c │ USER │ 1/17   │ [Promote] [Delete]   │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ Legend: ⬜ Admin Badge   ⬜ User Badge                                     │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Orders Tab View

```
┌─ ORDERS TAB ──────────────────────────────────────────────────────────────┐
│                                                                            │
│ Orders Management                                                          │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ Order ID │ Customer │ Total │ Items │ Status │ Date │ Action │  │
│ ├──────────────────────────────────────────────────────────────────────┤  │
│ │ ORD001   │ John D.  │ $150 │ 3    │ 🟨 PND │ 1/17 │ [Pending ▼]   │  │
│ │ ORD002   │ Jane S.  │ $200 │ 4    │ 🟦 PRO │ 1/18 │ [Processing▼] │  │
│ │ ORD003   │ Bob M.   │ $120 │ 2    │ 🟩 SHP │ 1/19 │ [Shipped  ▼]  │  │
│ │ ORD004   │ Alice L. │ $180 │ 5    │ 🟢 DEL │ 1/20 │ [Delivered▼]  │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ Status Legend:                                                             │
│  🟨 Pending    🟦 Processing    🟩 Shipped    🟢 Delivered    🔴 Cancelled │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Settings Tab View

```
┌─ SETTINGS TAB ────────────────────────────────────────────────────────────┐
│                                                                            │
│ Admin Settings                                                             │
│                                                                            │
│ Admin Username: admin                                                      │
│ Admin Email:    admin@redstore.com                                        │
│                                                                            │
│ [🔐 Change Password]                                                       │
│                                                                            │
│ ┌─ Change Password (Hidden) ────────────────────────────────────────────┐  │
│ │ Current Password: [___________________________]                     │  │
│ │ New Password:     [___________________________]                     │  │
│ │ Confirm Password: [___________________________]                     │  │
│ │                                                                      │  │
│ │ [Update Password] [Cancel]                                         │  │
│ └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Highlight Red**: #ff523b (buttons, active states)
- **Dark Red**: #563434 (hover states)
- **Light Gray**: #f9f9f9 (backgrounds)
- **Dark Text**: #555 (main text)
- **Medium Gray**: #8a8a8a (secondary text)

### Status Colors
| Status | Color | Hex |
|--------|-------|-----|
| Pending | Yellow | #FFF3CD |
| Processing | Blue | #D1ECF1 |
| Shipped | Light Green | #D4EDDA |
| Delivered | Dark Green | #C3E6CB |
| Cancelled | Red | #F8D7DA |

### Badge Colors
| Type | Color | Hex |
|------|-------|-----|
| Admin | Orange | #ff9800 |
| User | Blue | #2196F3 |

## Button Styles

### Primary Buttons
```
[Save Product]  - Green (#4CAF50)
[Update Status] - Green (#4CAF50)
[Logout]        - Red (#ff523b)
```

### Secondary Buttons
```
[Edit]          - Green (#4CAF50)
[Delete]        - Red (#f44336)
[Promote]       - Blue (#2196F3)
[Cancel]        - Gray (#757575)
```

## Form Layout

### Product Form
```
┌─────────────────────────────────────┐
│ Product Name: [_________________] │
├─────────────────────────────────────┤
│ Price:        [_______] │ Stock: [____] │
├─────────────────────────────────────┤
│ Category:     [_________________] │
├─────────────────────────────────────┤
│ Description:  [_________________] │
│               [_________________] │
├─────────────────────────────────────┤
│ Image URL:    [_________________] │
├─────────────────────────────────────┤
│ Rating:       [_______]           │
├─────────────────────────────────────┤
│ [Save] [Cancel]                   │
└─────────────────────────────────────┘
```

## Table Column Widths

### Products Table
- ID: 10%
- Name: 25%
- Price: 12%
- Stock: 12%
- Category: 20%
- Actions: 21%

### Users Table
- ID: 8%
- Username: 20%
- Email: 28%
- Role: 15%
- Created: 13%
- Actions: 16%

### Orders Table
- Order ID: 15%
- Customer: 20%
- Total: 12%
- Items: 8%
- Status: 15%
- Date: 12%
- Actions: 18%

## Responsive Design Breakpoints

### Desktop (≥1200px)
- All tabs visible
- All columns visible
- Forms side-by-side
- Full table width

### Tablet (768px - 1199px)
- Tabs stack horizontally
- Table columns reduce
- Forms stack vertically
- Reduced padding

### Mobile (<768px)
- Tabs stack vertically
- Single column layout
- Minimal padding
- Touch-optimized buttons
- Horizontal scroll for tables

## Interactions & Animations

### Tab Switching
```
Click Tab Button
    ↓
Tab button gets .active class
    ↓
Old tab content fades out (0.3s)
    ↓
New tab content fades in (0.3s)
    ↓
New tab visible
```

### Form Submission
```
User fills form
    ↓
Clicks submit button
    ↓
Form validates
    ↓
Button shows loading state
    ↓
API call made
    ↓
Success/error notification appears
    ↓
Form clears or closes
    ↓
Table updates
```

### Stock Inline Editing
```
User clicks stock input
    ↓
Input becomes editable
    ↓
User changes value
    ↓
User presses Enter/Tab
    ↓
API call made immediately
    ↓
Success notification appears
    ↓
Table updates
```

## Notification Styles

### Success Notification
```
┌──────────────────────────────────────┐
│ ✅ Product added successfully!       │
└──────────────────────────────────────┘
Background: Light Green
Color: Dark Green
Duration: 3 seconds
```

### Error Notification
```
┌──────────────────────────────────────┐
│ ❌ Error: Failed to save product     │
└──────────────────────────────────────┘
Background: Light Red
Color: Dark Red
Duration: 4 seconds
```

### Info Notification
```
┌──────────────────────────────────────┐
│ ℹ️ Feature coming soon!              │
└──────────────────────────────────────┘
Background: Light Blue
Color: Dark Blue
Duration: 3 seconds
```

## Dialog/Modal Styles

### Confirmation Dialog
```
┌─────────────────────────────────────────┐
│ ⚠️  Warning                             │
├─────────────────────────────────────────┤
│ Are you sure you want to delete         │
│ "Red T-Shirt"?                          │
│                                         │
│ This action cannot be undone.           │
├─────────────────────────────────────────┤
│ [Cancel]  [Delete]                      │
└─────────────────────────────────────────┘
```

## Mobile Layout Example

### Portrait View (480px)
```
┌───────────────────────────────┐
│ 🔐 Admin Dashboard   [Logout] │
├───────────────────────────────┤
│ [Products]                    │
│ [Users]                       │
│ [Orders]                      │
│ [Settings]                    │
├───────────────────────────────┤
│                               │
│ Products Management           │
│                               │
│ [➕ Add New Product]         │
│                               │
│ Product 1                     │
│ Price: $50                    │
│ Stock: [15]                   │
│ [Edit] [Delete]               │
│                               │
│ Product 2                     │
│ Price: $60                    │
│ Stock: [20]                   │
│ [Edit] [Delete]               │
│                               │
└───────────────────────────────┘
```

### Landscape View (800px)
```
┌─────────────────────────────────────────┐
│ 🔐 Admin Dashboard       [Logout]      │
├─────────────────────────────────────────┤
│ [Products] [Users] [Orders] [Settings] │
├─────────────────────────────────────────┤
│ Products Management [➕ Add New Product]│
│                                         │
│ ID │ Name │ Price │ Stock │ Actions   │
│ 1  │ T-Sh │ $50  │ [15]  │ ED  │ DEL │
│ 2  │ Jean │ $60  │ [20]  │ ED  │ DEL │
│                                         │
└─────────────────────────────────────────┘
```

## Font & Typography

### Font Family
- Primary: Poppins (Google Fonts)
- Fallback: sans-serif

### Font Sizes
- Page Title (h1): 32px (desktop), 24px (mobile)
- Section Title (h2): 22px
- Form Labels: 14px
- Table Text: 14px
- Badge Text: 12px
- Button Text: 14px

### Font Weights
- Bold (headers): 600-700
- Regular (body): 400-500
- Light: 300

## Spacing & Padding

### Container
- Margin: 30px auto
- Padding: 20px
- Max Width: 1200px

### Sections
- Padding: 20px
- Border Radius: 8px
- Box Shadow: 0 2px 4px rgba(0,0,0,0.1)

### Form Groups
- Margin Bottom: 15px
- Padding: 10px (inputs)
- Border Radius: 4px

### Tables
- Cell Padding: 12px
- Row Hover: Light gray background
- Border: 1px solid #eee

---

This visual guide helps understand the admin panel layout and design at a glance!
