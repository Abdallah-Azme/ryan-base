import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();

const ADMIN_EMAIL = defineSecret("ADMIN_EMAIL");
const SMTP_CONNECTION_URI = defineSecret("SMTP_CONNECTION_URI");
const MAIL_FROM = defineSecret("MAIL_FROM");

// Helper to send email
async function sendEmail(subject: string, html: string, smtpUri: string, toEmail: string, fromEmail: string) {
  const transporter = nodemailer.createTransport(smtpUri);
  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject,
    html,
  });
}

export const onAppointmentCreated = onDocumentCreated(
  {
    document: "appointment_bookings/{appointmentId}",
    secrets: [ADMIN_EMAIL, SMTP_CONNECTION_URI, MAIL_FROM],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const appointmentId = event.params.appointmentId;
    const logRef = admin.firestore().collection("emailLogs").doc(`appointment_${appointmentId}`);

    try {
      // Atomic idempotency lock: create the log document
      await logRef.create({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: "appointment",
        docId: appointmentId
      });
    } catch (error: any) {
      // If the document already exists, ALREADY_EXISTS error is thrown (code 6 in gRPC)
      if (error.code === 6 || error.message.includes("ALREADY_EXISTS")) {
        console.log(`Email already sent for appointment ${appointmentId}. Skipping.`);
        return;
      }
      throw error;
    }

    const data = snapshot.data();

    let name = data.guestName || data.userName;
    let phone = data.guestPhone || data.userPhone;
    let email = data.guestEmail || data.userEmail;

    // If it's an authenticated user, they might not have provided guestName/guestPhone.
    // Let's fetch their details from the users collection.
    if (data.userId && (!name || !phone)) {
      try {
        const userDoc = await admin.firestore().collection("users").doc(data.userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData) {
            name = name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            phone = phone || userData.phone;
            email = email || userData.email;
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    }

    // Basic validation to prevent spam
    if (!name && !phone && !data.userId) {
      console.warn("Skipping appointment email: missing required fields (name, phone, or userId)");
      return;
    }

    const adminEmail = ADMIN_EMAIL.value();
    const smtpUri = SMTP_CONNECTION_URI.value();
    const mailFrom = MAIL_FROM.value();

    const subject = "New Appointment Booking";
    const html = `
      <h2>New Appointment Booking</h2>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Date:</strong> ${data.dateKey || 'N/A'}</p>
      <p><strong>Time:</strong> ${data.time || 'N/A'}</p>
      <p><strong>Topic/Service:</strong> ${data.topic || 'N/A'}</p>
      <p><strong>Notes:</strong> ${data.notes || 'N/A'}</p>
      <p><strong>UID:</strong> ${data.userId || 'Guest'}</p>
    `;

    try {
      await sendEmail(subject, html, smtpUri, adminEmail, mailFrom);
    } catch (error) {
      console.error("SMTP Delivery Error for Appointment:", error);
      throw error; // Rethrow to ensure it's marked as a failure and emailSent is NOT set
    }

    // Mark as sent in the original document
    await snapshot.ref.update({ 
      emailSent: true,
      emailSentAt: admin.firestore.FieldValue.serverTimestamp() 
    });
  }
);

export const onLeadCreated = onDocumentCreated(
  {
    document: "leads/{leadId}",
    secrets: [ADMIN_EMAIL, SMTP_CONNECTION_URI, MAIL_FROM],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const leadId = event.params.leadId;
    const logRef = admin.firestore().collection("emailLogs").doc(`lead_${leadId}`);

    try {
      // Atomic idempotency lock: create the log document
      await logRef.create({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: "lead",
        docId: leadId
      });
    } catch (error: any) {
      // If the document already exists, ALREADY_EXISTS error is thrown
      if (error.code === 6 || error.message.includes("ALREADY_EXISTS")) {
        console.log(`Email already sent for lead ${leadId}. Skipping.`);
        return;
      }
      throw error;
    }

    const data = snapshot.data();

    // Basic validation to prevent spam
    if (!data.name || !data.phone) {
      console.warn("Skipping lead email: missing required fields (name or phone)");
      return;
    }

    const adminEmail = ADMIN_EMAIL.value();
    const smtpUri = SMTP_CONNECTION_URI.value();
    const mailFrom = MAIL_FROM.value();

    const subject = "New Lead Request";
    const html = `
      <h2>New Lead Request</h2>
      <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
      <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
      <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
      <p><strong>Service:</strong> ${data.service || 'N/A'}</p>
      <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
      <p><strong>UID:</strong> ${data.userId || 'Guest'}</p>
    `;

    try {
      await sendEmail(subject, html, smtpUri, adminEmail, mailFrom);
    } catch (error) {
      console.error("SMTP Delivery Error for Lead:", error);
      throw error; // Rethrow to ensure it's marked as a failure and emailSent is NOT set
    }

    // Mark as sent in the original document
    await snapshot.ref.update({ 
      emailSent: true,
      emailSentAt: admin.firestore.FieldValue.serverTimestamp() 
    });
  }
);

export const deleteLead = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }

  const db = admin.firestore();
  const adminDoc = await db.collection("admins").doc(request.auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError("permission-denied", "Only admins can delete leads.");
  }

  const { leadId } = request.data;
  if (!leadId || typeof leadId !== 'string') {
    throw new HttpsError("invalid-argument", "Missing or invalid leadId.");
  }

  try {
    const leadRef = db.collection("leads").doc(leadId);
    await db.recursiveDelete(leadRef);

    await db.collection("emailLogs").doc(`lead_${leadId}`).delete();

    const tokensSnapshot = await db.collection("lead_claim_tokens").where("leadId", "==", leadId).get();
    const batch = db.batch();
    tokensSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    if (tokensSnapshot.size > 0) {
      await batch.commit();
    }

    return { success: true, deletedLeadId: leadId };
  } catch (error) {
    console.error(`Error deleting lead ${leadId}:`, error);
    throw new HttpsError("internal", "Failed to delete lead permanently.");
  }
});
