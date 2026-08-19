import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const productCount = await prisma.product.count();

    return NextResponse.json(
      {
        success: true,
        message: "Database connected successfully",
        data: {
          productCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}