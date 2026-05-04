// Parse JWT payload without external dependencies
export const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      decodeURIComponent(
        atob(payload)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    return decoded;
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
};

// Check if token is valid (not expired)
export const isTokenValid = (token) => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() < expirationTime;
};
