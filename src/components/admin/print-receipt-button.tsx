"use client";

import { Printer } from "lucide-react";

const BRAND_NAMES: Record<string, string> = {
  "dapur-bwaji": "Dapur Bwaji",
  "hoki-dimsum": "Hoki Dimsum",
};

interface Item {
  menuItemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  brandSlug: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  customerNote?: string | null;
  createdAt: string;
}

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function buildReceiptHTML(order: Order, items: Item[]): string {
  const brandName = BRAND_NAMES[order.brandSlug] ?? order.brandSlug;
  const orderId = order.id.slice(0, 8).toUpperCase();

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:3px 0;vertical-align:top">${item.menuItemName}</td>
      <td style="padding:3px 0;text-align:center;vertical-align:top">${item.quantity}</td>
      <td style="padding:3px 0;text-align:right;vertical-align:top">${formatRp(item.subtotal)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Struk #${orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      width: 300px;
      margin: 0 auto;
      padding: 12px 8px;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .brand { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; }
    th { font-weight: bold; border-bottom: 1px solid #000; padding: 3px 0; }
    .total-row td { font-weight: bold; border-top: 1px solid #000; padding-top: 6px; }
    .footer { margin-top: 10px; font-size: 11px; }
    @media print {
      body { margin: 0; }
      @page { margin: 4mm; size: 80mm auto; }
    }
  </style>
</head>
<body>
  <div class="center">
    <div class="brand">${brandName.toUpperCase()}</div>
    <div style="font-size:10px;margin-top:2px">Bwaji Group</div>
  </div>

  <div class="divider"></div>

  <table>
    <tr><td>No. Order</td><td style="text-align:right">#${orderId}</td></tr>
    <tr><td>Tanggal</td><td style="text-align:right">${formatDate(order.createdAt)}</td></tr>
    <tr><td>Pelanggan</td><td style="text-align:right">${order.customerName}</td></tr>
    <tr><td>Telepon</td><td style="text-align:right">${order.customerPhone}</td></tr>
    <tr><td>Pembayaran</td><td style="text-align:right;text-transform:uppercase">${order.paymentMethod}</td></tr>
  </table>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Harga</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td style="text-align:right">${formatRp(order.totalAmount)}</td>
      </tr>
    </tfoot>
  </table>

  ${order.customerNote ? `
  <div class="divider"></div>
  <div><span class="bold">Catatan:</span> ${order.customerNote}</div>
  ` : ""}

  <div class="divider"></div>

  <div class="center footer">
    <div>Terima kasih atas pesanan Anda!</div>
    <div style="margin-top:4px">★ Selamat menikmati ★</div>
  </div>
</body>
</html>`;
}

export function PrintReceiptButton({ order, items }: { order: Order; items: Item[] }) {
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=420,height=600");
    if (!win) return;
    win.document.write(buildReceiptHTML(order, items));
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 active:scale-95"
    >
      <Printer size={15} />
      Cetak Struk
    </button>
  );
}
