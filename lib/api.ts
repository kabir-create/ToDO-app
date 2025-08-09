const API_URL = process.env.NEXT_PUBLIC_API_URL;
export async function getBoards() {
  const token = localStorage.getItem("token"); // Make sure token is stored at login/register

  const res = await fetch("/api/boards", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ required for auth
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch boards");
  }

  return res.json();
}
