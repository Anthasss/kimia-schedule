const JSON_HEADERS = { "Content-Type": "application/json" };

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    headers: JSON_HEADERS,
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}
