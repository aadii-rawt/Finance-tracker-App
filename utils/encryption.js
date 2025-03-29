
import CryptoJS from "crypto-js";

// Secret key (Store in .env for security)

// const SECRET_KEY = "34w5drtfyugbhj78iugj"; // Change this in production
const SECRET_KEY = "/gOryAWJ4iFgzuuFok71E492Uyb+PVNMql+qYaH1LpYjvhd6WFu4OZmE9KSZDQhD"

// Recursive Encrypt Function
export const encryptData = (data) => {
  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } else if (Array.isArray(data)) {
    return data.map((item) => encryptData(item)); // Encrypt each element in array
  } else if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, encryptData(value)])
    );
  }
  return data;
};

// Recursive Decrypt Function
export const decryptData = (data) => {
  if (typeof data === "string") {
    try {
      const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      return data; // Return as is if decryption fails (might not be encrypted)
    }
  } else if (Array.isArray(data)) {
    return data.map((item) => decryptData(item)); // Decrypt each element in array
  } else if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, decryptData(value)])
    );
  }
  return data;
};
