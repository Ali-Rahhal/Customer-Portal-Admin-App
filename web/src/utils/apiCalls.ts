import axios, { AxiosResponse } from "axios";

const isServer = typeof window === "undefined";
let API_BASE_URL = "";
if (isServer) {
  API_BASE_URL =
    process.env.NEXT_PUBLIC_API_SERVER_URL ||
    `http://localhost:${process.env.NEXT_PUBLIC_DIRECT_API_PORT}/api`;
} else {
  const { protocol, hostname } = window.location;

  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.");

  if (isLocal) {
    // Direct/internal access
    API_BASE_URL = `${protocol}//${hostname}:${process.env.NEXT_PUBLIC_DIRECT_API_PORT}/api`;
  } else {
    // Domain/nginx access
    API_BASE_URL = process.env.NEXT_PUBLIC_API_BROWSER_URL || "/api";
  }
}
const publicApi = API_BASE_URL;
const privateApi = `${API_BASE_URL}/auth`;

export {};
