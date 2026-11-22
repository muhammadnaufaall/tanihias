import type { Role } from "@/lib/types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number) {
  return rupiah.format(value);
}

export function formatPriceRange(min: number, max: number) {
  if (min === max) return formatRupiah(min);
  return `${formatRupiah(min)} – ${formatRupiah(max)}`;
}

function abbreviate(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`;
  }
  return String(value);
}

export function formatPriceTag(min: number, max: number) {
  if (min === max) return abbreviate(min);
  return `${abbreviate(min)}–${abbreviate(max)}`;
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function toInternationalNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(phone: string, message: string) {
  return `https://wa.me/${toInternationalNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export const ROLE_LABELS: Record<Role, string> = {
  buyer: "Pembeli",
  farmer: "Petani",
  admin: "Admin",
};
