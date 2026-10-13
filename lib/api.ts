const apiBase = (import.meta.env.VITE_API_BASE || "https://47-251-2-71.sslip.io").replace(/\/$/, "");

export const siteBase = import.meta.env.BASE_URL;
export const apiUrl = (path: string) => `${apiBase}${path}`;
