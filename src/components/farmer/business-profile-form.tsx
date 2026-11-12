"use client";

import { useActionState } from "react";
import { saveBusinessProfile } from "@/actions/farmer";
import { FormError, toFieldErrors } from "@/components/form/form-message";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSuccessToast } from "@/hooks/use-success-toast";
import type { BusinessProfile } from "@/lib/types";
import { initialFormState } from "@/lib/validation";

type ProfileField = "business_name" | "location" | "whatsapp_number";

export function BusinessProfileForm({ business }: { business: BusinessProfile }) {
  const [state, formAction, isPending] = useActionState(saveBusinessProfile, initialFormState);
  const errors = state.errors;
  useSuccessToast(state);

  const initial = (field: ProfileField) => state.values?.[field] ?? business[field];

  return (
    <form key={state.attempt} action={formAction} noValidate className="max-w-xl rounded-xl border bg-card p-5 sm:p-6">
      <FieldGroup>
        {!state.success && <FormError message={state.message} />}
        <Field data-invalid={Boolean(errors?.business_name)}>
          <FieldLabel htmlFor="business_name">Nama usaha</FieldLabel>
          <Input id="business_name" name="business_name" defaultValue={initial("business_name")} placeholder="Contoh: Kebun Krisan Mang Ujang" aria-invalid={Boolean(errors?.business_name)} className="h-10" />
          <FieldError errors={toFieldErrors(errors?.business_name)} />
        </Field>
        <Field data-invalid={Boolean(errors?.location)}>
          <FieldLabel htmlFor="location">Lokasi kebun</FieldLabel>
          <Input id="location" name="location" defaultValue={initial("location")} placeholder="Contoh: Kp. Pasirwangi, Cihideung" aria-invalid={Boolean(errors?.location)} className="h-10" />
          <FieldError errors={toFieldErrors(errors?.location)} />
        </Field>
        <Field data-invalid={Boolean(errors?.whatsapp_number)}>
          <FieldLabel htmlFor="whatsapp_number">Nomor WhatsApp</FieldLabel>
          <Input id="whatsapp_number" name="whatsapp_number" type="tel" inputMode="tel" defaultValue={initial("whatsapp_number")} placeholder="081234567890" aria-invalid={Boolean(errors?.whatsapp_number)} className="h-10" />
          <FieldDescription>Pembeli akan menghubungi kamu lewat nomor ini.</FieldDescription>
          <FieldError errors={toFieldErrors(errors?.whatsapp_number)} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Menyimpan…" : "Simpan profil"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
