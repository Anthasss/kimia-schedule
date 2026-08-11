const JSON_HEADERS = { "Content-Type": "application/json" };

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error) return String(body.error);
  } catch {
    // not json
  }
  return fallback;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: JSON_HEADERS });
  if (!res.ok) throw new Error(await errorMessage(res, `GET ${path} failed: ${res.status}`));
  return res.json();
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorMessage(res, `POST ${path} failed: ${res.status}`));
  return res.json();
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorMessage(res, `PUT ${path} failed: ${res.status}`));
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    headers: JSON_HEADERS,
  });
  if (!res.ok) throw new Error(await errorMessage(res, `DELETE ${path} failed: ${res.status}`));
  return res.json();
}
