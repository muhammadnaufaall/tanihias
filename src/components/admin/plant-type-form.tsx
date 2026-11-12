"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addPlantType } from "@/actions/admin";
import { toFieldErrors } from "@/components/form/form-message";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSuccessToast } from "@/hooks/use-success-toast";
import { initialFormState } from "@/lib/validation";

export function PlantTypeForm() {
  const [state, formAction, isPending] = useActionState(addPlantType, initialFormState);
  useSuccessToast(state);

  return (
    <form key={state.attempt} action={formAction} noValidate className="rounded-xl border bg-card p-4">
      <Field data-invalid={Boolean(state.errors?.name)}>
        <FieldLabel htmlFor="name">Tambah jenis tanaman</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="name"
            name="name"
            defaultValue={state.values?.name}
            placeholder="Contoh: Bonsai"
            aria-invalid={Boolean(state.errors?.name)}
            className="h-10 max-w-sm"
          />
          <Button type="submit" size="lg" disabled={isPending} className="h-10">
            <Plus aria-hidden />
            Tambah
          </Button>
        </div>
        <FieldError errors={toFieldErrors(state.errors?.name)} />
      </Field>
    </form>
  );
}
