const { googleOAuth2Client } = require("../services/googleService");
const { loadGoogleTokens } = require("../services/supabaseService");
const { google } = require("googleapis");
const { supabase } = require("../services/supabaseService");
const { addDays, format, isWeekend } = require("date-fns");

exports.scheduleMeeting = async (req, res, next) => {
  const tokens = await loadGoogleTokens();
  if (!tokens)
    return res.status(403).json({ error: "Not authorized with Google." });
  googleOAuth2Client.setCredentials(tokens);

  const { name, email, date, startTime, endTime } = req.body;
  const calendar = google.calendar({ version: "v3", auth: googleOAuth2Client });

  try {
    const requestId = `meet-${Date.now()}`;
    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: `Consultation: ${name}`,
        description: `Consultation with ${name}`,
        start: { dateTime: startTime, timeZone: "America/New_York" },
        end: { dateTime: endTime, timeZone: "America/New_York" },
        attendees: [{ email: process.env.ADMIN_EMAIL }, { email }],
        conferenceData: {
          createRequest: { requestId },
        },
      },
    });

    const meetLink =
      response.data.hangoutLink ||
      (response.data.conferenceData &&
        response.data.conferenceData.entryPoints &&
        response.data.conferenceData.entryPoints[0] &&
        response.data.conferenceData.entryPoints[0].uri);

    res.json({
      eventId: response.data.id,
      meetLink,
      calendarLink: response.data.htmlLink,
    });
  } catch (err) {
    next(error);
  }
};

exports.getAvailableDates = async (req, res) => {
  console.log("Received request for /api/available-dates");
  const { data, error } = await supabase
    .from("consultation_requests")
    .select("slot_id");

  if (error) return res.status(500).json({ error: error.message });

  const bookedSlots = new Set((data || []).map((r) => r.slot_id));
  const today = new Date();
  const availableDates = [];
  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i);
    if (isWeekend(date) || date < today) continue;
    let slotsAvailable = 0;
    for (let hour = 11; hour <= 16; hour++) {
      const slotId = `${format(date, "yyyy-MM-dd")}-${hour}`;
      if (!bookedSlots.has(slotId)) slotsAvailable++;
    }
    if (slotsAvailable > 0) availableDates.push(format(date, "yyyy-MM-dd"));
  }
  res.json(availableDates);
};

exports.getBookedSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });
  const { data, error } = await supabase
    .from("consultation_requests")
    .select("slot_id")
    .like("slot_id", `${date}-%`);

  if (error) return res.status(500).json({ error: error.message });

  const bookedHours = (data || [])
    .map((r) => {
      const parts = (r.slot_id || "").split("-");
      return Number(parts[3]);
    })
    .filter((hour) => !isNaN(hour));
  res.json(bookedHours);
};
