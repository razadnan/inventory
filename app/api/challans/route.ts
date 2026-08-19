import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type ChallanItemInput = {
  productId: string;
  quantity: number;
};

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
    const { receiverName, destination, remarks, items } = body as {
      receiverName: string;
      destination: string;
      remarks?: string;
      items: ChallanItemInput[];
    };

    if (!receiverName || !destination) {
      return NextResponse.json(
        { success: false, message: "Receiver name and destination are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one product line is required" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Each item needs a valid product and positive quantity" },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify available stock for every item BEFORE creating anything
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }

        if (item.quantity > product.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${product.name}:${product.quantity}`
          );
        }
      }

      // 2. Generate challan number CH-YYYY-NNN
      const year = new Date().getFullYear();
      const prefix = `CH-${year}-`;

      const existingCount = await tx.challan.count({
        where: { challanNumber: { startsWith: prefix } },
      });

      const challanNumber = `${prefix}${String(existingCount + 1).padStart(3, "0")}`;

      // 3. Create the challan
      const challan = await tx.challan.create({
        data: {
          challanNumber,
          receiverName,
          destination,
          remarks: remarks || null,
          createdBy: user.userId,
        },
      });

      // 4. Create challan items + deduct stock + log movements
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity - item.quantity;

        await tx.challanItem.create({
          data: {
            challanId: challan.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: newQuantity },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            movementType: "CHALLAN_OUT",
            quantity: item.quantity,
            previousQuantity,
            newQuantity,
            reference: challanNumber,
            userId: user.userId,
          },
        });
      }

      return challan;
    });

    return NextResponse.json(
      { success: true, message: "Challan created successfully", challan: result },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("PRODUCT_NOT_FOUND")) {
      return NextResponse.json(
        { success: false, message: "One or more products could not be found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK")) {
      const [, name, available] = error.message.split(":");
      return NextResponse.json(
        {
          success: false,
          message: `Unable to generate challan. Only ${available} units of "${name}" are available.`,
        },
        { status: 400 }
      );
    }

    console.error("Create challan error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to generate challan" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        items: true,
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, challans });
  } catch (error) {
    console.error("List challans error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch challans" },
      { status: 500 }
    );
  }
}