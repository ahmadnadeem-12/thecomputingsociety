
import { api } from "./api";

export async function listFaculty() {
  const { data } = await api.get("/faculty");
  return data.data || [];
}

export async function createFaculty(payload) {
  const { data } = await api.post("/faculty", payload);
  return data.data;
}

export async function updateFaculty(id, patch) {
  const { data } = await api.put(`/faculty/${id}`, patch);
  return data.data;
}

export async function deleteFaculty(id) {
  await api.delete(`/faculty/${id}`);
}

export async function reorderFaculty(ids) {
  const { data } = await api.put("/faculty/reorder", { ids });
  return data.data;
}
