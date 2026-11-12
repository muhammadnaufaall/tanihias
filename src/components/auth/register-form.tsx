"use client";

import { useActionState } from "react";
import { Sprout, ShoppingBasket } from "lucide-react";
import { register } from "@/actions/auth";
import { FormError, FormSuccess, toFieldErrors } from "@/components/form/form-message";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { initialFormState } from "@/lib/validation";

const roleOptions = [
  { value: "buyer", title: "Pembeli", description: "Cari tanaman dan chat petani", icon: ShoppingBasket },
  { value: "farmer", title: "Petani", description: "Jual tanaman dari kebun", icon: Sprout },
];

export function RegisterForm({ next }: { next?: string | null }) {
  const [state, formAction, isPending] = useActionState(register, initialFormState);
  const errors = state.errors;

  return (
    <form key={state.attempt} action={formAction} noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <FieldGroup>
        {state.success ? <FormSuccess message={state.message} /> : <FormError message={state.message} />}

        <FieldSet data-invalid={Boolean(errors?.role)}>
          <FieldLegend variant="label">Daftar sebagai</FieldLegend>
          <RadioGroup name="role" defaultValue={state.values?.role ?? "buyer"} className="grid grid-cols-2 gap-3">
            {roleOptions.map((option) => (
              <FieldLabel key={option.value} htmlFor={`role-${option.value}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>
                      <option.icon aria-hidden className="size-4 text-primary" />
                      {option.title}
                    </FieldTitle>
                    <FieldDescription className="text-xs">{option.description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={option.value} id={`role-${option.value}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <FieldError errors={toFieldErrors(errors?.role)} />
        </FieldSet>

        <Field data-invalid={Boolean(errors?.name)}>
          <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
          <Input id="name" name="name" autoComplete="name" defaultValue={state.values?.name} aria-invalid={Boolean(errors?.name)} className="h-10" />
          <FieldError errors={toFieldErrors(errors?.name)} />
        </Field>

        <Field data-invalid={Boolean(errors?.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} aria-invalid={Boolean(errors?.email)} className="h-10" />
          <FieldError errors={toFieldErrors(errors?.email)} />
        </Field>

        <Field data-invalid={Boolean(errors?.password)}>
          <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors?.password)} className="h-10" />
          <FieldDescription>Minimal 8 karakter.</FieldDescription>
          <FieldError errors={toFieldErrors(errors?.password)} />
        </Field>

        <Button type="submit" size="lg" disabled={isPending} className="h-11 w-full text-base">
          {isPending ? "Membuat akun…" : "Buat akun"}
        </Button>
      </FieldGroup>
    </form>
  );
}
