"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { menuItemSchema } from "@/lib/validations/menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type MenuFormData = z.input<typeof menuItemSchema>;

interface MenuFormProps {
  defaultValues?: Partial<MenuFormData> & { id?: string };
  mode: "create" | "edit";
}

export function MenuForm({ defaultValues, mode }: MenuFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "",
      isAvailable: true,
      isFeatured: false,
      brandSlug: "dapur-bwaji",
      ...defaultValues,
    },
  });

  async function onSubmit(data: MenuFormData) {
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/menu" : `/api/menu/${defaultValues?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan menu");
      router.push("/admin/menu");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus menu ini? Tindakan tidak bisa dibatalkan.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/menu/${defaultValues?.id}`, { method: "DELETE" });
      router.push("/admin/menu");
      router.refresh();
    } catch {
      alert("Gagal menghapus menu");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="name"
          label="Nama Menu"
          placeholder="cth. Nasi Goreng Spesial"
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="brandSlug" className="text-sm font-medium text-gray-700">Brand</label>
          <select
            id="brandSlug"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            {...register("brandSlug")}
          >
            <option value="dapur-bwaji">Dapur Bwaji</option>
            <option value="hoki-dimsum">Hoki Dimsum</option>
          </select>
          {errors.brandSlug && <p className="text-xs text-red-500">{errors.brandSlug.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium text-gray-700">Harga (Rp)</label>
          <input
            id="price"
            type="number"
            min={0}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
        </div>
        <Input
          id="category"
          label="Kategori"
          placeholder="cth. Nasi, Mie, Dimsum"
          error={errors.category?.message}
          {...register("category")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">Deskripsi</label>
        <textarea
          id="description"
          rows={3}
          placeholder="Deskripsi singkat menu..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          {...register("description")}
        />
      </div>

      <Input
        id="imageUrl"
        label="URL Foto (opsional)"
        placeholder="https://..."
        error={errors.imageUrl?.message}
        {...register("imageUrl")}
      />

      <div className="flex gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded accent-orange-500" {...register("isAvailable")} />
          <span className="font-medium text-gray-700">Tersedia</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded accent-orange-500" {...register("isFeatured")} />
          <span className="font-medium text-gray-700">Tampilkan di Featured</span>
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-5">
        {mode === "edit" ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={15} />
            {deleting ? "Menghapus..." : "Hapus Menu"}
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/menu")}
          >
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : mode === "create" ? "Simpan Menu" : "Update Menu"}
          </Button>
        </div>
      </div>
    </form>
  );
}
