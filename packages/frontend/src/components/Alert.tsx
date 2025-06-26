import * as React from "react";

function Alert({
  className = "",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "destructive" }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={`alert ${variant} ${className}`}
      {...props}
    />
  );
}

function AlertTitle({
  className = "",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={`alert-title ${className}`}
      {...props}
    />
  );
}

function AlertDescription({
  className = "",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={`alert-description ${className}`}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
