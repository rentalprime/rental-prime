const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function seedRoles() {
  try {
    console.log('🌱 Starting role seeding...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../database/seed_roles.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await db.query(sql);
    
    console.log('✅ Roles seeded successfully!');
    
    // Verify roles were created
    const result = await db.query('SELECT name, description, is_system_role FROM roles ORDER BY name');
    console.log('\n📋 Available roles:');
    result.rows.forEach(role => {
      console.log(`  - ${role.name}: ${role.description} ${role.is_system_role ? '(System Role)' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
    process.exit(1);
  }
}

seedRoles();
