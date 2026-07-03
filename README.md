# Golf Partner Hub

CRM comercial especializado para campo de golf. Administra cuentas B2B (concierges, hoteles, DMC, tour operadores, agencias, wedding/meeting planners), contactos, promociones, actividades y oportunidades — operando por **WhatsApp, Email y Teléfono**.

Principio central: **el operador entra y de inmediato sabe qué hacer** (pantalla "Mi Día"). Cada acción comercial frecuente en máximo 3 clics.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL · NextAuth · React Hook Form + Zod · Recharts · Anthropic API (copies IA) · Resend (email) · Vercel.

## Instalación

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
# Edita DATABASE_URL (Neon/Supabase/local), NEXTAUTH_SECRET y ANTHROPIC_API_KEY

# 3. Base de datos
npx prisma db push      # crea tablas
npm run db:seed          # catálogos + usuario admin + cuenta demo

# 4. Desarrollo
npm run dev
```

Usuario inicial: `admin@golfpartnerhub.com` / `Cambiar123!` (cámbialo de inmediato).

## Deploy en Vercel

1. Sube el repo a GitHub y conéctalo en Vercel.
2. Configura las variables de `.env.example` en el proyecto.
3. Usa Neon o Supabase como PostgreSQL (connection pooling recomendado).
4. El build ya ejecuta `prisma generate`.

## Estructura

```
app/
  (auth)/login            Login con roles (Admin, Sales Director, Sales Manager, Marketing, Viewer)
  (dashboard)/
    dashboard             MI DÍA — vencidos, para hoy, sin contacto 30d, oportunidades, promos
    accounts              Lista con búsqueda + filtros de 1 clic · /new · /[id] ficha ejecutiva
    contacts, promotions, campaigns, activities, opportunities, reports, settings
  api/
    accounts, activities  CRUD con Zod
    ai/generate-copy      Copies comerciales con Claude (ES/EN, 7 tonos)
components/
  layout/                 AppSidebar (menú simple + nav móvil), Topbar (búsqueda global)
  shared/                 QuickActionButtons (WhatsApp/Email/Llamar), Status/PriorityBadge, EmptyState
  activities/             QuickActivityForm (<30 seg), ActivityTimeline
  accounts/               AccountForm (esenciales + avanzados), AccountTabs
  dashboard/              FollowUpCard
lib/
  prisma, auth, utils, labels (enums→español), validations (Zod),
  whatsapp (wa.me + personalización {{variables}}), email (Resend), ai (Anthropic)
prisma/
  schema.prisma           18 modelos: User, Account, Contact, Activity, Promotion, Campaign,
                          CampaignRecipient, EmailEvent, Opportunity, Tag, AccountTag, ContactTag,
                          File, Task, Reminder, AuditLog, AccountType, BusinessOrigin
  seed.ts
```

## Flujo operativo clave (ya funcional)

1. **Mi Día** muestra seguimientos vencidos, de hoy y cuentas abandonadas (>30 días).
2. Cada tarjeta tiene botones **WhatsApp / Email / Llamar**.
3. Al usar un canal se abre `wa.me`, `mailto:` o `tel:` y aparece el **registro rápido** pre-llenado.
4. Guardar el seguimiento actualiza automáticamente `lastContactDate` y `nextFollowUpDate` de cuenta y contacto.
5. **Nueva cuenta rápida** crea cuenta + contacto principal + primer seguimiento en un solo formulario.

## Roadmap por fases

| Fase | Módulo | Estado |
|---|---|---|
| 1 | Estructura del proyecto | ✅ |
| 2 | Prisma schema completo (18 modelos) | ✅ |
| 3 | Layout: sidebar, topbar, nav móvil | ✅ |
| 4 | Mi Día (dashboard operador) | ✅ |
| 5 | CRUD Cuentas + ficha ejecutiva + filtros 1 clic | ✅ |
| 5b | Botones rápidos WhatsApp/Email/Tel + QuickActivityForm | ✅ |
| 6 | Contactos: vista global con búsqueda + API | ✅ |
| 7 | CRUD Promociones + Generar con IA + PromotionShareModal (WhatsApp) | ✅ |
| 8 | Vista global de Actividades | ⏳ timeline listo, falta página |
| 9 | Pipeline Kanban de Oportunidades | ⏳ modelo listo |
| 10 | Campañas de email (Resend) + Import/Export CSV + Dashboard Admin con Recharts | ⏳ servicios base listos |

## Próximos pasos sugeridos

- **Fase 8:** página global de actividades reutilizando `ActivityTimeline` con filtros por tipo/canal/fecha.
- **Fase 9:** Kanban de oportunidades — columnas por `OpportunityStage`, drag & drop opcional (o botones "mover etapa" para simplicidad móvil).
- **Import CSV:** usar `papaparse` (ya en dependencias) con validación de duplicados por email/teléfono/WhatsApp/nombre.
- **Middleware de auth:** proteger `(dashboard)` con `next-auth` middleware y ocultar Reportes/Configuración a roles no admin (`ADMIN_ROLES` en `lib/auth.ts`).
