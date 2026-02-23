
import { api } from "./api";

export async function listAnnouncements() {
    const { data } = await api.get("/announcements");
    return data.data || [];
}

export async function getAnnouncement(id) {
    try {
        const { data } = await api.get(`/announcements/${id}`);
        return data.data || null;
    } catch {
        return null;
    }
}

export async function createAnnouncement(payload) {
    const { data } = await api.post("/announcements", payload);
    return data.data;
}

export async function updateAnnouncement(id, patch) {
    const { data } = await api.put(`/announcements/${id}`, patch);
    return data.data;
}

export async function deleteAnnouncement(id) {
    await api.delete(`/announcements/${id}`);
}

export async function resetAnnouncements() {
    const { data } = await api.post("/announcements/reset");
    return data.data;
}
