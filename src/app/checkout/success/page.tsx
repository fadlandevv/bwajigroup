import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-20">
        <div className="text-center">
          <CheckCircle size={64} className="mx-auto text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Pesanan Berhasil!</h1>
          <p className="mt-2 text-gray-500">
            Pesanan kamu sudah diterima. Kami akan segera memproses pesananmu.
          </p>
          <Link href="/">
            <Button className="mt-6">Kembali ke Beranda</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
