import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const categoryCodes: Record<string, string> = {
  sensor: "S",
  component: "C",
  mechanical: "M",
  electronics: "E",
  electrical: "EL",
};

function getCategoryCode(category: string) {
  const normalized = category.trim().toLowerCase();

  return categoryCodes[normalized] || "O";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      sku,
      category,
      unitPrice,
      quantity,
      minimumStock,
    } = body;

    if (!name || !sku || !unitPrice || !category) {
      return NextResponse.json(
        {
          message:
            "Name, SKU, category and unit price are required",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          message: "A product with this SKU already exists",
        },
        { status: 409 }
      );
    }

    const categoryCode = getCategoryCode(category);

    const prefix = `MI01/${categoryCode}/`;

    const products = await prisma.product.findMany({
      where: {
        productCode: {
          startsWith: prefix,
        },
      },
      select: {
        productCode: true,
      },
    });

    let highestSequence = 0;

    for (const product of products) {
      const parts = product.productCode.split("/");
      const sequence = Number(parts[2]);

      if (!Number.isNaN(sequence) && sequence > highestSequence) {
        highestSequence = sequence;
      }
    }

    const productCode = `${prefix}${highestSequence + 1}`;

    const product = await prisma.product.create({
      data: {
        productCode,
        name,
        sku: sku.toUpperCase(),
        category,
        unitPrice: Number(unitPrice),
        quantity: Number(quantity || 0),
        minimumStock: Number(minimumStock || 0),
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}

// Add this import at the top, alongside the existing ones
import { NextRequest } from "next/server";

// Add this handler in the same file as POST
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const lowStockOnly = searchParams.get("lowStock") === "true";

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { sku: { contains: search, mode: "insensitive" } },
                  { productCode: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          category ? { category } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const filtered = lowStockOnly
      ? products.filter((p) => p.quantity <= p.minimumStock)
      : products;

    return NextResponse.json({ success: true, products: filtered });
  } catch (error) {
    console.error("List products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}