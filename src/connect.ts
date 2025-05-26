import type { ConnectionOptions, Connection } from "mysql2/promise";
import mysql from "mysql2/promise";

const connOptions: ConnectionOptions = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "nextjs-todo",
  connectionLimit: 10,
};

let connection: Connection | undefined = undefined;

async function exit() {
  try {
    connection?.end();
    console.log("disconnected from database");
    connection = undefined;
  } catch (e) {
    throw e;
  }
  process.exit(0);
}

export async function connect(): Promise<Connection> {
  try {
    if (connection) return connection;
    connection = await mysql.createConnection(connOptions);
    process.on("SIGINT", () => exit());
    return connection;
  } catch (e) {
    throw e;
  }
}
