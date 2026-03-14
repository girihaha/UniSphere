import { api } from "../lib/api";
import { User } from "../types";

export async function getAllUsers(): Promise<User[]> {
  try {
    const res = await api.get<{ data: User[] }>("/users/admin/all");
    return res.data;
  } catch (err) {
    console.error("getAllUsers failed", err);
    return [];
  }
}

export async function updateUserRole(
  userId: string,
  role: "student" | "club_admin" | "super_admin"
): Promise<boolean> {
  try {
    await api.patch(`/users/admin/${userId}/role`, { role });
    return true;
  } catch (err) {
    console.error("updateUserRole failed", err);
    return false;
  }
}