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

//////
////////Auth ApiCalls
//////
const login = async ({
  userId,
  password,
}: {
  userId: string;
  password: string;
}) => {
  return await axios.post(
    publicApi + "/login",
    {
      userId,
      password,
    },
    {
      withCredentials: true,
    },
  );
};

const logout = async () => {
  return await axios.post(publicApi + "/logout", {}, { withCredentials: true });
};

const user = async (cookie: string) => {
  return await axios.get(privateApi + "/user", {
    withCredentials: true,
    headers: {
      Cookie: cookie || "",
    },
  });
};

const changePassword = async (
  old_password: string,
  new_password: string,
  confirmed_password: string,
): Promise<AxiosResponse> => {
  return await axios.post(
    privateApi + "/change_password",
    {
      old_password,
      new_password,
      confirmed_password,
    },
    { withCredentials: true },
  );
};

const getUserDetails = async (): Promise<AxiosResponse> => {
  return await axios.get(privateApi + "/user_details", {
    withCredentials: true,
  });
};

//////
////////Client ApiCalls
//////
const getPendingClients = async (
  take = 20,
  skip = 0,
  search = "",
): Promise<AxiosResponse> => {
  return await axios.get(`${privateApi}/client/get_pending_clients`, {
    params: {
      take,
      skip,
      search,
    },
    withCredentials: true,
  });
};

const rejectClient = async (clientCode: string): Promise<AxiosResponse> => {
  return await axios.patch(
    `${privateApi}/client/reject_client`,
    {
      client_code: clientCode,
    },
    {
      withCredentials: true,
    },
  );
};

const acceptClient = async (clientCode: string): Promise<AxiosResponse> => {
  return await axios.patch(
    `${privateApi}/client/accept_client`,
    {
      client_code: clientCode,
    },
    {
      withCredentials: true,
    },
  );
};

export {
  publicApi,
  privateApi,
  //Auth
  login,
  logout,
  user,
  changePassword,
  getUserDetails,
  //Client
  getPendingClients,
  rejectClient,
  acceptClient,
};
