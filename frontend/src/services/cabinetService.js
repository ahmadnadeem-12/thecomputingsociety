
import { api } from "./api";

export async function listCabinet() {
  const { data } = await api.get("/cabinet");
  return data.data || [];
}

export async function createCabinetMember(payload) {
  const { data } = await api.post("/cabinet", payload);
  return data.data;
}

export async function updateCabinetMember(id, patch) {
  const { data } = await api.put(`/cabinet/${id}`, patch);
  return data.data;
}

export async function deleteCabinetMember(id) {
  await api.delete(`/cabinet/${id}`);
}

export async function reorderCabinet(ids) {
  const { data } = await api.put("/cabinet/reorder", { ids });
  return data.data;
}
