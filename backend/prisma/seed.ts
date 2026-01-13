import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.tipster.create({
    data: {
      displayName: "BetMaster Pro",
      bio: "10 ans à analyser les matchs NBA",
    },
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
