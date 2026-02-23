
import { api } from "./api";

export async function listPrograms() {
    const { data } = await api.get("/programs");
    return data.data || [];
}

export async function getProgram(id) {
    try {
        const { data } = await api.get(`/programs/${id}`);
        return data.data || null;
    } catch {
        return null;
    }
}

export async function createProgram(payload) {
    const { data } = await api.post("/programs", payload);
    return data.data;
}

export async function updateProgram(id, patch) {
    const { data } = await api.put(`/programs/${id}`, patch);
    return data.data;
}

export async function deleteProgram(id) {
    await api.delete(`/programs/${id}`);
}

export async function resetPrograms() {
    const { data } = await api.post("/programs/reset");
    return data.data;
}
