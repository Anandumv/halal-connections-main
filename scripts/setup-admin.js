// Admin Setup Script for THE BEE HIVE
// This script helps you set up admin users

console.log('🐝 THE BEE HIVE - Admin Setup');
console.log('================================');

console.log('\n📋 To add an admin user, follow these steps:');
console.log('\n1. First, create a user account through the normal signup process');
console.log('2. Get the user ID from Supabase Auth dashboard');
console.log('3. Run this SQL command in your Supabase SQL editor:');
console.log('\n   INSERT INTO admins (id, email, created_at) VALUES');
console.log('   (\'YOUR_USER_ID_HERE\', \'your-email@example.com\', NOW());');
console.log('\n4. Replace YOUR_USER_ID_HERE with the actual user ID');
console.log('5. Replace your-email@example.com with the actual email');

console.log('\n🔍 To find your user ID:');
console.log('1. Go to Supabase Dashboard');
console.log('2. Navigate to Authentication > Users');
console.log('3. Find your user and copy the ID');

console.log('\n✅ After adding the admin user, they will be able to:');
console.log('- Access the admin dashboard at /admin');
console.log('- Manage all users and profiles');
console.log('- Create and manage matches');
console.log('- Generate invite codes');
console.log('- Verify user profiles');

console.log('\n🚀 Default invite codes available:');
console.log('- WELCOME1, WELCOME2, WELCOME3, WELCOME4, WELCOME5');
console.log('- BEEHIVE1, BEEHIVE2, BEEHIVE3, BEEHIVE4, BEEHIVE5');
console.log('- MATCH1, MATCH2, MATCH3, MATCH4, MATCH5');
console.log('- FAMILY1, FAMILY2, FAMILY3');
console.log('- HALAL1, HALAL2, HALAL3');
console.log('- ISLAM1, ISLAM2, ISLAM3');

console.log('\n🎯 Quick SQL to add yourself as admin:');
console.log('-- Replace with your actual user ID and email');
console.log('INSERT INTO admins (id, email, created_at) VALUES');
console.log('(\'your-user-id-here\', \'your-email@example.com\', NOW());');

console.log('\n🔧 If you need to check existing admins:');
console.log('SELECT * FROM admins;');

console.log('\n🗑️ If you need to remove an admin:');
console.log('DELETE FROM admins WHERE id = \'user-id-to-remove\';');

console.log('\n✨ Setup complete! Happy admin-ing! 🐝'); 