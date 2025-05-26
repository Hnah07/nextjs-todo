"use client";

import React from "react";
import { Button } from "./components/ui/button";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className="rounded-full w-10 h-10"
      disabled={pending}
    >
      {pending ? "..." : "+"}
    </Button>
  );
}
