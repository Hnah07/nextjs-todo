import { google } from "googleapis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Only import the JSON file in development
let keys;
if (process.env.NODE_ENV !== "production") {
  try {
    keys = (
      await import("../../../google-key.json", { assert: { type: "json" } })
    ).default;
  } catch {
    console.warn(
      "Could not load google-key.json, will use environment variables"
    );
  }
}

async function getSheetClient() {
  let credentials;

  if (process.env.NODE_ENV === "production" || !keys) {
    // In production or if JSON file is not available, use environment variables
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("Missing Google credentials in environment variables");
    }
    credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  } else {
    // In development with JSON file available, use it
    credentials = keys;
  }

  const client = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  await client.authorize();
  return google.sheets({ version: "v4", auth: client });
}

async function findRowIndex(gsapi, id) {
  const response = await gsapi.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "!A:A",
  });

  if (!response.data.values) {
    throw new Error("No data found in sheet");
  }

  const rowIndex = response.data.values
    .slice(1)
    .findIndex((row) => parseInt(row[0]) === id);
  if (rowIndex === -1) {
    throw new Error("Todo not found");
  }

  return rowIndex + 2;
}

export async function GET() {
  try {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error("GOOGLE_SHEET_ID environment variable is not set");
    }

    console.log("Attempting to get sheet client...");
    const gsapi = await getSheetClient();
    console.log("Sheet client obtained successfully");

    console.log("Attempting to fetch sheet data...");
    console.log("Using Sheet ID:", process.env.GOOGLE_SHEET_ID);
    const response = await gsapi.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "!A:D",
    });
    console.log("Sheet data fetched successfully");

    if (!response.data.values) {
      console.log("No values found in response:", response.data);
      throw new Error("No data found in sheet");
    }

    return NextResponse.json({
      error: false,
      headers: response.data.values[0],
      rows: response.data.values.slice(1),
    });
  } catch (e) {
    console.error("Detailed error in GET /api/sheet:", {
      message: e.message,
      stack: e.stack,
      name: e.name,
      code: e.code,
    });
    return NextResponse.json(
      { error: true, message: e.message },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  try {
    const gsapi = await getSheetClient();
    const { action, id, todo, photo_url, completed } = await request.json();

    switch (action) {
      case "add": {
        const response = await gsapi.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: "!A:A",
        });

        const lastRow = response.data.values?.[response.data.values.length - 1];
        const newId = lastRow ? parseInt(lastRow[0]) + 1 : 1;

        await gsapi.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: "!A:D",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[newId.toString(), todo, photo_url, "FALSE"]],
          },
        });

        return NextResponse.json({
          error: false,
          data: {
            id: newId,
            todo,
            photo_url,
            completed: false,
          },
        });
      }

      case "delete": {
        const rowNumber = await findRowIndex(gsapi, id);

        await gsapi.spreadsheets.batchUpdate({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          requestBody: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: 0,
                    dimension: "ROWS",
                    startIndex: rowNumber - 1,
                    endIndex: rowNumber,
                  },
                },
              },
            ],
          },
        });

        return NextResponse.json({ error: false });
      }

      case "toggle": {
        const rowNumber = await findRowIndex(gsapi, id);

        await gsapi.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `!D${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[completed ? "TRUE" : "FALSE"]],
          },
        });

        const response = await gsapi.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `!A${rowNumber}:D${rowNumber}`,
        });

        const row = response.data.values[0];
        return NextResponse.json({
          error: false,
          data: {
            id: parseInt(row[0]),
            todo: row[1],
            photo_url: row[2] || "",
            completed: row[3] === "TRUE" || row[3] === "true",
          },
        });
      }

      case "update": {
        const rowNumber = await findRowIndex(gsapi, id);

        await gsapi.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `!B${rowNumber}:C${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[todo, photo_url]],
          },
        });

        const response = await gsapi.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `!A${rowNumber}:D${rowNumber}`,
        });

        const row = response.data.values[0];
        return NextResponse.json({
          error: false,
          data: {
            id: parseInt(row[0]),
            todo: row[1],
            photo_url: row[2] || "",
            completed: row[3] === "TRUE" || row[3] === "true",
          },
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (e) {
    console.error("Error in POST /api/sheet:", e);
    return NextResponse.json(
      { error: true, message: e.message },
      { status: 400 }
    );
  }
}
