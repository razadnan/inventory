import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("productId") || undefined;
    const movementType = searchParams.get("type") || undefined;

    const movements = await prisma.stockMovement.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(movementType ? { movementType: movementType as "STOCK_IN" | "STOCK_OUT" | "CHALLAN_OUT" } : {}),
      },
      include: {
        product: { select: { name: true, sku: true, productCode: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, movements });
  } catch (error) {
    console.error("Movements error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}