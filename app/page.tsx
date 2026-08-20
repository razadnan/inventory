import Sidebar from "@/components/sidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany();

  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockProducts = products.filter((p) => p.quantity <= p.minimumStock);
  const totalChallans = await prisma.challan.count();

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">Overview of your warehouse inventory</p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Products</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totalProducts}</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Stock</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totalStockUnits}</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Low Stock</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {lowStockProducts.length}
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Challans</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totalChallans}</p>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Low Stock Products</h2>
              <ul className="mt-4 divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <li key={p.id} className="flex justify-between py-3 text-sm">
                    <span className="text-slate-700">{p.name}</span>
                    <span className="text-red-600">
                      {p.quantity} left (min {p.minimumStock})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}