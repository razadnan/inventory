"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    quantity: "",
    minimumStock: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      router.push("/products");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="ml-64 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Add Product
            </h1>

            <p className="mt-2 text-slate-600">
              Add a new product to your warehouse inventory.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white p-8 shadow-sm"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Product Name *
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Wireless Keyboard"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  SKU *
                </label>

                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  placeholder="e.g. KB-WL-001"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 uppercase outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Unit Price *
                </label>

                <input
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Initial Quantity
                </label>

                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Minimum Stock
                </label>

                <input
                  name="minimumStock"
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}