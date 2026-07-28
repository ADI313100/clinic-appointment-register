import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

async function runGroupedCountQuery() {
  console.log("=== GROUPED COUNT QUERY ===\n");
  console.log("Query: SELECT status, COUNT(*) as appointment_count FROM appointments GROUP BY status ORDER BY appointment_count DESC;\n");
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const [rows] = await connection.execute(
      "SELECT status, COUNT(*) as appointment_count FROM appointments GROUP BY status ORDER BY appointment_count DESC"
    );
    
    console.log("Results:");
    console.log("--------");
    if (Array.isArray(rows) && rows.length > 0) {
      rows.forEach((row: any, index: number) => {
        console.log(`${index + 1}. Status: ${row.status}, Count: ${row.appointment_count}`);
      });
    } else {
      console.log("No results returned");
    }
    
    console.log("\nTotal rows returned:", rows.length);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Query failed:", error);
    process.exit(1);
  }
}

runGroupedCountQuery();
