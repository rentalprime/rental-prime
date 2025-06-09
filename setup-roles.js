const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define roles with their permissions
const roles = [
  {
    name: 'super_admin',
    description: 'Oversees entire platform',
    permissions: {
      users: { create: true, read: true, update: true, delete: true },
      roles: { create: true, read: true, update: true, delete: true },
      settings: { create: true, read: true, update: true, delete: true },
      analytics: { read: true },
      audit_logs: { read: true },
      categories: { create: true, read: true, update: true, delete: true },
      listings: { create: true, read: true, update: true, delete: true },
      bookings: { create: true, read: true, update: true, delete: true },
      payments: { create: true, read: true, update: true, delete: true },
      support: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true }
    },
    is_system_role: true,
    status: 'active'
  },
  {
    name: 'admin',
    description: 'Manages portal operations',
    permissions: {
      users: { read: true, update: true },
      categories: { create: true, read: true, update: true, delete: true },
      listings: { create: true, read: true, update: true, delete: true, approve: true },
      vendors: { approve: true, read: true },
      disputes: { handle: true, read: true },
      bookings: { read: true, update: true },
      settings: { read: true, update: true }
    },
    is_system_role: true,
    status: 'active'
  },
  {
    name: 'vendor',
    description: 'Lists and manages own rental items',
    permissions: {
      listings: { 
        create: true, 
        read: true, 
        update: { own: true }, 
        delete: { own: true }
      },
      bookings: { 
        read: { own: true }
      },
      pricing: { 
        create: { own: true }, 
        read: { own: true }, 
        update: { own: true }
      },
      availability: { 
        create: { own: true }, 
        read: { own: true }, 
        update: { own: true }
      },
      profile: { 
        read: { own: true }, 
        update: { own: true }
      }
    },
    is_system_role: true,
    status: 'active'
  },
  {
    name: 'customer',
    description: 'Browses and rents items',
    permissions: {
      listings: { read: true },
      bookings: { 
        create: true, 
        read: { own: true }, 
        update: { own: true, status: ['cancel'] }
      },
      reviews: { 
        create: { completed_bookings: true }, 
        read: true, 
        update: { own: true }, 
        delete: { own: true }
      },
      profile: { 
        read: { own: true }, 
        update: { own: true }
      }
    },
    is_system_role: true,
    status: 'active'
  },
  {
    name: 'support',
    description: 'Provides customer/vendor assistance',
    permissions: {
      users: { read: true },
      bookings: { read: true, update: { status: ['cancel'] } },
      tickets: { create: true, read: true, update: true },
      refunds: { create: true, read: true },
      messages: { create: true, read: true }
    },
    is_system_role: true,
    status: 'active'
  },
  {
    name: 'accountant',
    description: 'Handles financial reconciliations',
    permissions: {
      transactions: { read: true },
      payouts: { create: true, read: true },
      reports: { create: true, read: true },
      invoices: { create: true, read: true, update: true }
    },
    is_system_role: true,
    status: 'active'
  }
];

// Main function to set up roles
async function setupRoles() {
  try {
    console.log('Starting role setup...');
    
    // Clear existing roles (except those already in use)
    console.log('Checking for existing roles...');
    const { data: existingRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*');
    
    if (rolesError) {
      console.error('Error fetching existing roles:', rolesError);
      return;
    }
    
    // Insert or update each role
    for (const role of roles) {
      const existingRole = existingRoles?.find(r => r.name === role.name);
      
      if (existingRole) {
        console.log(`Updating existing role: ${role.name}`);
        const { data, error } = await supabase
          .from('roles')
          .update({
            description: role.description,
            permissions: role.permissions,
            is_system_role: role.is_system_role,
            status: role.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRole.id)
          .select();
        
        if (error) {
          console.error(`Error updating role ${role.name}:`, error);
        } else {
          console.log(`Successfully updated role ${role.name}`);
        }
      } else {
        console.log(`Creating new role: ${role.name}`);
        const { data, error } = await supabase
          .from('roles')
          .insert([{
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            is_system_role: role.is_system_role,
            status: role.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
        
        if (error) {
          console.error(`Error creating role ${role.name}:`, error);
        } else {
          console.log(`Successfully created role ${role.name}`);
        }
      }
    }
    
    // Verify roles setup
    console.log('\n--- VERIFYING ROLES SETUP ---');
    const { data: finalRoles, error: finalError } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });
    
    if (finalError) {
      console.error('Error verifying roles:', finalError);
    } else {
      console.log(`Found ${finalRoles.length} roles in the database:`);
      finalRoles.forEach(role => {
        console.log(`- ${role.name}: ${role.description}`);
      });
    }
    
    console.log('\nRoles setup completed!');
    
  } catch (err) {
    console.error('Unexpected error during roles setup:', err);
  }
}

// Run the setup
setupRoles();
