import { google, sheets_v4 } from "googleapis";
import { NextResponse } from "next/server";

// Add middleware configuration to bypass authentication
export const config = {
  runtime: "edge",
  regions: ["iad1"],
  unstable_allowDynamicGlobals: ["google"],
};

type SheetsClient = sheets_v4.Sheets;

async function getSheetClient(): Promise<SheetsClient> {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google credentials in environment variables");
  }

  const client = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  await client.authorize();
  return google.sheets({ version: "v4", auth: client });
}

async function findRowIndex(gsapi: SheetsClient, id: number) {
  const response = await gsapi.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "!A:A",
  });

  if (!response.data?.values) {
    throw new Error("No data found in sheet");
  }

  const rowIndex = response.data?.values
    .slice(1)
    .findIndex((row: string[]) => parseInt(row[0]) === id);
  if (rowIndex === -1) {
    throw new Error("Todo not found");
  }

  return rowIndex + 2;
}

export async function GET() {
  // Add CORS headers
  const response = NextResponse.json({ todos: [] }, { status: 200 });

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  try {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error("GOOGLE_SHEET_ID environment variable is not set");
    }

    const gsapi = await getSheetClient();
    const sheetResponse = await gsapi.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "!A:D",
    });

    const values = sheetResponse.data?.values;
    if (!values || values.length === 0) {
      throw new Error("No data found in sheet");
    }

    const [, ...rows] = values ?? [];
    const todos = rows.map((row) => ({
      id: parseInt(row[0]),
      todo: row[1],
      photo_url: row[2] || "",
      completed: row[3] === "TRUE" || row[3] === "true",
    }));

    return NextResponse.json(
      { todos },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error in GET /api/sheet:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const gsapi = await getSheetClient();
    const { action, id, todo, photo_url, completed } = await request.json();

    switch (action) {
      case "add": {
        const response = await gsapi.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: "!A:A",
        });

        const lastRow =
          response.data?.values?.[response.data.values.length - 1];
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

        const row = response.data?.values?.[0];
        return NextResponse.json({
          error: false,
          data: {
            id: parseInt(row?.[0] ?? "0"),
            todo: row?.[1] ?? "",
            photo_url: row?.[2] ?? "",
            completed: row?.[3] === "TRUE" || row?.[3] === "true",
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

        const row = response.data?.values?.[0];
        return NextResponse.json({
          error: false,
          data: {
            id: parseInt(row?.[0] ?? "0"),
            todo: row?.[1] ?? "",
            photo_url: row?.[2] ?? "",
            completed: row?.[3] === "TRUE" || row?.[3] === "true",
          },
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: unknown) {
    console.error("Error in POST /api/sheet:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { error: true, message: errorMessage },
      { status: 400 }
    );
  }
}
