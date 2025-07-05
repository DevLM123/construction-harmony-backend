const { googleOAuth2Client } = require("../services/googleService");
const { saveGoogleTokens } = require("../services/supabaseService");

exports.getAuthUrl = (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar.events"];
  const url = googleOAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  res.redirect(url);
};

exports.oauthCallback = async (req, res, next) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code param");
  try {
    const { tokens } = await googleOAuth2Client.getToken(code);
    await saveGoogleTokens(tokens);
    googleOAuth2Client.setCredentials(tokens);
    res.send("Authorization successful! You can close this tab.");
  } catch (error) {
    next(error);
    // res.status(500).send("Google OAuth failed");
  }
};
