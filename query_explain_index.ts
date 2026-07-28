import mysql from "mysql2/promise";

async function runExplainAnalysis() {
  console.log("=== DATABASE INDEX OPTIMIZATION ===\n");
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    // Step 1: Show EXPLAIN BEFORE adding index
    console.log("STEP 1: EXPLAIN BEFORE INDEX");
    console.log("=============================");
    console.log("Query: SELECT * FROM appointments WHERE status = 'scheduled' ORDER BY appointmentDateTime DESC LIMIT 10;\n");
    
    const [explainBefore] = await connection.execute(
      "EXPLAIN SELECT * FROM appointments WHERE status = 'scheduled' ORDER BY appointmentDateTime DESC LIMIT 10"
    );
    
    console.log("Query Plan BEFORE Index:");
    console.table(explainBefore);
    
    // Extract key information
    const beforePlan = (explainBefore as any)[0];
    console.log("\nKey Observations BEFORE:");
    console.log(`- Type: ${beforePlan.type}`);
    console.log(`- Possible Keys: ${beforePlan.possible_keys || 'NULL (Full table scan!)'}`);
    console.log(`- Key Used: ${beforePlan.key || 'NULL (Full table scan!)'}`);
    console.log(`- Rows Examined: ${beforePlan.rows}`);
    console.log(`- Extra: ${beforePlan.Extra}`);
    
    // Step 2: Create index on status and appointmentDateTime
    console.log("\n\nSTEP 2: CREATING INDEX");
    console.log("======================");
    console.log("Creating composite index: CREATE INDEX idx_status_datetime ON appointments(status, appointmentDateTime DESC);\n");
    
    try {
      await connection.execute(
        "CREATE INDEX idx_status_datetime ON appointments(status, appointmentDateTime DESC)"
      );
      console.log("✓ Index created successfully!\n");
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log("✓ Index already exists (that's fine)\n");
      } else {
        throw error;
      }
    }
    
    // Step 3: Show EXPLAIN AFTER adding index
    console.log("\nSTEP 3: EXPLAIN AFTER INDEX");
    console.log("============================");
    console.log("Query: SELECT * FROM appointments WHERE status = 'scheduled' ORDER BY appointmentDateTime DESC LIMIT 10;\n");
    
    const [explainAfter] = await connection.execute(
      "EXPLAIN SELECT * FROM appointments WHERE status = 'scheduled' ORDER BY appointmentDateTime DESC LIMIT 10"
    );
    
    console.log("Query Plan AFTER Index:");
    console.table(explainAfter);
    
    // Extract key information
    const afterPlan = (explainAfter as any)[0];
    console.log("\nKey Observations AFTER:");
    console.log(`- Type: ${afterPlan.type}`);
    console.log(`- Possible Keys: ${afterPlan.possible_keys}`);
    console.log(`- Key Used: ${afterPlan.key}`);
    console.log(`- Rows Examined: ${afterPlan.rows}`);
    console.log(`- Extra: ${afterPlan.Extra}`);
    
    // Step 4: Show the improvement
    console.log("\n\nSTEP 4: PERFORMANCE IMPROVEMENT");
    console.log("================================");
    console.log(`Rows examined BEFORE: ${beforePlan.rows}`);
    console.log(`Rows examined AFTER: ${afterPlan.rows}`);
    
    if (beforePlan.rows > afterPlan.rows) {
      const improvement = ((beforePlan.rows - afterPlan.rows) / beforePlan.rows * 100).toFixed(2);
      console.log(`\n✓ IMPROVEMENT: ${improvement}% fewer rows examined!`);
      console.log(`✓ Index is being used: ${afterPlan.key}`);
      console.log(`✓ Query changed from: ${beforePlan.type} to ${afterPlan.type}`);
    } else {
      console.log("\nIndex optimization applied successfully!");
    }
    
    // Step 5: Show other heavy queries that could benefit from indexes
    console.log("\n\nSTEP 5: OTHER QUERIES THAT COULD BENEFIT FROM INDEXES");
    console.log("======================================================");
    
    console.log("\nQuery 2: Find appointments by patient and date range");
    console.log("SELECT * FROM appointments WHERE patientId = 1 AND appointmentDateTime BETWEEN '2026-01-01' AND '2026-12-31';\n");
    
    const [explainQuery2] = await connection.execute(
      "EXPLAIN SELECT * FROM appointments WHERE patientId = 1 AND appointmentDateTime BETWEEN '2026-01-01' AND '2026-12-31'"
    );
    const plan2 = (explainQuery2 as any)[0];
    console.log("Current plan:");
    console.table(explainQuery2);
    console.log(`Rows examined: ${plan2.rows}`);
    console.log(`Recommendation: Add index on (patientId, appointmentDateTime)\n`);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Query failed:", error);
    process.exit(1);
  }
}

runExplainAnalysis();
