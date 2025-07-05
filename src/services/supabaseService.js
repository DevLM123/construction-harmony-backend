const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function saveGoogleTokens(tokens) {
  await supabase.from("google_oauth_tokens").upsert([
    {
      id: 1,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    },
  ]);
}

async function loadGoogleTokens() {
  const { data, error } = await supabase
    .from("google_oauth_tokens")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) return null;
  return data;
}

module.exports = { saveGoogleTokens, loadGoogleTokens, supabase };
