import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity, reference } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Product and quantity are required" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a positive whole number" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const previousQuantity = product.quantity;

      // FR-04: reject if Requested Quantity > Available Quantity
      if (qty > previousQuantity) {
        throw new Error(
          `INSUFFICIENT_STOCK:${previousQuantity}`
        );
      }

      const newQuantity = previousQuantity - qty;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          movementType: "STOCK_OUT",
          quantity: qty,
          previousQuantity,
          newQuantity,
          reference: reference || null,
          userId: user.userId,
        },
      });

      return { updatedProduct, movement };
    });

    return NextResponse.json({
      success: true,
      message: "Stock removed successfully",
      product: result.updatedProduct,
      movement: result.movement,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK")) {
      const available = error.message.split(":")[1];
      return NextResponse.json(
        {
          success: false,
          message: `Stock OUT cannot be completed. Only ${available} units are available.`,
        },
        { status: 400 }
      );
    }

    console.error("Stock OUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record stock OUT" },
      { status: 500 }
    );
  }
}