export async function loginUser(email: string, password: string) {
  const res = await fetch("http://localhost:3000/api/log-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Login failed");

  // Save the token
  localStorage.setItem("token", data.session.access_token);

  return data.user;
}

export async function signUpUser(
  firstname: string,
  lastname: string,
  email: string,
  password: string
) {
  const res = await fetch("http://localhost:3000/api/sign-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstname, lastname, email, password }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Sign up failed");

  // Save the token
  localStorage.setItem("token", data.token);

  return data.user;
}

export async function deleteUserProfile() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/profile/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Delete failed");

  return data;
}