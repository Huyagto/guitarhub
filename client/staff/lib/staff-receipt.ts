import type { StaffAuthUser } from "@/lib/auth"
import type { StaffOrder } from "@/lib/order-types"
import type { CustomerInfo, OrderItem, PaymentMethod } from "@/lib/pos-data"

type ReceiptPaymentMethod = PaymentMethod | StaffOrder["paymentMethod"]

interface ReceiptLineItem {
  name: string
  sku?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

interface StaffReceiptInput {
  orderNumber: string
  createdAt?: string | Date
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  customerNote?: string
  items: ReceiptLineItem[]
  subtotal: number
  discountAmount?: number
  shippingFee?: number
  total: number
  paymentMethod: ReceiptPaymentMethod
  staff?: StaffAuthUser | null
}

const paymentMethodNames: Record<ReceiptPaymentMethod, string> = {
  cash: "Tiền mặt",
  "bank-transfer": "Chuyển khoản",
  bank_transfer: "Chuyển khoản",
  cod: "Thanh toán khi nhận hàng",
  vnpay: "VNPay",
  momo: "MoMo",
  zalopay: "ZaloPay",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatDate(value?: string | Date) {
  const date = value ? new Date(value) : new Date()
  return date.toLocaleString("vi-VN")
}

function buildReceiptHtml(input: StaffReceiptInput) {
  const branch = input.staff?.branch
  const branchName = branch?.name || "GuitarHub"
  const branchAddress = branch?.address || "Chi nhánh GuitarHub"
  const branchCode = branch?.code ? ` (${branch.code})` : ""
  const staffName = input.staff?.fullName || "Nhân viên"
  const discountAmount = input.discountAmount || 0
  const shippingFee = input.shippingFee || 0

  const itemsHtml = input.items
    .map(
      (item) => `
        <tr>
          <td>
            <div class="item-name">${escapeHtml(item.name)}</div>
            ${item.sku ? `<div class="item-meta">${escapeHtml(item.sku)}</div>` : ""}
            <div class="item-meta">${formatCurrency(item.unitPrice)} x ${item.quantity}</div>
          </td>
          <td class="right">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `
    )
    .join("")

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Hóa đơn ${escapeHtml(input.orderNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f3f4f6;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
    }
    .receipt {
      width: 80mm;
      min-height: 100vh;
      margin: 0 auto;
      background: #fff;
      padding: 16px;
    }
    .center { text-align: center; }
    .brand { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; }
    .muted { color: #6b7280; }
    .divider {
      border-top: 1px dashed #9ca3af;
      margin: 12px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin: 5px 0;
    }
    .row span:last-child { text-align: right; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      padding-bottom: 6px;
      color: #6b7280;
      font-weight: 600;
      text-align: left;
      border-bottom: 1px dashed #d1d5db;
    }
    td {
      padding: 8px 0;
      vertical-align: top;
      border-bottom: 1px dashed #e5e7eb;
    }
    .right { text-align: right; white-space: nowrap; }
    .item-name { font-weight: 600; }
    .item-meta { margin-top: 2px; color: #6b7280; font-size: 11px; }
    .total {
      font-size: 15px;
      font-weight: 700;
    }
    .thanks {
      margin-top: 14px;
      text-align: center;
      line-height: 1.5;
    }
    @media print {
      @page { size: 80mm auto; margin: 0; }
      body { background: #fff; }
      .receipt {
        width: 80mm;
        min-height: auto;
        margin: 0;
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <main class="receipt">
    <section class="center">
      <div class="brand">${escapeHtml(branchName)}${escapeHtml(branchCode)}</div>
      <div class="muted">${escapeHtml(branchAddress)}</div>
      <div class="muted">GuitarHub</div>
    </section>

    <div class="divider"></div>

    <section>
      <div class="row"><span>Mã đơn</span><strong>${escapeHtml(input.orderNumber)}</strong></div>
      <div class="row"><span>Ngày</span><span>${escapeHtml(formatDate(input.createdAt))}</span></div>
      <div class="row"><span>Thu ngân</span><span>${escapeHtml(staffName)}</span></div>
      ${
        input.customerName
          ? `<div class="row"><span>Khách hàng</span><span>${escapeHtml(input.customerName)}</span></div>`
          : ""
      }
      ${
        input.customerPhone
          ? `<div class="row"><span>SĐT</span><span>${escapeHtml(input.customerPhone)}</span></div>`
          : ""
      }
      ${
        input.customerAddress
          ? `<div class="row"><span>Địa chỉ</span><span>${escapeHtml(input.customerAddress)}</span></div>`
          : ""
      }
    </section>

    <div class="divider"></div>

    <table>
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th class="right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="divider"></div>

    <section>
      <div class="row"><span>Tạm tính</span><span>${formatCurrency(input.subtotal)}</span></div>
      ${
        discountAmount > 0
          ? `<div class="row"><span>Giảm giá</span><span>-${formatCurrency(discountAmount)}</span></div>`
          : ""
      }
      ${
        shippingFee > 0
          ? `<div class="row"><span>Phí giao hàng</span><span>${formatCurrency(shippingFee)}</span></div>`
          : ""
      }
      <div class="row total"><span>Tổng cộng</span><span>${formatCurrency(input.total)}</span></div>
      <div class="row"><span>Thanh toán</span><span>${escapeHtml(paymentMethodNames[input.paymentMethod] || input.paymentMethod)}</span></div>
    </section>

    ${
      input.customerNote
        ? `<div class="divider"></div><section><strong>Ghi chú</strong><div>${escapeHtml(input.customerNote)}</div></section>`
        : ""
    }

    <div class="divider"></div>
    <section class="thanks">
      <div>Cảm ơn quý khách!</div>
      <div class="muted">Hẹn gặp lại tại GuitarHub</div>
    </section>
  </main>
  <script>
    window.addEventListener("load", function () {
      window.focus();
      setTimeout(function () { window.print(); }, 150);
    });
  </script>
</body>
</html>`
}

export function printStaffReceipt(input: StaffReceiptInput) {
  const receiptWindow = window.open("", "_blank", "width=420,height=720")
  if (!receiptWindow) {
    window.alert("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup rồi thử lại.")
    return
  }

  receiptWindow.document.open()
  receiptWindow.document.write(buildReceiptHtml(input))
  receiptWindow.document.close()
}

export function printPosReceipt(input: {
  orderNumber: string
  items: OrderItem[]
  customerInfo: CustomerInfo
  paymentMethod: PaymentMethod
  total: number
  discountAmount: number
  staff?: StaffAuthUser | null
}) {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  printStaffReceipt({
    orderNumber: input.orderNumber,
    customerName: input.customerInfo.isWalkIn ? "Khách mua tại quầy" : input.customerInfo.name,
    customerPhone: input.customerInfo.isWalkIn ? undefined : input.customerInfo.phone,
    customerNote: input.customerInfo.note,
    items: input.items.map((item) => ({
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.price,
      lineTotal: item.product.price * item.quantity,
    })),
    subtotal,
    discountAmount: input.discountAmount,
    total: input.total,
    paymentMethod: input.paymentMethod,
    staff: input.staff,
  })
}

export function printOrderReceipt(order: StaffOrder, staff?: StaffAuthUser | null) {
  const shippingInfo = order.shippingInfo
  const customerAddress =
    shippingInfo?.displayName ||
    [shippingInfo?.detailAddress, shippingInfo?.ward, shippingInfo?.district, shippingInfo?.province]
      .filter(Boolean)
      .join(", ")

  printStaffReceipt({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: shippingInfo?.recipientName || order.customer,
    customerPhone: shippingInfo?.phone || order.phone,
    customerAddress,
    customerNote: order.note,
    items: order.lineItems.map((item) => ({
      name: item.productName,
      sku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    staff,
  })
}
