import { NextResponse } from "next/server";
import { connect } from "@/connect";
import { Todo } from "@/types";

export async function GET() {
  try {
    const connection = await connect();
    const [rows] = await connection.execute("SELECT * FROM todos");

    return NextResponse.json({
      error: false,
      data: rows as Todo[],
    });
  } catch (error) {
    console.error("Error in GET /api/todos:", error);
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 }
    );
  }
}
