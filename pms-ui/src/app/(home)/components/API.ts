export const loginUserAPI = async (email: string, password: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export const resetPasswordAPI = async (email: string, password: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/reset-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    // Send data as an object
    body: JSON.stringify({ 
      email: email,
      password: password 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to reset password");
  }

  const data = await response.json();
  return data;
}