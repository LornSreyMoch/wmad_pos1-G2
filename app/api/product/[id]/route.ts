import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// In-memory product database
let productDatabase: Record<string, any> = {};

// 📖 GET: Fetch a product by ID
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({
      success: false,
      error: "Missing 'id' query parameter",
      data: productDatabase,
    });
  }

  if (!productDatabase[id]) {
    return NextResponse.json({
      success: false,
      error: "Product not found",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Product found",
    product: productDatabase[id],
  });
}


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Parse the request body
    const body = await request.json();
    const { nameEn, nameKh, categoryId, sku, imageUrl } = body;

    // Update the product in the database
    const updateProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        nameEn,
        nameKh,
        categoryId,
        sku,
        imageUrl,
      },
    });

    // Return the updated product
    return NextResponse.json({
      message: "Product updated successfully!",
      product: updateProduct,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update product", details: (error as Error).message },
      { status: 400 }
    );
  }
}



// DELETE: Remove a product by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Product deleted successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product " })
  }
}
