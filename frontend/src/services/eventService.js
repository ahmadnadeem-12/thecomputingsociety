
import { api } from "./api";

export async function listEvents() {
  const { data } = await api.get("/events");
  return data.data || [];
}

export async function getEventById(id) {
  try {
    const { data } = await api.get(`/events/${id}`);
    return data.data || null;
  } catch {
    return null;
  }
}

export async function createEvent(payload) {
  const { data } = await api.post("/events", payload);
  return data.data;
}

export async function updateEvent(id, patch) {
  const { data } = await api.put(`/events/${id}`, patch);
  return data.data;
}

export async function deleteEvent(id) {
  await api.delete(`/events/${id}`);
  return true;
}
