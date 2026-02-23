
import { api } from "./api";

export async function listDegrees() {
    const { data } = await api.get("/degrees");
    return data.data || [];
}

export async function getDegree(id) {
    try {
        const { data } = await api.get(`/degrees/${id}`);
        return data.data || null;
    } catch {
        return null;
    }
}

export async function createDegree(payload) {
    const { data } = await api.post("/degrees", payload);
    return data.data;
}

export async function updateDegree(id, patch) {
    const { data } = await api.put(`/degrees/${id}`, patch);
    return data.data;
}

export async function deleteDegree(id) {
    await api.delete(`/degrees/${id}`);
}

export async function resetDegrees() {
    const { data } = await api.post("/degrees/reset");
    return data.data;
}
