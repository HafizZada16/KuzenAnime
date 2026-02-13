export const BASE_URL = "https://api.kanata.web.id/otakudesu";

export async function fetchData(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}
