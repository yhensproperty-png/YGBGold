# Project Summary: YGB Buy Gold & Sell

This document provides a detailed overview of the technical setup, architecture, and current features of the **YGB Buy Gold & Sell** website.

## 1. Hosting & Deployment
- **Platform**: Netlify
- **Build Settings**:
  - **Build Command**: `npm run build`
  - **Publish Directory**: `dist`
  - **Framework**: Vite
- **Edge Functions**:
  - `og-injector`: Injects OpenGraph metadata at the `/property/*` path for better social sharing previews.
  - `resend-inbound`: Handles inbound email webhooks from Resend. Verifies Svix webhook signature, fetches full email body via `GET /emails/receiving/{id}` (requires Full Access API key), and forwards to `ygbgoldbuysell@gmail.com` with `reply_to` set to the original sender.
- **Environment Variables** (Netlify dashboard):
  - `VITE_SUPABASE_URL`: Supabase project endpoint.
  - `VITE_SUPABASE_ANON_KEY`: Public anonymous key for client-side operations.
  - `VITE_RESEND_API_KEY`: Resend API key for frontend use.
  - `RESEND_API_KEY`: Full Access Resend API key for edge functions (secret).
  - `RESEND_WEBHOOK_SECRET`: Resend webhook signing secret for Svix verification (secret).
- **GitHub Repo**: `https://github.com/yhensproperty-png/YGBGold.git` (branch: `main`)

## 2. Frontend Framework & Stack
- **Core**: React 18+ with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS (JIT mode).
- **Icons**: Google Material Icons.
- **Routing**: `react-router-dom` (v6).
- **Key Directory Structure**:
  - `src/components/`: Reusable UI elements (`Navbar`, `SEO`, `ScrollToTop`, `GoldLongTermPerformance`, etc.).
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
### `public.orders` (Purchase Intent)
| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key — auto-generated via `gen_random_uuid()`. |
| `order_number` | `serial` (integer) | Auto-incrementing human-readable order reference (1, 2, 3…). |
| `listing_id` | `text` | FK → `properties.id` (SET NULL on delete). |
| `user_id` | `uuid` | FK → `auth.users` (nullable — supports guest checkout). |
| `customer_name` | `text` | Buyer's full name. |
| `customer_email` | `text` | Buyer's email. |
| `customer_phone` | `text` | Buyer's phone number. |
| `shipping_address` | `text` | Free-text shipping address. |
| `shipping_country_group` | `text` | Country/region group for shipping zone calculation. |
| `shipping_fee` | `numeric` | Shipping fee applied at time of order. |
| `amount` | `numeric` | Item price captured at time of order (PHP). |
| `currency` | `text` | Default `PHP`. |
| `status` | `text` | `pending` → `confirmed` → `shipped` / `cancelled`. |
| `tracking_number` | `text` | Courier tracking ID (set by admin). |
| `admin_notes` | `text` | Internal notes visible only to admin. |
| `created_at` | `timestamptz` | Order creation timestamp. |
| `updated_at` | `timestamptz` | Auto-updated via `moddatetime` trigger. |

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
- **Removed Logic**: Commission tracking, "Rent" functionality, search bar, Featured Assets section, Latest Inventory section, and "Choose Your Lifestyle" categories have all been fully stripped from the codebase.
- **Buy Request Flow**:
  1. User clicks **"Reserve"** on `ItemDetails.tsx`, which opens an order form.
  2. On submit, `OrderService.addOrder()` is called — inserts a row into `public.orders` with `status = 'pending'`.
  3. Supports both authenticated users (`user_id` set) and anonymous guests (`user_id` null).
  4. Admin manages orders in `OrderManagement.tsx` (within `AdminDashboard`), which calls `OrderService.getAllOrders()` joining with `properties` for listing details.
  5. Admin view has a **status filter toggle** — tabs for `all`, `pending`, `confirmed`, `shipped`, `cancelled`.
  6. Admin can update status, add tracking number, and write internal notes via `OrderService.updateOrderStatus()`.
  7. No payment gateway — fulfillment is manual.
- **Storage**: Supabase Storage Bucket **is set up** (migration `20260220112059_setup_storage_bucket.sql`). Images are stored/referenced there; the bucket was configured with a size limit increase in a follow-up migration.
- **Email Architecture**:
  - **Outbound** (automated/transactional): Resend API via `RESEND_API_KEY`.
  - **Inbound** (domain email forwarding): Resend `email.received` webhook → `resend-inbound` Netlify edge function → fetches body via `GET /emails/receiving/{email_id}` (Full Access key required — standard `/emails/{id}` is for sent mail only and returns 404) → forwards to `ygbgoldbuysell@gmail.com` with `reply_to` = original sender and sender name = original sender email. Webhook URL: `https://ygbgold.com/resend-inbound`.
  - **Contact forms**: Web3Forms (already working, separate from Resend).
- **Floating Facebook Messenger Button**: Fixed bottom-right button in `App.tsx` linking to `https://m.me/Goldelyn` with Messenger gradient styling.
- **Gold Performance Section**: TradingView chart (OANDA:XAUUSD, weekly, 60M range) displayed side-by-side with `GoldLongTermPerformance` component showing 5Y–30Y historical returns. Background is black with white text.
- **GoldLongTermPerformance Component**:
  - Shows Total Return % and CAGR for 5, 10, 15, 20, 25, 30-year periods.
  - Historical anchor prices: 1996=$395, 2001=$260, 2006=$555, 2011=$1,417, 2016=$1,255, 2021=$1,740.
  - Fetches live XAU/USD price from metals.live → frankfurter fallback → hardcoded $4,660.
  - localStorage cache key: `ygb_gold_price_v2` (1-hour TTL). v2 busts the old stale v1 cache.
  - Live price display removed from UI (APIs unreliable; TradingView chart shows live price).
- **Home Page Section Order**:
  1. Hero — "Invest in Gold" scrolls to inventory; background black.
  2. How It Works — 3 steps.
  3. Gold Performance — TradingView chart + historical returns table.
  4. Gold Jewelry Investment Inventory — filterable listings grid.

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
