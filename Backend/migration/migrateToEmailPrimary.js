/**
 * Migration Script: Convert from employeeCode-primary to email-primary system
 * 
 * This script:
 * 1. Reads all existing Evaluation documents
 * 2. Extracts basic employee info fields
 * 3. Creates BasicEmployeeInfo documents
 * 4. Updates Evaluation documents with email as primary identifier
 * 5. Creates a migration report
 * 
 * Usage: node Backend/migration/migrateToEmailPrimary.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Evaluation from '../model/data.js';
import BasicEmployeeInfo from '../model/basicEmployeeInfo.js';
import User from '../model/user.js';

// Load environment variables
dotenv.config();

// Connection to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration statistics
const stats = {
  totalEvaluations: 0,
  basicInfoCreated: 0,
  basicInfoUpdated: 0,
  evaluationsUpdated: 0,
  evaluationsSkipped: 0,
  usersUpdated: 0,
  errors: []
};

// Main migration function
const migrate = async () => {
  try {
    console.log('🚀 Starting migration process...\n');

    // Step 1: Fetch all evaluations
    console.log('📊 Fetching all evaluation documents...');
    const evaluations = await Evaluation.find({});
    stats.totalEvaluations = evaluations.length;
    console.log(`Found ${stats.totalEvaluations} evaluation documents\n`);

    if (stats.totalEvaluations === 0) {
      console.log('⚠️  No evaluations found. Nothing to migrate.');
      return;
    }

    // Step 2: Process each evaluation
    console.log('🔄 Processing evaluations...\n');
    
    for (const evaluation of evaluations) {
      try {
        // Check if evaluation already has email (already migrated)
        if (evaluation.email) {
          console.log(`⏭️  Skipping evaluation ${evaluation._id} - already has email`);
          stats.evaluationsSkipped++;
          continue;
        }

        // Check if evaluation has employeeCode
        if (!evaluation.employeeCode) {
          console.log(`⚠️  Skipping evaluation ${evaluation._id} - no employeeCode`);
          stats.evaluationsSkipped++;
          stats.errors.push({
            evaluationId: evaluation._id,
            error: 'No employeeCode found'
          });
          continue;
        }

        const employeeCode = evaluation.employeeCode;

        // Try to find associated user by employeeCode (if users have it) or generate email
        let targetEmail = null;
        
        // First, check if there's a User with this employeeCode
        const user = await User.findOne({ employeeCode });
        if (user) {
          targetEmail = user.email;
        } else {
          // Generate a placeholder email from employeeCode
          // This should be updated manually later by the user
          targetEmail = `${employeeCode.toLowerCase()}@placeholder.edu`;
          console.log(`⚠️  No user found for ${employeeCode}, using placeholder email: ${targetEmail}`);
        }

        // Extract basic info fields from old evaluation schema
        // Note: The old schema had these fields directly in Evaluation
        const basicInfoData = {
          email: targetEmail,
          employeeCode: employeeCode,
          name: evaluation.name,
          designation: evaluation.designation,
          department: evaluation.department,
          college: evaluation.college,
          campus: evaluation.campus,
          joiningDate: evaluation.joiningDate,
          periodOfAssessment: evaluation.periodOfAssessment,
          externalEvaluatorName: evaluation.externalEvaluatorName,
          principalName: evaluation.principleName, // Note: old schema had typo "principleName"
          HODName: evaluation.HODName
        };

        // Step 3: Create or update BasicEmployeeInfo
        let basicInfo = await BasicEmployeeInfo.findOne({ 
          $or: [
            { email: targetEmail },
            { employeeCode: employeeCode }
          ]
        });

        if (basicInfo) {
          // Update existing
          Object.assign(basicInfo, basicInfoData);
          await basicInfo.save();
          stats.basicInfoUpdated++;
          console.log(`📝 Updated BasicEmployeeInfo for ${employeeCode} (${targetEmail})`);
        } else {
          // Create new
          basicInfo = await BasicEmployeeInfo.create(basicInfoData);
          stats.basicInfoCreated++;
          console.log(`✨ Created BasicEmployeeInfo for ${employeeCode} (${targetEmail})`);
        }

        // Step 4: Update the evaluation document with email
        evaluation.email = targetEmail;
        // Keep employeeCode as foreign key reference
        evaluation.employeeCode = employeeCode;
        
        await evaluation.save();
        stats.evaluationsUpdated++;
        console.log(`✅ Updated Evaluation for ${employeeCode} with email ${targetEmail}\n`);

        // Step 5: Update User if exists but doesn't have employeeCode
        if (user && !user.employeeCode) {
          user.employeeCode = employeeCode;
          await user.save();
          stats.usersUpdated++;
          console.log(`👤 Updated User ${user.email} with employeeCode ${employeeCode}\n`);
        }

      } catch (error) {
        console.error(`❌ Error processing evaluation ${evaluation._id}:`, error.message);
        stats.errors.push({
          evaluationId: evaluation._id,
          employeeCode: evaluation.employeeCode,
          error: error.message
        });
      }
    }

    // Print migration report
    console.log('\n' + '='.repeat(60));
    console.log('📋 MIGRATION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Evaluations Found:        ${stats.totalEvaluations}`);
    console.log(`Evaluations Updated:            ${stats.evaluationsUpdated}`);
    console.log(`Evaluations Skipped:            ${stats.evaluationsSkipped}`);
    console.log(`BasicEmployeeInfo Created:      ${stats.basicInfoCreated}`);
    console.log(`BasicEmployeeInfo Updated:      ${stats.basicInfoUpdated}`);
    console.log(`Users Updated:                  ${stats.usersUpdated}`);
    console.log(`Errors Encountered:             ${stats.errors.length}`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      stats.errors.forEach((err, index) => {
        console.log(`${index + 1}. Evaluation ${err.evaluationId} (${err.employeeCode}): ${err.error}`);
      });
    }

    console.log('\n✅ Migration completed successfully!');
    
    // Print next steps
    console.log('\n' + '='.repeat(60));
    console.log('📌 NEXT STEPS');
    console.log('='.repeat(60));
    console.log('1. Review placeholder emails (ending with @placeholder.edu)');
    console.log('2. Update those employees with real email addresses');
    console.log('3. Test the application with the new email-based flow');
    console.log('4. Update frontend to use email as primary identifier');
    console.log('5. Create backups before deploying to production');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration
const runMigration = async () => {
  try {
    await connectDB();
    await migrate();
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    process.exit(1);
  }
};

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default migrate;
