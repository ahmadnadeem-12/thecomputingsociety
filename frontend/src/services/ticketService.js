
import { api } from "./api";

export async function listTickets() {
  try {
    const { data } = await api.get("/tickets");
    return data.data || [];
  } catch {
    return [];
  }
}

export async function createTicket({ userId, eventId, programId, name, agNo, email, department, semester }) {
  const { data } = await api.post("/tickets", {
    eventId,
    programId,
    name,
    agNo,
    email,
    department,
    semester,
  });
  return data.data;
}

export async function setCheckedIn(ticketId, checkedIn) {
  const { data } = await api.put(`/tickets/${ticketId}/checkin`, { checkedIn });
  return data.data;
}

export async function setTicketCheckedIn(ticketId, checkedIn) {
  return setCheckedIn(ticketId, checkedIn);
}

export async function deleteTicket(ticketId) {
  try {
    await api.delete(`/tickets/${ticketId}`);
    return true;
  } catch {
    return false;
  }
}

export async function deleteTicketByAgNo(agNo, targetId) {
  try {
    await api.delete(`/tickets/by-ag/${encodeURIComponent(agNo)}/${targetId}`);
    return true;
  } catch {
    return false;
  }
}

export async function findTicketByQrCode(qrCode) {
  const { data } = await api.post("/tickets/qr-checkin", { qrCode });
  return {
    found: data.success || (data.ticket !== null),
    ticket: data.ticket,
    alreadyCheckedIn: !data.isNewCheckIn && data.ticket?.checkedIn,
  };
}

export async function checkInByQrCode(qrCode) {
  const { data } = await api.post("/tickets/qr-checkin", { qrCode });
  return {
    success: data.success,
    message: data.message,
    ticket: data.ticket,
    isNewCheckIn: data.isNewCheckIn,
  };
}
