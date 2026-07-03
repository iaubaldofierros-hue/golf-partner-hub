import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ACCOUNT_TYPES = [
  "Concierge", "Hotel", "Tour Operador", "DMC", "Agencia Nacional",
  "Agencia Internacional", "Wedding Planner", "Meeting Planner",
  "Vacation Club", "Grupo Corporativo", "Agencia MICE",
  "Socio Estratégico", "Cliente Directo", "Operador de Lujo",
];

const BUSINESS_ORIGINS = [
  "Concierges", "Hoteles", "Tour Operadores", "DMC", "Agencias Nacionales",
  "Agencias Internacionales", "Wedding Planners", "Meeting Planners",
  "Vacation Clubs", "Corporativo", "MICE", "Socios Estratégicos",
  "Directo", "Lujo",
];

async function main() {
  for (const name of ACCOUNT_TYPES) {
    await prisma.accountType.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of BUSINESS_ORIGINS) {
    await prisma.businessOrigin.upsert({ where: { name }, update: {}, create: { name } });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@golfpartnerhub.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@golfpartnerhub.com",
      passwordHash: await bcrypt.hash("Cambiar123!", 10),
      role: "ADMIN",
    },
  });

  // Cuenta demo para validar el flujo completo
  const hotelType = await prisma.accountType.findUnique({ where: { name: "Hotel" } });
  const hotelOrigin = await prisma.businessOrigin.findUnique({ where: { name: "Hoteles" } });

  const demo = await prisma.account.create({
    data: {
      name: "Hotel Demo Los Cabos",
      accountTypeId: hotelType?.id,
      businessOriginId: hotelOrigin?.id,
      country: "México",
      city: "Cabo San Lucas",
      status: "ACTIVE",
      priority: "HIGH",
      potentialLevel: "HIGH",
      preferredLanguage: "es",
      ownerId: admin.id,
      nextFollowUpDate: new Date(),
      contacts: {
        create: {
          firstName: "María",
          lastName: "González",
          position: "Chief Concierge",
          email: "concierge@hoteldemo.com",
          whatsapp: "526241234567",
          preferredChannel: "WHATSAPP",
        },
      },
    },
  });

  console.log("Seed completo ✔", { admin: admin.email, demo: demo.name });
}

main().finally(() => prisma.$disconnect());
