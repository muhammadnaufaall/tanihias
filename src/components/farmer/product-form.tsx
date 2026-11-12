"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { saveProduct } from "@/actions/farmer";
import { FormError, toFieldErrors } from "@/components/form/form-message";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PlantType, Product, ProductPhoto, ProductWithDetails } from "@/lib/types";
import { PHOTO_ALLOWED_TYPES, PHOTO_MAX_COUNT, PHOTO_MAX_SIZE, initialFormState } from "@/lib/validation";

type Props = {
  plantTypes: PlantType[];
  product?: ProductWithDetails;
};

// Wireframe Figure 3.12: product data on the left, description and photos on the right
export function ProductForm({ plantTypes, product }: Props) {
  const [state, formAction, isPending] = useActionState(saveProduct, initialFormState);
  const errors = state.errors;

  // Initial value: the last submitted input, then the product data, then empty
  const initial = (field: keyof Product) =>
    state.values?.[field] ?? (product ? String(product[field]) : undefined);
  const isAvailable = state.values
    ? state.values.is_available === "on"
    : (product?.is_available ?? true);

  return (
    <form key={state.attempt} action={formAction} noValidate className="flex flex-col gap-6 rounded-xl border bg-card p-5 sm:p-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <FormError message={state.message} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Field data-invalid={Boolean(errors?.name)}>
            <FieldLabel htmlFor="name">Nama produk</FieldLabel>
            <Input id="name" name="name" defaultValue={initial("name")} placeholder="Contoh: Anggrek bulan putih" aria-invalid={Boolean(errors?.name)} className="h-10" />
            <FieldError errors={toFieldErrors(errors?.name)} />
          </Field>

          <Field data-invalid={Boolean(errors?.plant_type_id)}>
            <FieldLabel htmlFor="plant_type_id">Jenis tanaman</FieldLabel>
            <NativeSelect
              id="plant_type_id"
              name="plant_type_id"
              defaultValue={initial("plant_type_id") ?? ""}
              aria-invalid={Boolean(errors?.plant_type_id)}
              className="w-full [&_select]:h-10"
            >
              <NativeSelectOption value="" disabled>
                Pilih jenis tanaman
              </NativeSelectOption>
              {plantTypes.map((t) => (
                <NativeSelectOption key={t.id} value={t.id}>
                  {t.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={toFieldErrors(errors?.plant_type_id)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={Boolean(errors?.min_price)}>
              <FieldLabel htmlFor="min_price">Harga minimum (Rp)</FieldLabel>
              <Input id="min_price" name="min_price" type="number" inputMode="numeric" min={1} defaultValue={initial("min_price")} placeholder="15000" aria-invalid={Boolean(errors?.min_price)} className="h-10" />
              <FieldError errors={toFieldErrors(errors?.min_price)} />
            </Field>
            <Field data-invalid={Boolean(errors?.max_price)}>
              <FieldLabel htmlFor="max_price">Harga maksimum (Rp)</FieldLabel>
              <Input id="max_price" name="max_price" type="number" inputMode="numeric" min={1} defaultValue={initial("max_price")} placeholder="25000" aria-invalid={Boolean(errors?.max_price)} className="h-10" />
              <FieldError errors={toFieldErrors(errors?.max_price)} />
            </Field>
          </div>
          <FieldDescription className="-mt-3">
            Isi harga yang sama di kedua kolom jika harganya tetap.
          </FieldDescription>

          <Field orientation="horizontal" className="rounded-lg border p-3">
            <Switch id="is_available" name="is_available" defaultChecked={isAvailable} />
            <FieldLabel htmlFor="is_available" className="flex-col items-start gap-0.5">
              Stok tersedia
              <span className="text-xs font-normal text-muted-foreground">Matikan jika sedang kosong atau belum panen.</span>
            </FieldLabel>
          </Field>
        </div>

        <div className="flex flex-col gap-5">
          <Field data-invalid={Boolean(errors?.description)}>
            <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={initial("description")}
              placeholder="Ukuran, isi per ikat atau pot, dan cara merawatnya."
              aria-invalid={Boolean(errors?.description)}
            />
            <FieldError errors={toFieldErrors(errors?.description)} />
          </Field>

          <PhotoUpload existingPhotos={product?.photos ?? []} serverErrors={errors?.photos} />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-5">
        <Button asChild variant="outline" size="lg">
          <Link href="/farmer">Batal</Link>
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Menyimpan…" : product ? "Simpan perubahan" : "Simpan produk"}
        </Button>
      </div>
    </form>
  );
}

// U09: checked in the browser for quick feedback, then checked again on the server.
// Photos picked while editing a product replace the existing ones.
function PhotoUpload({ existingPhotos, serverErrors }: { existingPhotos: ProductPhoto[]; serverErrors?: string[] }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPreviews([]);
    setError(null);

    const message =
      files.length > PHOTO_MAX_COUNT
        ? `Maksimal ${PHOTO_MAX_COUNT} foto per produk.`
        : files.some((f) => !PHOTO_ALLOWED_TYPES.includes(f.type))
          ? "Format foto harus JPG atau PNG."
          : files.some((f) => f.size > PHOTO_MAX_SIZE)
            ? "Ukuran setiap foto maksimal 2 MB."
            : null;
    if (message) {
      setError(message);
      e.target.value = "";
      return;
    }
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  const shown = previews.length > 0 ? previews : existingPhotos.map((p) => p.url);
  const shownError = error ?? serverErrors?.[0];

  return (
    <Field data-invalid={Boolean(shownError)}>
      <FieldLabel htmlFor="photos">Foto produk</FieldLabel>
      <label
        htmlFor="photos"
        className="relative flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed bg-muted/50 text-sm text-muted-foreground hover:border-primary hover:text-primary has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50"
      >
        {shown.length > 0 ? (
          <span className="grid size-full grid-cols-3 gap-1 p-1">
            {shown.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview / stored photo
              <img key={url} src={url} alt={`Foto produk ${i + 1}`} className="size-full rounded-md object-cover" />
            ))}
          </span>
        ) : (
          <>
            <ImagePlus aria-hidden className="size-7" />
            Pilih hingga {PHOTO_MAX_COUNT} foto JPG atau PNG, maksimal 2 MB per foto
          </>
        )}
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={handleChange}
          className="sr-only"
        />
      </label>
      {shownError ? (
        <FieldError>{shownError}</FieldError>
      ) : (
        <FieldDescription>
          {existingPhotos.length > 0
            ? "Memilih foto baru akan menggantikan foto yang sekarang."
            : "Foto pertama dipakai sebagai foto utama di katalog."}
        </FieldDescription>
      )}
    </Field>
  );
}
