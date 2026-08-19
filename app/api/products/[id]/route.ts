import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, sku, category, unitPrice, minimumStock } = body;

    if (!name || !sku || !unitPrice) {
      return NextResponse.json(
        { success: false, message: "Name, SKU and unit price are required" },
        { status: 400 }
      );
    }

    if (Number(unitPrice) < 0 || Number(minimumStock) < 0) {
      return NextResponse.json(
        { success: false, message: "Price and minimum stock must be positive" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const skuOwner = await prisma.product.findUnique({
      where: { sku: sku.toUpperCase() },
    });
    if (skuOwner && skuOwner.id !== id) {
      return NextResponse.json(
        { success: false, message: "A different product already uses this SKU" },
        { status: 409 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku: sku.toUpperCase(),
        category,
        unitPrice: Number(unitPrice),
        minimumStock: Number(minimumStock || 0),
      },
    });

    return NextResponse.json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}