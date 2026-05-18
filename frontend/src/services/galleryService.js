
import { api } from "./api";

export async function listGalleryAlbums(full = false) {
    const { data } = await api.get(`/gallery${full ? "?full=true" : ""}`);
    return data.data || [];
}

export async function getAlbum(id) {
    try {
        const { data } = await api.get(`/gallery/${id}`);
        return data.data || null;
    } catch {
        return null;
    }
}

export async function createAlbum(payload) {
    const { data } = await api.post("/gallery", payload);
    return data.data;
}

export async function updateAlbum(id, patch) {
    const { data } = await api.put(`/gallery/${id}`, patch);
    return data.data;
}

export async function deleteAlbum(id) {
    await api.delete(`/gallery/${id}`);
}

export async function addImageToAlbum(albumId, imageUrl) {
    const { data } = await api.post(`/gallery/${albumId}/images`, { imageUrl });
    return data.data;
}

export async function removeImageFromAlbum(albumId, imageUrl) {
    await api.delete(`/gallery/${albumId}/images`, { data: { imageUrl } });
}

export async function resetGallery() {
    // No reset endpoint needed — gallery is seeded from backend
    return listGalleryAlbums();
}
