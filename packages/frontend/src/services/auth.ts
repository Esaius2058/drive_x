const api =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : import.meta.env.VITE_BACKEND_API_URL;

export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${api}/log-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
    if (!contentType?.includes("application/json")) {
      const text = await res.text(); // See what's really returned
      console.error("Expected JSON, got:", text);
      return;
    }

    const data = await res.json();

    // Save the token
    localStorage.setItem("token", data.session.access_token);

    return data.user;
  } catch (error: any) {
    throw error;
  }
}

export async function signUpUser(
  firstname: string,
  lastname: string,
  email: string,
  password: string
) {
  try {
    const res = await fetch(`${api}/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstname, lastname, email, password }),
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
    if (!contentType?.includes("application/json")) {
      const text = await res.text(); // See what's really returned
      console.error("Expected JSON, got:", text);
      return;
    }

    const data = await res.json();

    // Save the token
    localStorage.setItem("token", data.session.access_token);

    return data.user;
  } catch (error: any) {
    console.log("Error ");
    throw error;
  }
}

export async function fetchUserProfile() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Unauthorized! No token provided.");
  }

  try {
    const res = await fetch(`${api}/profile`, {
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
  const res = await fetch(`${api}/profile/delete`, {
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

export async function logoutUser() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${api}/log-out`, {
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
  } catch (error) {
    console.error("Logout Failed ", error);
    throw error;
  }
}
