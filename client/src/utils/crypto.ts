import CryptoJS from "crypto-js";

const SECRET_KEY =
  import.meta.env.VITE_FRONTEND_SECRET_KEY ?? "frontend_secret_key";

export const encryptData = (data: unknown) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

export const decryptData = <T>(cipherText: string): T => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  const utf8Value = bytes.toString(CryptoJS.enc.Utf8);

  if (!utf8Value) {
    throw new Error(
      "Unable to decrypt the server response. Check the frontend secret key.",
    );
  }

  return JSON.parse(utf8Value) as T;
};
