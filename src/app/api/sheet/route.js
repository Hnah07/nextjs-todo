import { google } from "googleapis";
import keys from "../../../google-key.json";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const tokens = await client.authorize();
    if (!tokens) {
      return NextResponse.json({ error: true }, { status: 400 });
    }

    const gsapi = google.sheets({ version: "v4", auth: client });

    const opt = {
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "!A:D",
    };

    const data = await gsapi.spreadsheets.values.get(opt);
    return NextResponse.json({ error: false, data: data.data.values });
  } catch (e) {
    return NextResponse.json(
      { error: true, message: e.message },
      { status: 400 }
    );
  }
}
