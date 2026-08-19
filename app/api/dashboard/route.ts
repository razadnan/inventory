import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany();

    const totalProducts = products.length;
    const totalStockUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockProducts = products.filter((p) => p.quantity <= p.minimumStock);
    const totalChallans = await prisma.challan.count();

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalStockUnits,
        lowStockCount: lowStockProducts.length,
        totalChallans,
      },
      lowStockProducts: lowStockProducts.slice(0, 5),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}