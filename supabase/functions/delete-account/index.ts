import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[delete-account] missing auth header");
      return json({ error: "unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      console.error("[delete-account] invalid token");
      return json({ error: "unauthorized" }, 401);
    }

    const admin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("[delete-account] delete failed", {
        userId: user.id,
        message: error.message,
      });
      return json({ error: "delete_failed" }, 500);
    }

    console.log("[delete-account] account deleted", { userId: user.id });
    return json({ ok: true });
  } catch (e) {
    console.error("[delete-account] unexpected error", { message: String(e) });
    return json({ error: "unexpected" }, 500);
  }
});
