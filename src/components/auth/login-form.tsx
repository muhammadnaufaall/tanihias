"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { FormError, toFieldErrors } from "@/components/form/form-message";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/validation";

export function LoginForm({ next }: { next?: string | null }) {
  const [state, formAction, isPending] = useActionState(login, initialFormState);

  return (
    <form key={state.attempt} action={formAction} noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <FieldGroup>
        <FormError message={state.message} />
        <Field data-invalid={Boolean(state.errors?.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(state.errors?.email)}
            className="h-10"
          />
          <FieldError errors={toFieldErrors(state.errors?.email)} />
        </Field>
        <Field data-invalid={Boolean(state.errors?.password)}>
          <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(state.errors?.password)}
            className="h-10"
          />
          <FieldError errors={toFieldErrors(state.errors?.password)} />
        </Field>
        <Button type="submit" size="lg" disabled={isPending} className="h-11 w-full text-base">
          {isPending ? "Memeriksa…" : "Masuk"}
        </Button>
      </FieldGroup>
    </form>
  );
}
