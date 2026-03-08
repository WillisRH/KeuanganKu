import prisma from './lib/prisma';

async function main() {
  console.log('🗑️ Deleting all PrintLogs...');
  await prisma.printLog.deleteMany();
  
  console.log('🗑️ Deleting all Expenses...');
  await prisma.expense.deleteMany();
  
  console.log('✅ Database cleared successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
