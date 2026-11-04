const API_URL = "https://sislab-api.onrender.com";

export async function apiFetch(url, options = {}) {
  return fetch(url, options);
}

export default API_URL;