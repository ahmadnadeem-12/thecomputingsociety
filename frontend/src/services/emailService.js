/**
 * Email Service for TCS
 * Uses EmailJS to send emails from thecomputingsociety@gmail.com
 * 
 * Setup Required:
 * 1. Go to https://www.emailjs.com/ and create account
 * 2. Add Gmail service (thecomputingsociety@gmail.com)
 * 3. Create email template with variables: {{to_name}}, {{to_email}}, {{event_name}}, {{ticket_id}}, {{ag_no}}, {{department}}, {{semester}}, {{event_date}}, {{qr_code_url}}
 * 4. Get Service ID, Template ID, and Public Key
 * 5. Update the constants below
 */

import emailjs from '@emailjs/browser';

// ⚠️ IMPORTANT: Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_tcs';  // Get from EmailJS dashboard
const EMAILJS_TEMPLATE_ID = 'template_ticket';  // Get from EmailJS dashboard
const EMAILJS_PUBLIC_KEY = 'your_public_key';  // Get from EmailJS dashboard

/**
 * Send ticket confirmation email
 * @param {Object} ticketData - Ticket details
 * @param {string} qrCodeDataUrl - QR code as data URL (base64)
 * @returns {Promise<boolean>}
 */
export async function sendTicketEmail(ticketData, qrCodeDataUrl) {
    try {
        const templateParams = {
            to_name: ticketData.name,
            to_email: ticketData.email,
            event_name: ticketData.eventTitle,
            ticket_id: ticketData.publicTicketId,
            ag_no: ticketData.agNo,
            department: ticketData.department,
            semester: ticketData.semester,
            event_date: ticketData.eventDate,
            event_time: ticketData.eventTime,
            qr_code_url: qrCodeDataUrl,
            from_name: 'The Computing Society',
            reply_to: 'thecomputingsociety@gmail.com'
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );

        console.log('Email sent successfully:', response);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

/**
 * Initialize EmailJS (call once on app start)
 */
export function initEmailJS() {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}
