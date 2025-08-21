import { useEffect } from "react";
import { api } from "../api/axios";
import { useAuth } from "../store/auth";

export const useAxiosPrivate = () => {
  const { accessToken, setAuth, clear } = useAuth();

  useEffect(() => {
    const req = api.interceptors.request.use((config) => {
      if (accessToken && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    });

    const res = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prev: any = error?.config;
        if (error?.response?.status === 401 && !prev?._retry) {
          prev._retry = true;
          try {
            const { data } = await api.post("/auth/refresh");
            setAuth(data.user, data.accessToken, data.expiresAt);
            prev.headers["Authorization"] = `Bearer ${data.accessToken}`;
            return api(prev);
          } catch {
            clear();
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(req);
      api.interceptors.response.eject(res);
    };
  }, [accessToken, setAuth, clear]);

  return api;
};
