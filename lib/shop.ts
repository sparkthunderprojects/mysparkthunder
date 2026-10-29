/**
 * Sparkthunder Shop data for the account pages.
 *
 * The shop (sparkthunder.shop) keeps its own orders and payments. When it
 * opens, wire these two functions to it and the Wish list and Orders pages
 * will start showing real data with no other changes.
 */

export interface WishlistItem {
  id: string;
  name: string;
  url: string | null;
  addedAt: string;
}

export interface OrderSummary {
  id: string;
  placedAt: string;
  total: string;
  status: string;
  itemCount: number;
}

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  void userId;
  return [];
}

export async function getOrders(userId: string): Promise<OrderSummary[]> {
  void userId;
  return [];
}
