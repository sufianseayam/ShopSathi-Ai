const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function apiRequest(path, { body, headers, ...options } = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body && !isFormData ? { body: JSON.stringify(body) } : { body }),
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const details = data?.details?.map(({ field, message }) => `${field}: ${message}`).join(" ");
    throw new Error(details ? `${data.error || "Request failed"} — ${details}` : data?.error || `Request failed (${response.status}).`);
  }

  return data;
}

export function formatPrice(value) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(value || 0);
}
