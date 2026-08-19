import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true, productCode: true, unitPrice: true } },
          },
        },
        creator: { select: { name: true } },
      },
    });

    if (!challan) {
      return NextResponse.json(
        { success: false, message: "Challan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, challan });
  } catch (error) {
    console.error("Get challan error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch challan" },
      { status: 500 }
    );
  }
}