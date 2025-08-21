// route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAddress } from "viem";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // server-side only!
);

export async function GET(req: Request) {
  try {
   

    const { data, error } = await supabase
      .from("token_holders")
      .select("wallet_address")
      .eq("token_drop_id", process.env.NEXT_PUBLIC_TOKEN_ID)

    console.log("Data from get_token_holders:", data);

    if (error) {
      
      console.log("Error getting token_holders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}