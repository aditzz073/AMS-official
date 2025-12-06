/**
 * Rollback Script: Revert email-primary migration
 * 
 * This script reverts the migration by:
 * 1. Removing email field from Evaluation documents (keeping employeeCode)
 * 2. Optionally preserving BasicEmployeeInfo collection
 * 3. Creating a rollback report
 * 
 * Usage: node Backend/migration/rollbackEmailPrimary.js
 * 
 * WARNING: This should only be used if the migration caused issues
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Evaluation from '../model/data.js';
import BasicEmployeeInfo from '../model/basicEmployeeInfo.js';
import readline from 'readline';

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

// Rollback statistics
const stats = {
  evaluationsProcessed: 0,
  evaluationsReverted: 0,
  basicInfoDeleted: 0,
  errors: []
};

// User confirmation
const confirmRollback = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n⚠️  WARNING: This will rollback the email-primary migration!');
    console.log('This action will:');
    console.log('1. Remove email fields from Evaluation documents');
    console.log('2. Optionally delete BasicEmployeeInfo collection');
    console.log('3. This may cause data loss if not backed up!\n');

    rl.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
};

// Rollback function
const rollback = async () => {
  try {
    console.log('🔄 Starting rollback process...\n');

    // Get user confirmation
    const confirmed = await confirmRollback();
    if (!confirmed) {
      console.log('❌ Rollback cancelled by user');
      return;
    }

    console.log('\n📊 Processing evaluations...');
    const evaluations = await Evaluation.find({});
    stats.evaluationsProcessed = evaluations.length;

    for (const evaluation of evaluations) {
      try {
        if (evaluation.email) {
          // Remove the email field but keep employeeCode
          evaluation.email = undefined;
          await evaluation.save();
          stats.evaluationsReverted++;
          console.log(`✅ Reverted evaluation for employeeCode: ${evaluation.employeeCode}`);
        }
      } catch (error) {
        console.error(`❌ Error reverting evaluation ${evaluation._id}:`, error.message);
        stats.errors.push({
          evaluationId: evaluation._id,
          error: error.message
        });
      }
    }

    // Ask about BasicEmployeeInfo deletion
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const deleteBasicInfo = await new Promise((resolve) => {
      rl.question('\nDelete BasicEmployeeInfo collection? (yes/no): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });

    if (deleteBasicInfo) {
      const deleteResult = await BasicEmployeeInfo.deleteMany({});
      stats.basicInfoDeleted = deleteResult.deletedCount;
      console.log(`🗑️  Deleted ${stats.basicInfoDeleted} BasicEmployeeInfo documents`);
    } else {
      console.log('ℹ️  BasicEmployeeInfo collection preserved');
    }

    // Print rollback report
    console.log('\n' + '='.repeat(60));
    console.log('📋 ROLLBACK REPORT');
    console.log('='.repeat(60));
    console.log(`Evaluations Processed:          ${stats.evaluationsProcessed}`);
    console.log(`Evaluations Reverted:           ${stats.evaluationsReverted}`);
    console.log(`BasicEmployeeInfo Deleted:      ${stats.basicInfoDeleted}`);
    console.log(`Errors Encountered:             ${stats.errors.length}`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      stats.errors.forEach((err, index) => {
        console.log(`${index + 1}. Evaluation ${err.evaluationId}: ${err.error}`);
      });
    }

    console.log('\n✅ Rollback completed!');

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

// Run rollback
const runRollback = async () => {
  try {
    await connectDB();
    await rollback();
    
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error during rollback:', error);
    process.exit(1);
  }
};

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRollback();
}

export default rollback;
