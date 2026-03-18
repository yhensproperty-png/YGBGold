# Project Summary: YGB Buy Gold & Sell

This document provides a detailed overview of the technical setup, architecture, and current features of the **YGB Buy Gold & Sell** website.

## 1. Hosting & Deployment
- **Platform**: Netlify
- **Build Build Settings**:
  - **Build Command**: `npm run build`
  - **Publish Directory**: `dist`
  - **Framework**: Vite
- **Edge Functions**:
  - `og-injector`: Injected OpenGraph metadata at the `/property/*` path for better social sharing previews.
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: Supabase project endpoint.
  - `VITE_SUPABASE_ANON_KEY`: Public anonymous key for client-side operations.

## 2. Frontend Framework & Stack
- **Core**: React 18+ with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS (JIT mode).
- **Icons**: Google Material Icons.
- **Routing**: `react-router-dom` (v6).
- **Key Directory Structure**:
  - `src/components/`: Reusable UI elements (`Navbar`, `SEO`, `ScrollToTop`, etc.).
  - `src/pages/`: Main application views (`Home`, `AddListing`, `ManageListings`, `ItemDetails`, `AdminDashboard`).
  - `src/services/`: Supabase client and service wrappers (`propertyService.ts`, `orderService.ts`).
  - `src/context/`: Global state management (`AuthContext.tsx`).
  - `src/utils/`: Helper functions (Image compression, formatting).
  - `public/`: Static assets (Logo, images).

## 3. Backend Integration (Supabase)
- **Client Initialization**: Initialized in `src/services/supabaseClient.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Primary Service Layer**: `src/services/propertyService.ts` handles all CRUD operations for the `properties` table.
- **CRUD Operations**:
  - `getAll()`: Fetches all listed items ordered by date.
  - `add()`: Inserts a new item and associates it with the logged-in user.
  - `update()`: Updates existing records.
  - `delete()`: Removes records from the database.
- **Order Service Layer**: `src/services/orderService.ts` handles purchase intent requests.
  - `getAllOrders()`: Admin-only fetch for all customer buy requests.
  - `addOrder()`: Submits a new purchase request (supports guest/anonymous users).
  - `updateOrderStatus()`: Updates status and tracking numbers.

## 4. Database Schema
The database runs on PostgreSQL (Supabase). Key tables include:

### `public.properties` (Core Inventory)
| Column | Type | Description |
|---|---|---|
| `id` | `text` | Unique UUID string. |
| `listing_id` | `text` | Human-readable ID (e.g., `001`, `002`). |
| `slug` | `text` | SEO-friendly URL slug. |
| `title` | `text` | Item name/title. |
| `type` | `text` | Category (Coins, Bars, Jewelry, etc.). |
| `price` | `numeric` | Sale price in PHP. |
| `description` | `text` | Item details/condition. |
| `beds` | `integer` | Reused for **Karat** (18, 21, 24). |
| `baths` | `numeric` | Reused for **Weight (Grams)**. |
| `origin` | `text` | Source (Saudi Gold, Japan Gold, etc.). |
| `inventory_amount` | `integer` | Internal stock tracking (Defaults to 1). |
| `status` | `text` | `active`, `sold`, `archived`. |
| `images` | `jsonb` | Array of base64 or URL image strings. |

### Other Tables
- `profiles`: User roles and metadata.
- `seller_inquiries`: Data from the "Sell Your Gold" form.
- `property_inquiries`: Contact requests for specific items.
- `custom_amenities`: Manageable tags/hallmarks.
- **`public.orders` (Purchase Intent)**
  - `id` (uuid): Primary key.
  - `listing_id` (text): Reference to `properties.id`.
  - `customer_name`, `customer_email`, `customer_phone`, `shipping_address`: Buyer details.
  - `amount` (numeric): Capture price at time of request.
  - `status` (text): `pending`, `confirmed`, `shipped`, `cancelled`.
  - `tracking_number` (text): Courier tracking ID.

## 5. Authentication & Security
- **Auth Provider**: Supabase Authentication via `AuthContext.tsx`.
- **Roles**: 
  - **Admin**: Full access to `AdminDashboard`, user management, and global listings.
  - **User**: Access to personal listings and standard admin features.
- **Protected Routes**: Logic implemented in `App.tsx` using `ProtectedRoute` to gate active management pages.
- **MFA (Multi-Factor Authentication)**: Integrated support for enrolling and verifying MFA via Supabase.
- **Row Level Security (RLS)**: Enabled on all sensitive tables (`properties`, `profiles`, `commissions`).

## 6. Key Features & Patterns
- **Listing ID Generation**: Logic in `AddListing.tsx` scans existing items to find the highest number and pads it to 3 digits (e.g., `001`, `002`).
- **Image Handling**: `imageCompression.ts` reduces file size before uploading to bypass field limits and improve load times.
- **SEO**: Dynamic title and meta descriptions for every page via the `SEO` component.
- **Inventory Tracking**: Mandatory `inventory_amount` field added for future automated purchase integration.
- **Removed Logic**: Commission tracking and "Rent" functionality have been fully stripped from the codebase to simplify the business model.
- **Buy Request Flow**: Users can express purchase intent via "Request to Buy" on the item page. Admins manage these via the **"Orders"** tab in the Manage Items view, where they can confirm orders and add tracking numbers. No payment gateway is currently integrated; fulfillment is handled manually.

## 7. Sample Code Snippets

### Supabase Client Init (`supabaseClient.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3-Digit ID Logic (`AddListing.tsx`)
```typescript
const maxNum = allProps.reduce((max, p) => {
  const match = p.listing_id?.match(/^\d+$/);
  if (match) {
    const num = parseInt(match[0]);
    if (num > 500) return max; 
    return num > max ? num : max;
  }
  return max;
}, 0);
listingId = (maxNum + 1).toString().padStart(3, '0');
```
