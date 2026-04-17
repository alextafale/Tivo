# TIVO Backend — README

## 🚀 Inicio rápido

### Prerrequisitos
- Node.js v20+
- Docker + Docker Compose
- API Key de DashScope (Qwen)

---

## 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y agrega tu `DASHSCOPE_API_KEY`:
```
DASHSCOPE_API_KEY=sk-tu-key-aqui
```

Obtén tu key en: https://dashscope.aliyuncs.com → Consola → API Keys

---

## 2. Levantar PostgreSQL con Docker

```bash
# Desde la raíz del proyecto (talvi/)
docker-compose up postgres -d
```

Esto levanta PostgreSQL en `localhost:5432` con:
- Usuario:   `tivo`
- Password:  `tivopass`
- Base de datos: `tivo_db`

---

## 3. Aplicar schema y seed

```bash
cd backend/

# Crear las tablas
npm run db:push

# Poblar con datos demo
npm run db:seed
```

El seed imprime el **Business ID** — cópialo al `.env` si quieres usarlo en desarrollo.

---

## 4. Iniciar el backend

```bash
npm run dev
```

El servidor corre en: **http://localhost:3000**

Verifica: http://localhost:3000/health

---

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/products` | Lista productos |
| POST | `/api/sales` | Registrar venta |
| GET | `/api/dashboard/metrics` | KPIs del día |
| POST | `/api/ai/chat` | **Chatbot Qwen** |
| POST | `/api/ai/recommend` | **Recomendaciones IA** |
| GET | `/api/ai/alerts` | **Alertas de stock IA** |

---

## Conectar el app React Native

En `src/infrastructure/api/apiClient.ts`, cambia la IP si usas dispositivo físico:
```ts
const MACHINE_IP = '192.168.1.100'; // ← tu IP local
```

El app sigue funcionando con **datos mock** mientras el backend no esté disponible.

---

## Despliegue con Docker completo

```bash
# Desde talvi/ (raíz)
docker-compose up -d
```

Esto levanta tanto PostgreSQL como el backend en contenedores.

---

## Modelo Qwen

- **Modelo**: `qwen-plus` (accesible via DashScope)
- **Modo de thinking**: disponible en modelos compatibles con `enable_thinking: true`
- El sistema prompt incluye automáticamente el inventario y ventas del negocio

Para cambiar el modelo, edita en `.env`:
```
QWEN_MODEL=qwen-max   # más potente, más lento
QWEN_MODEL=qwen-turbo # más rápido, menos capaz
QWEN_MODEL=qwen-plus  # balance ideal (recomendado)
```
