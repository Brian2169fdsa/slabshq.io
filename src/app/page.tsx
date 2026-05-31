import { redirect } from 'next/navigation';

// Phase 1: land directly in the app. The marketing site (Home/Product/
// Pricing/Use Cases/Auth) is a later port — see RECONCILIATION.md.
export default function Home() {
  redirect('/dashboard');
}
