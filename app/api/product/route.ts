import { getSession } from "@/app/auth/stateless-session";
import { AppInfoContext } from "@/components/app-wrapper";
import prisma from "@/lib/prisma";
import { ProductModel } from "@/models/api/productModel";
import { getPaginatedProducts } from "@/services/productServices";
import { NextRequest, NextResponse } from "next/server";
import { useContext } from "react";

// GET Handler: Fetch paginated products
export async function GET(req: NextRequest) {
  try {
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "10");
    const currentPage = parseInt(req.nextUrl.searchParams.get("currentPage") || "1");

    const data = await getPaginatedProducts({ pageSize, currentPage });

    // Flatten the response to only return the array of records
    const records = data.records || [];

    return NextResponse.json({ message: "Success", data: records });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong", data: [] },
      { status: 500 }
    );
  }
}

// POST Handler: Add a new product
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const sessoin = await getSession()
    console.log("------- q", sessoin)
    if(!sessoin){
      return NextResponse.json("Unauthorized", {status: 401})
    }
    // Get the last product to generate the next productCode
    const lastProduct = await prisma.product.findFirst({
      orderBy: { productCode: "desc" },
    });

    let newProductCode = "P0001"; // Default product code if no products exist

    if (lastProduct) {
      const lastProductCodeNumber = parseInt(
        lastProduct.productCode.replace("P", ""),
        10
      );
      const nextProductCodeNumber = lastProductCodeNumber + 1;

      newProductCode = `P${nextProductCodeNumber.toString().padStart(4, "0")}`;
    }

    const product = await prisma.product.create({
      data: {
        productCode: newProductCode,
        nameEn: data.nameEn,
        nameKh: data.nameKh,
        categoryId: parseInt(data.categoryId),
        sku: data.sku,
        imageUrl: data.imageUrl,
        createdBy: sessoin.userId,
        updatedBy: sessoin.userId,
      },
    });

    const resData: ProductModel = {
      id: product.id,
      productCode: newProductCode,
      nameEn: product.nameEn,
      nameKh: product.nameKh || "",
      categoryId: product.categoryId,
      imageUrl: data.imageUrl,
      sku: product.sku || "",
      createdBy: sessoin.userId,
      updatedBy: sessoin.userId,
    };
    return NextResponse.json({ message: "Product created successfully", data: resData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add product",
      },
      { status: 500 }
    );
  }
}

