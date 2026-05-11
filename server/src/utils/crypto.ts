import CryptoJS from "crypto-js";

const getFrontendSecret = () =>
  process.env.FRONTEND_SECRET_KEY ?? "frontend_secret_key";

const getBackendSecret = () =>
  process.env.BACKEND_SECRET_KEY ?? "backend_secret_key";

const getUtf8Value = (
  getValue: () => string,
  label: string,
  invalidSecretMessage: string,
) => {
  let value = "";

  try {
    value = getValue();
  } catch {
    throw new Error(`Unable to decrypt ${label}. Check the configured keys.`);
  }

  if (!value) {
    throw new Error(invalidSecretMessage);
  }

  return value;
};

export const encryptClientLayer = (data: unknown) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), getFrontendSecret()).toString();

export const encryptClientValue = (value: string) =>
  CryptoJS.AES.encrypt(value, getFrontendSecret()).toString();

export const decryptClientLayer = <T>(cipherText: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, getFrontendSecret());
  const utf8Value = getUtf8Value(
    () => bytes.toString(CryptoJS.enc.Utf8),
    "client payload",
    "Unable to decrypt client payload. Check the configured keys.",
  );

  return JSON.parse(utf8Value) as T;
};

export const decryptClientValue = (cipherText: string, label: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, getFrontendSecret());

  return getUtf8Value(
    () => bytes.toString(CryptoJS.enc.Utf8),
    label,
    `Unable to decrypt ${label}. Check the configured keys.`,
  );
};

export const encryptServerLayer = (data: string) =>
  CryptoJS.AES.encrypt(data, getBackendSecret()).toString();

export const encryptServerValue = (value: string) =>
  CryptoJS.AES.encrypt(value, getBackendSecret()).toString();

export const decryptServerLayer = (cipherText: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, getBackendSecret());

  return getUtf8Value(
    () => bytes.toString(CryptoJS.enc.Utf8),
    "database payload",
    "Unable to decrypt database payload. Check the configured keys.",
  );
};

export const decryptServerValue = (cipherText: string, label: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, getBackendSecret());

  return getUtf8Value(
    () => bytes.toString(CryptoJS.enc.Utf8),
    label,
    `Unable to decrypt ${label}. Check the configured keys.`,
  );
};

export const buildEmailIndex = (email: string) =>
  CryptoJS.SHA256(email.trim().toLowerCase()).toString();
