import api from "./api";

/**
 * Initiate a JazzCash payment for a paid event
 */
export async function initiatePayment({ eventId, name, email, agNo, department, semester }) {
    const res = await api.post("/payments/initiate", {
        eventId,
        name,
        email,
        agNo,
        department,
        semester,
    });
    return res.data;
}

/**
 * Check payment order status
 */
export async function getPaymentStatus(orderId) {
    const res = await api.get(`/payments/status/${orderId}`);
    return res.data;
}

/**
 * Get current user's paid tickets
 */
export async function getMyPaidTickets() {
    const res = await api.get("/payments/my-paid-tickets");
    return res.data?.data || [];
}

/**
 * Verify a paid ticket (admin only)
 */
export async function verifyPaidTicket(ticketId) {
    const res = await api.post(`/payments/verify-ticket/${ticketId}`);
    return res.data;
}

// ---- Analytics (Admin) ----

export async function getAnalyticsOverview() {
    const res = await api.get("/analytics/overview");
    return res.data?.data || {};
}

export async function getEventAnalytics(eventId) {
    const res = await api.get(`/analytics/event/${eventId}`);
    return res.data?.data || {};
}

export async function getDailyRevenue(days = 30) {
    const res = await api.get(`/analytics/daily-revenue?days=${days}`);
    return res.data?.data || [];
}

export async function getPaidUsers(eventId) {
    const res = await api.get(`/analytics/paid-users/${eventId}`);
    return res.data?.data || [];
}

export async function getExpiredOrders() {
    const res = await api.get("/analytics/expired-orders");
    return res.data?.data || [];
}
