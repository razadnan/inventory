"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";

type Product = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
};

type Row = { productId: string; quantity: string };

export default function NewChallanPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [receiverName, setReceiverName] = useState("");
  const [destination, setDestination] = useState("");
  const [remarks, setRemarks] = useState("");
  const [rows, setRows] = useState<Row[]>([{ productId: "", quantity: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    }
    load();
  }, []);

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { productId: "", quantity: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const items = rows
      .filter((r) => r.productId && r.quantity)
      .map((r) => ({ productId: r.productId, quantity: Number(r.quantity) }));

    if (items.length === 0) {
      setError("Add at least one product line");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/challans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverName, destination, remarks, items }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create challan");
      }

      router.push(`/challans/${data.challan.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900">Create Challan</h1>
          <p className="mt-2 text-slate-600">Issue a delivery challan and deduct stock.</p>

          <form onSubmit={handleSubmit} className="mt-8 rounded-xl bg-white p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Receiver Name *
                </label>
                <input
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Destination *
                </label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Remarks
                </label>
                <input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-semibold text-slate-900">Products</h2>

              <div className="mt-4 space-y-3">
                {rows.map((row, index) => (
                  <div key={index} className="flex gap-3">
                    <select
                      value={row.productId}
                      onChange={(e) => updateRow(index, "productId", e.target.value)}
                      required
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — {p.quantity} in stock
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => updateRow(index, "quantity", e.target.value)}
                      required
                      className="w-32 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    />

                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="rounded-lg border border-slate-300 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                + Add another product
              </button>
            </div>

            {error && (
              <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/challans")}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Challan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
