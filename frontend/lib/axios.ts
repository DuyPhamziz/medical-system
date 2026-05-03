import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/store/auth.store";

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const apiClient = axios.create({
	baseURL: env.bffBaseUrl,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as RetryRequestConfig | undefined;

		if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
			return Promise.reject(error);
		}

		if (isRefreshing) {
			return new Promise(function (resolve, reject) {
				failedQueue.push({ resolve, reject });
			})
				.then(() => {
					return apiClient(originalRequest);
				})
				.catch((err) => {
					return Promise.reject(err);
				});
		}

		originalRequest._retry = true;
		isRefreshing = true;

		try {
			await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
			processQueue(null);
			return apiClient(originalRequest);
		} catch (refreshError) {
			processQueue(refreshError, null);
			useAuthStore.getState().clearSession();
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	},
);

export default apiClient;
