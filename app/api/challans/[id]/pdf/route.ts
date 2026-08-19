import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      creator: { select: { name: true } },
    },
  });

  if (!challan) {
    return NextResponse.json(
      { success: false, message: "Challan not found" },
      { status: 404 }
    );
  }

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  // Header
  doc.fontSize(18).font("Helvetica-Bold").text("Warehouse Inventory System", { align: "left" });
  doc.moveDown(0.3);
  doc.fontSize(14).font("Helvetica").text(`Delivery Challan: ${challan.challanNumber}`);
  doc.moveDown(1);

  // Meta info
  doc.fontSize(10).font("Helvetica");
  doc.text(`Date: ${challan.createdAt.toLocaleDateString()}`);
  doc.text(`Receiver: ${challan.receiverName}`);
  doc.text(`Destination: ${challan.destination}`);
  if (challan.remarks) doc.text(`Remarks: ${challan.remarks}`);
  doc.text(`Issued By: ${challan.creator.name}`);
  doc.moveDown(1);

  // Table header
  const tableTop = doc.y;
  const col = { product: 50, sku: 250, qty: 400, price: 470 };

  doc.font("Helvetica-Bold");
  doc.text("Product", col.product, tableTop);
  doc.text("SKU", col.sku, tableTop);
  doc.text("Qty", col.qty, tableTop);
  doc.text("Unit Price", col.price, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  let y = tableTop + 25;
  doc.font("Helvetica");

  let totalItems = 0;

  for (const item of challan.items) {
    doc.text(item.product.name, col.product, y, { width: 190 });
    doc.text(item.product.sku, col.sku, y);
    doc.text(String(item.quantity), col.qty, y);
    doc.text(`Rs. ${Number(item.product.unitPrice).toFixed(2)}`, col.price, y);

    totalItems += item.quantity;
    y += 22;
  }

  doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
  doc.font("Helvetica-Bold").text(`Total Items: ${totalItems}`, col.product, y + 15);

  // Signature area
  doc.moveDown(4);
  doc.font("Helvetica").text("_______________________", 50, doc.y);
  doc.text("Authorized Signature", 50, doc.y + 5);

  doc.end();

  const buffer: Buffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${challan.challanNumber}.pdf"`,
    },
  });
}