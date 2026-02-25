/**
 * ============================================
 * JazzCash Payment Service
 * ============================================
 * Handles HMAC signature generation, payment form data,
 * and webhook signature verification.
 * ============================================
 */

const crypto = require("crypto");

// JazzCash configuration from environment
const getConfig = () => ({
    merchantId: process.env.JAZZCASH_MERCHANT_ID || "",
    password: process.env.JAZZCASH_PASSWORD || "",
    integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || "",
    isSandbox: process.env.JAZZCASH_SANDBOX === "true",
    returnUrl: process.env.JAZZCASH_RETURN_URL || "http://localhost:5175/payment/return",
});

/**
 * Get the JazzCash API URL based on environment
 */
function getApiUrl() {
    const { isSandbox } = getConfig();
    return isSandbox
        ? "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
        : "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
}

/**
 * Generate a unique transaction reference
 */
function generateTxnRefNo() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `T${timestamp}${random}`;
}

/**
 * Format date to JazzCash format: YYYYMMDDHHmmss
 */
function formatJazzCashDate(date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

/**
 * Generate HMAC SHA256 hash for JazzCash
 * JazzCash requires sorting all non-empty fields alphabetically by key,
 * joining values with '&', and hashing with the integrity salt.
 */
function generateHash(fields) {
    const { integritySalt } = getConfig();

    // Sort keys alphabetically and join non-empty values
    const sortedKeys = Object.keys(fields).sort();
    const hashString = integritySalt + "&" + sortedKeys
        .filter((key) => fields[key] !== "" && fields[key] !== undefined && fields[key] !== null)
        .map((key) => fields[key])
        .join("&");

    const hmac = crypto.createHmac("sha256", integritySalt);
    hmac.update(hashString);
    return hmac.digest("hex");
}

/**
 * Generate payment form data for JazzCash Hosted Checkout
 * @param {Object} params - { orderId, amount, description, billRef }
 * @returns {Object} - { formData, actionUrl }
 */
function generatePaymentData({ orderId, amount, description, billRef }) {
    const config = getConfig();
    const txnRefNo = generateTxnRefNo();
    const now = new Date();
    const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    const fields = {
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_Language: "EN",
        pp_MerchantID: config.merchantId,
        pp_SubMerchantID: "",
        pp_Password: config.password,
        pp_BankID: "TBANK",
        pp_ProductID: "RETL",
        pp_TxnRefNo: txnRefNo,
        pp_Amount: String(Math.round(amount * 100)), // Convert to paisa
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: formatJazzCashDate(now),
        pp_TxnExpiryDateTime: formatJazzCashDate(expiry),
        pp_BillReference: billRef || orderId,
        pp_Description: description || "TCS Event Ticket",
        pp_ReturnURL: config.returnUrl,
        ppmpf_1: orderId, // Store our orderId for reference
        ppmpf_2: "",
        ppmpf_3: "",
        ppmpf_4: "",
        ppmpf_5: "",
    };

    // Generate secure hash
    fields.pp_SecureHash = generateHash(fields);

    return {
        formData: fields,
        actionUrl: getApiUrl(),
        txnRefNo,
    };
}

/**
 * Verify JazzCash webhook/callback signature
 * @param {Object} payload - The complete callback payload from JazzCash
 * @returns {boolean} - Whether the signature is valid
 */
function verifyWebhookSignature(payload) {
    const receivedHash = payload.pp_SecureHash;
    if (!receivedHash) return false;

    // Remove the hash from payload before verification
    const fields = { ...payload };
    delete fields.pp_SecureHash;

    const computedHash = generateHash(fields);
    return computedHash === receivedHash;
}

/**
 * Check if payment response indicates success
 * JazzCash response codes: 000 = success, 124 = pending
 */
function isPaymentSuccessful(responseCode) {
    return responseCode === "000";
}

function isPaymentPending(responseCode) {
    return responseCode === "124";
}

module.exports = {
    generatePaymentData,
    verifyWebhookSignature,
    isPaymentSuccessful,
    isPaymentPending,
    getConfig,
};
