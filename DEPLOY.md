# 🚀 Poner Golf Partner Hub en línea (≈15 minutos, gratis)

Ruta recomendada: **GitHub + Neon (base de datos) + Vercel (hosting)**. Todo en planes gratuitos.

---

## Paso 1 — Sube el código a GitHub (3 min)

1. Descomprime `golf-partner-hub.zip` en tu computadora.
2. Entra a https://github.com/new y crea un repositorio privado llamado `golf-partner-hub` (no agregues README ni .gitignore).
3. En la terminal, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Golf Partner Hub v1"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/golf-partner-hub.git
git push -u origin main
```

## Paso 2 — Crea la base de datos en Neon (3 min)

1. Entra a https://neon.tech → **Sign up** (con tu cuenta de GitHub es un clic).
2. Crea un proyecto: nombre `golf-partner-hub`, región **US West (Oregon)** (la más cercana a Los Cabos).
3. En el dashboard copia la **Connection string** (empieza con `postgresql://…`). Esa es tu `DATABASE_URL`.

## Paso 3 — Crea las tablas y el usuario admin (3 min)

En tu computadora, dentro de la carpeta del proyecto:

```bash
npm install
cp .env.example .env
# Edita .env y pega tu DATABASE_URL de Neon

npx prisma db push     # crea las 18 tablas en Neon
npm run db:seed        # tipos de cuenta, orígenes, admin y cuenta demo
```

Login inicial: `admin@golfpartnerhub.com` / `Cambiar123!` (cámbialo después).

## Paso 4 — Despliega en Vercel (5 min)

1. Entra a https://vercel.com → **Sign up** con tu cuenta de GitHub.
2. **Add New → Project** → importa el repo `golf-partner-hub`.
3. Vercel detecta Next.js automáticamente. Antes de dar Deploy, abre **Environment Variables** y agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Tu connection string de Neon |
| `NEXTAUTH_URL` | `https://golf-partner-hub.vercel.app` (o tu dominio) |
| `NEXTAUTH_SECRET` | Genera uno con `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | Tu key de https://console.anthropic.com (para "Generar con IA") |
| `RESEND_API_KEY` | *(opcional, para campañas de email en fase 10)* |
| `EMAIL_FROM` | *(opcional)* ej. `ventas@solmargolflinks.com` |

4. Clic en **Deploy**. En ~2 minutos tendrás la app en `https://golf-partner-hub.vercel.app`.

> El `package.json` ya incluye `postinstall: prisma generate` y `build: prisma generate && next build`, así que el build de Vercel funciona sin configuración extra.

## Paso 5 — Verifica

1. Abre la URL → login con el admin del seed.
2. **Mi Día** debe cargar con la cuenta demo "Hotel Demo Los Cabos".
3. Crea una promoción → botón **Generar con IA** → si configuraste `ANTHROPIC_API_KEY`, tendrás el WhatsApp y el script de llamada en segundos.
4. Prueba **Enviar** desde una promoción activa → debe abrir WhatsApp con el mensaje personalizado.

## Dominio propio (opcional)

En Vercel → Settings → Domains puedes conectar algo como `crm.solmargolflinks.com` o `hub.foundincabo.com` agregando un registro CNAME en tu DNS.

## Actualizaciones futuras

Cada `git push` a `main` redespliega automáticamente. Ideal para seguir construyendo las fases 8–10 con Claude Code sobre el mismo repo.

---

**Costos:** $0/mes en los planes gratuitos de Neon (0.5 GB — miles de cuentas y actividades) y Vercel (hobby). El único costo variable es el API de Anthropic por los copies generados (centavos por generación).
