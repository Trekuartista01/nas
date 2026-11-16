"use client"; // Error boundaries must be Client Components

import ErrorPage from "@/components/pages/ErrorPage";

export default function ErrorBoundary(props: { error: unknown; retry: () => void }) {
  return <ErrorPage {...props} />;
}
