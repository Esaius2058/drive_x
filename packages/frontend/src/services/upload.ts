export async function uploadSingleFile(formData: any) {
    const res = await fetch("http://localhost:3000/api/file/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!res.ok)
        throw new Error(data.message || "Internal Server Error.Upload failed");

    return data;
}