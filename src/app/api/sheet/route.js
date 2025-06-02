import { google } from "googleapis";
import keys from "../../../google-key.json";
import { NextResponse } from "next/server";

// Helper function to get Google Sheets client
async function getSheetClient() {
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  await client.authorize();
  return google.sheets({ version: "v4", auth: client });
}

// Helper function to find row index by id
async function findRowIndex(gsapi, id) {
  const response = await gsapi.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "!A:A", // Only get the ID column
  });

  if (!response.data.values) {
    throw new Error("No data found in sheet");
  }

  // Skip header row, find matching id
  const rowIndex = response.data.values
    .slice(1)
    .findIndex((row) => parseInt(row[0]) === id);
  if (rowIndex === -1) {
    throw new Error("Todo not found");
  }

  // Add 2 because: 1 for 0-based index, 1 for header row
  return rowIndex + 2;
}

export async function GET() {
  try {
    const gsapi = await getSheetClient();
    const response = await gsapi.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "!A:D",
    });

    if (!response.data.values) {
      throw new Error("No data found in sheet");
    }

    return NextResponse.json({
      error: false,
      headers: response.data.values[0],
      rows: response.data.values.slice(1),
    });
  } catch (e) {
    console.error("Error in GET /api/sheet:", e);
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
          range: "!A:A", // Get last row for ID
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
                    sheetId: 0, // Assuming first sheet
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

        // Get the updated row
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

        // Get the updated row
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
