interface SendPushRequest {
  recipientUserIds: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface PushTokenRow {
  expo_push_token: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!authHeader || !supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Missing function environment configuration." }, 500);
    }

    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const token = authHeader.slice("Bearer ".length);
    const userLookup = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey
      }
    });

    if (!userLookup.ok) {
      console.info(`[send-push] auth-failed status=${userLookup.status}`);
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const payload = (await request.json()) as SendPushRequest;
    if (!Array.isArray(payload.recipientUserIds) || payload.recipientUserIds.length === 0) {
      return jsonResponse({ sent: 0 });
    }

    const tokensResponse = await fetch(
      `${supabaseUrl}/rest/v1/push_tokens?select=expo_push_token&user_id=in.(${payload.recipientUserIds.join(",")})&disabled_at=is.null`,
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey
        }
      }
    );

    if (!tokensResponse.ok) {
      const text = await tokensResponse.text();
      console.info(`[send-push] token-lookup-failed=${text}`);
      return jsonResponse({ error: text || "Could not load push tokens." }, 500);
    }

    const rows = (await tokensResponse.json()) as PushTokenRow[];
    const messages = rows.map((row) => ({
      to: row.expo_push_token,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {}
    }));

    if (messages.length === 0) {
      console.info("[send-push] no-active-tokens");
      return jsonResponse({ sent: 0 });
    }

    console.info(`[send-push] sending=${messages.length}`);

    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messages)
    });

    const expoBody = await expoResponse.text();

    if (!expoResponse.ok) {
      console.info(`[send-push] expo-send-failed=${expoBody}`);
      return jsonResponse({ error: expoBody || "Expo push delivery failed." }, 500);
    }

    console.info(`[send-push] expo-send-response=${expoBody}`);

    return jsonResponse({
      sent: messages.length,
      response: expoBody
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unexpected notification error."
      },
      500
    );
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
