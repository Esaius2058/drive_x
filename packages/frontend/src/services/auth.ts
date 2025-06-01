const api = import.meta.env.VITE_BACKEND_API_URL;

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${api}log-in`, {
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
  const res = await fetch(`${api}sign-up`, {
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
  localStorage.setItem("token", data.session.access_token);

  return data.user;
}

export async function fetchUserProfile() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Unauthorized! No token provided.");
  }

  try {
    const res = await fetch(`${api}profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await res.json();

    if (!data) {
      throw new Error("No data received from server");
    }

    console.log("User Files(fetchUserProfile)", data);
    return data;
  } catch (err) {
    console.error("Error fetching user files:", err);
    throw err;
  }
}

export async function deleteUserProfile() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${api}profile/delete`, {
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

export async function logoutUser(){
  const token = localStorage.getItem("token");

  try{
    const res = await fetch(`${api}log-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Internal Server Error. Logout failed");

  return data;
  }catch(error){
    console.error("Logout Failed ", error);
    throw error;
  }
}