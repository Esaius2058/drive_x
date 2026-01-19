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
    const isJson = contentType?.includes("application/json");

    if (!res.ok) {
      // 1. Get the error body
      const errorBody = isJson ? await res.json() : { message: await res.text() };
      // 2. Create the error object
      const error = new Error(errorBody.message || "Unknown error");
      // 3. IMPORTANT: Attach the HTTP status code directly from the response
      (error as any).status = res.status;      
      // 4. Attach other metadata if available
      (error as any).type = errorBody.type;
      (error as any).details = errorBody.error; 

      throw error;
    }

    const data = await res.json();

    // Save the token
    localStorage.setItem("token", data.session.access_token);

    return data.user;
  } catch (error: any) {
    const isNetworkError = 
      error.name === "TypeError" && 
      (error.message.includes("NetworkError") || error.message.includes("Failed to fetch"));

    if (isNetworkError) {
      // Manually attach status 503 so the UI knows the DB/Server is down
      error.status = 503;
      error.message = "Database service unavailable";
    }

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
    const isJson = contentType?.includes("application/json");

    if (!res.ok) {
      // 1. Get the error body
      const errorBody = isJson ? await res.json() : { message: await res.text() };   
      // 2. Create the error object
      const error = new Error(errorBody.message || "Unknown error");
      // 3. IMPORTANT: Attach the HTTP status code directly from the response
      (error as any).status = res.status;      
      // 4. Attach other metadata if available
      (error as any).type = errorBody.type;
      (error as any).details = errorBody.error; 

      throw error;
    }
    
    const data = await res.json();

    // Save the token
    localStorage.setItem("token", data.session.access_token);

    let user = data.user;
    let session = data.session;
    return {user, session};
  } catch (error: any) {
    const isNetworkError = 
      error.name === "TypeError" && 
      (error.message.includes("NetworkError") || error.message.includes("Failed to fetch"));

    if (isNetworkError) {
      // Manually attach status 503 so the UI knows the DB/Server is down
      error.status = 503;
      error.message = "Database service unavailable";
    }

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
    
    return data;
  } catch (err) {
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
