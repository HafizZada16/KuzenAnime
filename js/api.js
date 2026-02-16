import { ANIME_API } from "./config.js";

export async function fetchData(endpoint, options = {}) {
  try {
    const res = await fetch(`${ANIME_API}${endpoint}`, options);
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}
