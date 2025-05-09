export async function uploadSingleFile(formData: any) {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/file/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  // First check content type
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text.slice(0, 100)}...`);
  }
  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Upload failed");

  return data;
}