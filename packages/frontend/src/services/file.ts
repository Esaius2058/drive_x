const api =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : import.meta.env.VITE_BACKEND_API_URL;

export async function getFile(id: string) {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${api}/file/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Fetch failed");

  return data.signedUrl;
}

export async function updateFile(id: string, newName: string) {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${api}/file/update/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newName }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Fetch failed");

  return data.message;
}

export async function moveToTrash(id: string) {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${api}/file/delete/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(
      data.message || "Internal Server Error. Failed to add to trash."
    );

  return data.message;
}

export async function deleteFile(id: string) {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${api}/file/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Delete failed.");

  return data.message;
}
