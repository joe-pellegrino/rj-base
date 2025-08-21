// route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAddress } from "viem";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // server-side only!
);

export async function POST(req: Request) {
  try {
    const { address, tokenId } = await req.json();
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }
    const addr = address.toLowerCase();

    const { data, error } = await supabase
      .from("token_holders")
      .select("wallet_address, token_drop_id")
      .eq("wallet_address", addr)
      .eq("token_drop_id", tokenId)

    console.log("Data from token_holders:", data);

    if (error) {
      // unique violation -> already signed up
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, already: true });
      }
      console.log("Error inserting into token_holders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}