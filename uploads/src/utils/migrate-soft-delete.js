/**
 * MIGRATION: Soft Delete Implementation
 * Date: 2026-02-09
 * Status: ✅ COMPLETED
 * 
 * This migration adds isActive, deletedAt, and deletedBy fields to existing 
 * customers and suppliers for soft delete functionality.
 * 
 * Results: 
 * - 233 customers updated
 * - 22 suppliers updated
 * 
 * ⚠️ DO NOT RUN AGAIN unless restoring from backup or deploying to new environment
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import models
import customerModel from './src/features/customer/customer.model.js';
import supplierModel from './src/features/supplier/supplier.model.js';

/**
 * Migration Script: Set isActive=true for all existing customers and suppliers
 * 
 * This script updates all existing records that don't have the isActive field
 * to set isActive=true, ensuring backward compatibility with the new soft delete feature.
 */

const runMigration = async () => {
  try {
    console.log('🚀 Starting migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update all customers without isActive field
    const customerResult = await customerModel.updateMany(
      { isActive: { $exists: false } }, // Find records without isActive field
      { 
        $set: { 
          isActive: true,
          deletedAt: null,
          deletedBy: null
        } 
      }
    );

    console.log(`✅ Updated ${customerResult.modifiedCount} customers`);

    // Update all suppliers without isActive field
    const supplierResult = await supplierModel.updateMany(
      { isActive: { $exists: false } }, // Find records without isActive field
      { 
        $set: { 
          isActive: true,
          deletedAt: null,
          deletedBy: null
        } 
      }
    );

    console.log(`✅ Updated ${supplierResult.modifiedCount} suppliers`);

    console.log('\n📊 Migration Summary:');
    console.log(`   Customers updated: ${customerResult.modifiedCount}`);
    console.log(`   Suppliers updated: ${supplierResult.modifiedCount}`);
    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the migration
runMigration();
