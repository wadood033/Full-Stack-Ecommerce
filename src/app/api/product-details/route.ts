// /app/api/product-details/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const {
      product_id,
      gallery = ["", "", "", ""],
      rating,
      full_description = "",
      care_instructions = "",
      material = "",
      fit = "",
      length = "",
      discount_price = null,
      discount_percentage = "0",
      colors = [""],
      sizes = [""],
      gender = "",
      model_info = "",
      quantity = 0 // ✅ added default value
    } = await req.json();

    // ✅ Validate product_id
    const productId = parseInt(product_id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Valid product_id is required' }, { status: 400 });
    }

    // ✅ Parse rating and discount_percentage to numbers
    const parsedRating = parseFloat(rating);
    const parsedDiscount = parseFloat(discount_percentage);
    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedRating)) {
      return NextResponse.json({ error: 'Rating must be a valid number' }, { status: 400 });
    }

    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return NextResponse.json({ error: 'Quantity must be a non-negative integer' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO product_details (
        product_id,
        gallery,
        rating,
        full_description,
        care_instructions,
        material,
        fit,
        length,
        discount_price,
        discount_percentage,
        colors,
        sizes,
        gender,
        model_info,
        quantity
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING *`,
      [
        productId,
        gallery,
        parsedRating,
        full_description,
        care_instructions,
        material,
        fit,
        length,
        discount_price,
        parsedDiscount,
        colors,
        sizes,
        gender,
        model_info,
        parsedQuantity // ✅ inserted
      ]
    );

    const inserted = result.rows[0];
    inserted.rating = parseFloat(inserted.rating); // Ensure it's number in response

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('❌ Failed to insert product details:', err);
    return NextResponse.json(
      { error: 'Failed to create product details' },
      { status: 500 }
    );
  }
}
