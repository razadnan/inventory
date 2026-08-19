"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";

type Product = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minimumStock: number;
};

type Movement = {
  id: string;
  movementType: "STOCK_IN" | "STOCK_OUT" | "CHALLAN_OUT";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference: string | null;
  createdAt: string;
  product: { name: string; sku: string };
  user: { name: string };
};

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    reference: "",
  });
  const [mode, setMode] = useState<"IN" | "OUT">("IN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  }, []);

  const fetchMovements = useCallback(async () => {
    const res = await fetch("/api/stock/movements");
    const data = await res.json();
    if (data.success) setMovements(data.movements);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, [fetchProducts, fetchMovements]);

  const lowStockProducts = products.filter((p) => p.quantity <= p.minimumStock);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = mode === "IN" ? "/api/stock/in" : "/api/stock/out";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to record stock movement");
      }

      setSuccess(data.message);
      setFormData({ productId: "", quantity: "", reference: "" });
      fetchProducts();
      fetchMovements();
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
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-900">Stock Movement</h1>
          <p className="mt-2 text-slate-600">
            Record stock IN/OUT and review movement history.
          </p>

          {lowStockProducts.length > 0 && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              <span className="font-semibold">{lowStockProducts.length} product(s)</span>{" "}
              at or below minimum stock:{" "}
              {lowStockProducts.map((p) => p.name).join(", ")}
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-1">
              <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode("IN")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium ${
                    mode === "IN" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Stock IN
                </button>
                <button
                  type="button"
                  onClick={() => setMode("OUT")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium ${
                    mode === "OUT" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Stock OUT
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product *
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — {p.quantity} in stock
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Quantity *
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Reference / Reason
                  </label>
                  <input
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    placeholder="e.g. PO-1042, damaged goods, etc."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Saving..." : `Record Stock ${mode}`}
                </button>
              </form>
            </div>

            <div className="rounded-xl bg-white shadow-sm lg:col-span-2">
              <div className="border-b border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900">Recent Movements</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Qty</th>
                      <th className="px-6 py-3 font-medium">Prev → New</th>
                      <th className="px-6 py-3 font-medium">By</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No movements yet.
                        </td>
                      </tr>
                    ) : (
                      movements.map((m) => (
                        <tr key={m.id} className="border-t border-slate-100">
                          <td className="px-6 py-3">
                            <div className="font-medium text-slate-900">{m.product.name}</div>
                            <div className="text-xs text-slate-400">{m.product.sku}</div>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                m.movementType === "STOCK_IN"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {m.movementType}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-slate-600">{m.quantity}</td>
                          <td className="px-6 py-3 text-slate-600">
                            {m.previousQuantity} → {m.newQuantity}
                          </td>
                          <td className="px-6 py-3 text-slate-600">{m.user.name}</td>
                          <td className="px-6 py-3 text-slate-500">
                            {new Date(m.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}