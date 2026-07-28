import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as schema from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function runGroupedCountQuery() {
  console.log("=== GROUPED COUNT QUERY ===\n");
  console.log("Query: SELECT status, COUNT(*) as appointment_count FROM appointments GROUP BY status ORDER BY appointment_count DESC;\n");
  
  try {
    const result = await db.execute(
      sql`SELECT status, COUNT(*) as appointment_count FROM appointments GROUP BY status ORDER BY appointment_count DESC`
    );
    
    console.log("Results:");
    console.log("--------");
    if (result && result.length > 0) {
      result.forEach((row, index) => {
        console.log(`${index + 1}. Status: ${row.status}, Count: ${row.appointment_count}`);
      });
    } else {
      console.log("No results returned");
    }
    
    console.log("\nTotal rows returned:", result.length);
    process.exit(0);
  } catch (error) {
    console.error("Query failed:", error);
    process.exit(1);
  }
}

runGroupedCountQuery();
