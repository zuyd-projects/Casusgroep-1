// Simple JWT decoder utility
export const decodeJWT = (token) => {
  if (!token) return null;

  try {
    // JWT tokens have three parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if needed
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Decode base64
    const decoded = atob(paddedPayload);

    // Parse JSON
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const getCurrentUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    email: decoded.email,
    name: decoded.given_name,
    role: decoded.role,
    // Look for user ID in various possible claims
    userId: decoded.sub || decoded.nameid || decoded.user_id || decoded.id,
  };
};
