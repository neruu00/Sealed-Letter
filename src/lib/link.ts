// The image URL is stored in the link itself (base64url), so no database is needed.

export function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function encodeImageUrl(url: string): string {
  const bytes = new TextEncoder().encode(url);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeImageUrl(id: string): string | null {
  try {
    let base64 = decodeURIComponent(id).replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const url = new TextDecoder().decode(bytes);
    return isValidImageUrl(url) ? url : null;
  } catch {
    return null;
  }
}
