import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";

// El seed usa el adapter de pg estándar (conexión directa)
const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // ─── Usuario Admin inicial ────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@empresa.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcryptjs.hash("Admin1234!", 12);

    await prisma.user.create({
      data: {
        email: "admin@empresa.com",
        password: hashedPassword,
        nombre: "Administrador",
        rol: "ADMIN",
        activo: true,
      },
    });

    console.log("✅ Usuario admin creado: admin@empresa.com / Admin1234!");
    console.log("⚠️  IMPORTANTE: Cambia la contraseña después del primer login");
  } else {
    console.log("ℹ️  Usuario admin ya existe, saltando creación");
  }

  // ─── Empresa de ejemplo ───────────────────────────────────
  const existingEmpresa = await prisma.empresa.count();

  if (existingEmpresa === 0) {
    await prisma.empresa.create({
      data: {
        nombre: "Mi Empresa S.A.",
        ruc: "1790012345001",
        direccion: "Av. Principal 123, Quito, Ecuador",
        telefono: "02-2345678",
        correo: "info@miempresa.com",
        emisorNombre: "Juan Pérez",
        emisorCargo: "Gerente Comercial",
        emisorCelular: "0991234567",
      },
    });
    console.log("✅ Empresa de ejemplo creada");
  }

  // ─── Productos de ejemplo ─────────────────────────────────
  const productoCount = await prisma.producto.count();

  if (productoCount === 0) {
    const productos = [
      {
        sku: "PROD-000001",
        nombre: "Consultoría de Software",
        descripcion: "Servicio de consultoría técnica por hora",
        precioUnitario: 80.0,
        ivaAplicable: 15.0,
        activo: true,
      },
      {
        sku: "PROD-000002",
        nombre: "Desarrollo Web",
        descripcion: "Desarrollo de aplicaciones web a medida",
        precioUnitario: 1500.0,
        ivaAplicable: 15.0,
        activo: true,
      },
      {
        sku: "PROD-000003",
        nombre: "Soporte Técnico",
        descripcion: "Soporte técnico mensual",
        precioUnitario: 200.0,
        ivaAplicable: 0.0,
        activo: true,
      },
    ];

    await prisma.producto.createMany({ data: productos });
    console.log(`✅ ${productos.length} productos de ejemplo creados`);
  }

  console.log("🎉 Seed completado exitosamente!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
