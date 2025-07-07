'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  size?: string | null;
  color?: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartMenu(state) {
      state.isOpen = !state.isOpen;
    },

    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        item =>
          item.id === action.payload.id &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },

    removeFromCart(
      state,
      action: PayloadAction<{ id: string; size?: string | null; color?: string | null }>
    ) {
      state.items = state.items.filter(
        item =>
          !(
            item.id === action.payload.id &&
            item.size === action.payload.size &&
            item.color === action.payload.color
          )
      );
    },

    incrementQuantity(
      state,
      action: PayloadAction<{ id: string; size?: string | null; color?: string | null }>
    ) {
      const item = state.items.find(
        i =>
          i.id === action.payload.id &&
          i.size === action.payload.size &&
          i.color === action.payload.color
      );
      if (item) item.quantity++;
    },

    decrementQuantity(
      state,
      action: PayloadAction<{ id: string; size?: string | null; color?: string | null }>
    ) {
      const item = state.items.find(
        i =>
          i.id === action.payload.id &&
          i.size === action.payload.size &&
          i.color === action.payload.color
      );
      if (item && item.quantity > 1) item.quantity--;
    },

    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  toggleCartMenu,
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
