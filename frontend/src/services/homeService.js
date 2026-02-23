
import { api } from "./api";

export async function getHomeContent() {
    const { data } = await api.get("/home");
    return data.data || {};
}

export async function saveHomeContent(content) {
    const { data } = await api.put("/home", content);
    return data.data;
}

export async function resetHomeContent() {
    const { data } = await api.post("/home/reset");
    return data.data;
}
