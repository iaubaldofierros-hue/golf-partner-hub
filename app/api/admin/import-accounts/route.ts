import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

/**
 * Importación masiva de cuentas desde CSV o Excel (.xlsx/.xls).
 * Cada fila crea o actualiza una Cuenta (match por nombre) y, si trae
 * datos de contacto, crea el contacto principal en el mismo paso.
 */

const normalizeKey = (key: string) =>
  key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const HEADER_MAP: Record<string, string> = {
  name: "name", nombre: "name", cuenta: "name", hotel: "name", empresa: "name",
  accounttype: "accountType", tipo: "accountType", tipodecuenta: "accountType",
  businessorigin: "businessOrigin", origen: "businessOrigin", origendenegocio: "businessOrigin",
  country: "country", pais: "country",
  city: "city", ciudad: "city",
  zone: "zone", zona: "zone",
  address: "address", direccion: "address",
  website: "website", sitioweb: "website", web: "website",
  mainphone: "mainPhone", telefono: "mainPhone", phone: "mainPhone",
  mainemail: "mainEmail", email: "mainEmail", correo: "mainEmail",
  notes: "notes", notas: "notes",
  contactname: "contactFirstName", contacto: "contactFirstName",
  nombrecontacto: "contactFirstName", contactfirstname: "contactFirstName",
  contactlastname: "contactLastName", apellidocontacto: "contactLastName",
  contactemail: "contactEmail", emailcontacto: "contactEmail", correocontacto: "contactEmail",
  contactwhatsapp: "contactWhatsapp", whatsapp: "contactWhatsapp", whatsappcontacto: "contactWhatsapp",
  contactphone: "contactPhone", telefonocontacto: "contactPhone",
  contactposition: "contactPosition", puesto: "contactPosition", cargo: "contactPosition",
};

type Row = Record<string, string>;

function normalizeRow(raw: Record<string, unknown>): Row {
  const row: Row = {};
  for (const [key, value] of Object.entries(raw)) {
    const mapped = HEADER_MAP[normalizeKey(key)];
    if (!mapped) continue;
    const str = value == null ? "" : String(value).trim();
    if (str) row[mapped] = str;
  }
  return row;
}

async function parseFile(file: File): Promise<Row[]> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".csv")) {
    const text = buffer.toString("utf-8");
    const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
    return parsed.data.map(normalizeRow);
  }

  // .xlsx / .xls
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows.map(normalizeRow);
}

async function resolveLookup(model: "accountType" | "businessOrigin", name: string) {
  const existing = await (
    prisma[model] as unknown as { findFirst: (a: unknown) => Promise<{ id: string } | null> }
  ).findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) return existing.id;
  const created = await (
    prisma[model] as unknown as { create: (a: unknown) => Promise<{ id: string }> }
  ).create({ data: { name } });
  return created.id;
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  let rows: Row[];
  try {
    rows = await parseFile(file);
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo. Verifica que sea .csv, .xlsx o .xls válido." }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (!row.name) {
        errors.push({ row: i + 2, message: "Falta el nombre de la cuenta" });
        continue;
      }

      const accountTypeId = row.accountType ? await resolveLookup("accountType", row.accountType) : undefined;
      const businessOriginId = row.businessOrigin ? await resolveLookup("businessOrigin", row.businessOrigin) : undefined;

      const accountData = {
        ...(accountTypeId && { accountTypeId }),
        ...(businessOriginId && { businessOriginId }),
        ...(row.country && { country: row.country }),
        ...(row.city && { city: row.city }),
        ...(row.zone && { zone: row.zone }),
        ...(row.address && { address: row.address }),
        ...(row.website && { website: row.website }),
        ...(row.mainPhone && { mainPhone: row.mainPhone }),
        ...(row.mainEmail && { mainEmail: row.mainEmail }),
        ...(row.notes && { notes: row.notes }),
      };

      const existing = await prisma.account.findFirst({
        where: { name: { equals: row.name, mode: "insensitive" } },
      });

      if (existing) {
        await prisma.account.update({ where: { id: existing.id }, data: accountData });
        updated++;
      } else {
        await prisma.account.create({
          data: {
            name: row.name,
            ...accountData,
            contacts: row.contactFirstName
              ? {
                  create: {
                    firstName: row.contactFirstName,
                    lastName: row.contactLastName || null,
                    position: row.contactPosition || null,
                    email: row.contactEmail || null,
                    phone: row.contactPhone || null,
                    whatsapp: row.contactWhatsapp || null,
                  },
                }
              : undefined,
          },
        });
        created++;
      }
    } catch (err) {
      errors.push({ row: i + 2, message: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  return NextResponse.json({ total: rows.length, created, updated, errors });
}
