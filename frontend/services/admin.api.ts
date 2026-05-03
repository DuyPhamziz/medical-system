import apiClient from "@/lib/axios";
import { Role, UserProfile } from "@/types/user";

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  role: Role;
};

export type AssignRolePayload = {
  userId: string;
  role: Role;
};

export async function getUsers(): Promise<UserProfile[]> {
  const { data } = await apiClient.get<UserProfile[]>("/admin/users");
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<UserProfile> {
  const { data } = await apiClient.post<UserProfile>("/admin/create-user", payload);
  return data;
}

export async function assignRole(payload: AssignRolePayload): Promise<UserProfile> {
  const { data } = await apiClient.post<UserProfile>("/admin/assign-role", payload);
  return data;
}
