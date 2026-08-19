"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";

type ChallanDetail = {
  challanNumber: string;
  receiverName: string;
  destination: string;
  remarks: string | null;
  createdAt: string;
  creator: { name: string };
  items: {
    id: string;
    quantity: number;
    product: { name: string; sku: string; unitPrice: string };
  }[];
};

export default function ChallanDetailPage() {
  const params = useParams<{ id: string }>();
  const [challan, setChallan] = useState<ChallanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/challans/${params.id}`);
      const data = await res.json();
      if (data.success) setChallan(data.challan);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Sidebar />
        <div className="ml-64 p-8 text-slate-500">Loading...</div>
      </main>
    );
  }

  if (!challan) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Sidebar />
        <div className="ml-64 p-8 text-slate-500">Challan not found.</div>
      </main>
    );
  }

  const totalItems = challan.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{challan.challanNumber}</h1>
              <p className="mt-2 text-slate-600">
                {new Date(challan.createdAt).toLocaleString()}
              </p>
            </div>

            <a
              href={`/api/challans/${params.id}/pdf`}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Download PDF
            </a>
          </div>

          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-slate-500">Receiver</p>
                <p className="font-medium text-slate-900">{challan.receiverName}</p>
              </div>
              <div>
                <p className="text-slate-500">Destination</p>
                <p className="font-medium text-slate-900">{challan.destination}</p>
              </div>
              <div>
                <p className="text-slate-500">Issued By</p>
                <p className="font-medium text-slate-900">{challan.creator.name}</p>
              </div>
              {challan.remarks && (
                <div>
                  <p className="text-slate-500">Remarks</p>
                  <p className="font-medium text-slate-900">{challan.remarks}</p>
                </div>
              )}
            </div>

            <table className="mt-8 w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 font-medium">Product</th>
                  <th className="py-3 font-medium">SKU</th>
                  <th className="py-3 font-medium">Qty</th>
                  <th className="py-3 font-medium">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {challan.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-900">{item.product.name}</td>
                    <td className="py-3 text-slate-600">{item.product.sku}</td>
                    <td className="py-3 text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-slate-600">
                      ₹{Number(item.product.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4 text-right text-sm font-semibold text-slate-900">
              Total Items: {totalItems}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}