export async function updatePassword(
  oldpassword: string,
  newpassword: string
) {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/profile/update/new-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldpassword, newpassword }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Update failed");

  return data;
}
