import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
   apiVersion: '2025-05-28.basil',
});

// Define the shape of a single cart item
interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutRequestBody {
  items: CartItem[];
}

export async function POST(req: Request) {
  try {
    const { items }: CheckoutRequestBody = await req.json();

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // PKR to paisa
        },
        quantity: item.quantity,
      })
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown server error';

    console.error('[STRIPE_CHECKOUT_ERROR]', message);
    return new NextResponse(
      JSON.stringify({ success: false, error: message }),
      { status: 500 }
    );
  }
}
