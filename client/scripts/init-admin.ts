import { createInitialAdminUser } from '../src/lib/auth';

async function main() {
  console.log('Initializing admin user...');
  await createInitialAdminUser();
  console.log('Admin user initialization complete!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error initializing admin user:', error);
  process.exit(1);
});
