# Análisis de cumplimiento de requisitos

**Proyecto:** Sistema Web de Gestión y Administración de Ministerios, Miembros y Actividades de una Iglesia (C.E. Filadelfia)  
**Documentos revisados:** `PROYECTO_ingeniera_software.pdf` (39 páginas) y `Requisitos_V1.pdf` (6 páginas)  
**Fecha del análisis:** 26/10/2026  
**Método:** extracción de texto de ambos PDF, revisión estática del frontend/backend, ejecución de `npm run lint`, `npm run build` y `npm start`.

---

## 0. Correcciones aplicadas en esta sesión

Tras el análisis, se corrigieron los siguientes puntos para acercar el proyecto al cumplimiento:

1. **Módulo económico completo** (nuevo): entidad `movimientos_economicos`, servicio, controlador, rutas REST (`/api/economic`, `/api/economic/balance`, `/api/economic/balance/anual`) y página `EconomiaTab.tsx` con registro de ingresos/egresos/ofrendas, consolidación mensual/anual y cálculo de saldo.
2. **Conflictos de actividades**: se agregaron `hora_inicio` y `hora_fin` a la entidad y al formulario; se implementó `detectarConflicto()` que valida solapamiento de intervalos para el mismo espacio o responsable antes de guardar. Se agregaron `presupuesto` y `costo_real` por actividad, con cálculo de variación.
3. **Inventario corregido**: estados pasaron a `disponible`, `en_uso`, `dano`, `mantenimiento`; se agregó campo `ubicacion`; se permitió asignar bienes a ministerio y a grupo de crecimiento. Las vistas de ministerio y grupo ahora reflejan inventario asignado.
4. **RBAC real con JWT**: roles cambiados a `pastor`, `secretaria`, `tesorero`; se implementaron `JwtAuthGuard` y `RolesGuard` con decorador `@Roles()`; se aplicaron guards a todos los controladores; el login devuelve un token JWT; el frontend envía `Authorization: Bearer <token>` en todas las peticiones y filtra el menú por rol.
5. **Seguridad**: se eliminó la contraseña del payload de login y del listado de usuarios; se agregó migración de roles antiguos (`admin`/`líder` → `pastor`); credencial semilla actualizada a `pastor`.
6. **Arranque de producción**: se corrigió la ruta wildcard de Express 5 en `main.ts`; `npm start` ahora arranca correctamente.
7. **Lint**: se corrigió el error TS2367 en `MiembrosTab.tsx` y otros errores de tipos derivados del cambio de roles.
8. **Docker**: se agregó `Dockerfile` y se corrigieron las variables de entorno (`DB_USER`, `DB_NAME`, `JWT_SECRET`) en `docker-compose.yml`.
9. **Base de datos**: fallback SQLite cambiado a `type: 'sqlite'` (sin dependencia `better-sqlite3`); `database.config.ts` acepta nombres de variables alternativos para Docker; se agregó la entidad `EconomicMovementEntity`.
10. **Dashboard**: se corrigió el uso de `hora` → `hora_inicio`.

**Estado tras las correcciones:** `npm run lint` y `npm run build` pasan sin errores; `npm start` arranca correctamente; el login devuelve token y el RBAC bloquea/permite por rol (verificado con pruebas manuales).

---

## 1. Veredicto general

**El proyecto no cumple completamente con ninguno de los dos documentos.** Implementa una base funcional de CRUD (miembros, ministerios, grupos, inventario, actividades y usuarios), autenticación con contraseña cifrada, dashboard y reportes PDF por módulo. Sin embargo, faltan los procesos centrales del negocio:

- No existe módulo económico: ingresos, egresos, ofrendas, saldos, presupuestos ni comparación presupuesto/costo real.
- No existe detección de conflictos de horario/espacio/responsable.
- No existe control de acceso por roles ni protección de la API.
- No existe respaldo/recuperación.
- No existe historial anual de juntas directivas.
- El inventario no usa los estados de disponibilidad exigidos ni registra ubicación.
- No hay pruebas automatizadas ni evidencia de Scrum.

Además, **los dos documentos se contradicen entre sí** en puntos clave, por lo que es imposible cumplir ambos al 100 % sin una decisión formal del cliente/docente (ver sección 2).

---

## 2. Contradicciones entre los dos documentos

| Tema | `Requisitos_V1.pdf` | `PROYECTO_ingeniera_software.pdf` | Lo que hace el código |
|---|---|---|---|
| Ministerios por miembro | Máximo **un** ministerio y un grupo (RF01, RD01). | El miembro puede pertenecer a **varios** ministerios y a **un** grupo (RD01, RD05, Fase 3 RF01). La entrevista P5 permite varios, con máximo 3 como líder. | Permite hasta **3** ministerios y **un** grupo (`MiembrosTab.tsx`, líneas 894-947 y 1035-1079). |
| Niveles de discipulado 101-501 | **Obligatorios** (RF02, RD02). | **Excluidos** de la primera versión (páginas 23 y 25). | Se incluyen como checkboxes 101-501 (`MiembrosTab.tsx`, líneas 998-1031). |
| Conflicto de actividades | Mismo espacio **o responsable** (RF03). | Mismo espacio físico (Fase 3 RF03); la Fase 2 habla de espacio y horario. | No se valida ninguno. |
| Inventario | Estado: disponible, en uso, dañado, mantenimiento (RF05). | Cantidad, estado y **ubicación** (RF09/RF05). | Estado físico Nuevo/Bueno/Mal, sin ubicación ni disponibilidad (`InventarioTab.tsx`, línea 32; `inventory.entity.ts`, líneas 17-18). |
| Reportes | Consolidados de miembros, ministerios, actividades, inventario y economía, con KPIs (RF06). | Informes consolidados de miembros, juntas, actividades, bienes y situación económica (RF10). | PDF por módulo y dashboard de miembros; sin economía ni consolidado real. |
| Rotación anual de juntas | No se detalla. | Obligatoria, con historial de liderazgo (RD08/RD02). | No implementada. |

**Conclusión de esta sección:** el código sigue parcialmente la versión final del documento de 39 páginas (varios ministerios, un grupo), pero incluye discipulado que ese documento excluye y no cumple la regla de un solo ministerio de `Requisitos_V1.pdf`. Antes de corregir, debe definirse la línea base oficial.

---

## 3. Matriz de cumplimiento — `Requisitos_V1.pdf`

Leyenda: ✅ cumple · 🟡 parcial · ❌ no cumple · ⚪ no verificable.

### 3.1 Requisitos funcionales

| Código | Requisito | Estado | Evidencia / brecha |
|---|---|---|---|
| RF01 | Gestionar miembros y validar máximo un grupo y un ministerio, sin duplicados. | ❌ | CRUD de miembros existe, y el grupo es único (`MiembrosTab.tsx`, 894-947; `member.entity.ts`, 59-60). Pero se permiten hasta 3 ministerios (1035-1079), lo que contradice “máximo un ministerio”. No se valida C.I. duplicada ni hay restricción única en base de datos (`member.entity.ts`, 38-39; `members.service.ts`, 21-24). |
| RF02 | Visualizar composición de ministerios y grupos con miembros, discipulado y juntas directivas. | 🟡 | Grupos: lista miembros con cursos de discipulado y junta (`GruposTab.tsx`, 387-467). Ministerios: lista miembros y junta, pero **no muestra el nivel de discipulado** (`MinisteriosTab.tsx`, 385-417). |
| RF03 | Planificar actividades, impedir simultaneidad en mismo espacio o responsable y calcular variación presupuesto/costo real. | ❌ | Solo hay fecha, una hora, lugar y responsable (`ActividadesTab.tsx`, 41-50). No hay hora de fin, no hay detección de cruces y no existen presupuesto ni costo real (`activity.entity.ts`, 8-33). |
| RF04 | Calcular balance económico del período (ingresos + ofrendas − egresos). | ❌ | No existe entidad, endpoint ni pantalla de finanzas. `app.module.ts` solo registra usuarios, auth, miembros, ministerios, grupos, inventario, actividades y dashboard (líneas 15-22). |
| RF05 | Controlar estado/disponibilidad del inventario: disponible, en uso, dañado, mantenimiento. | ❌ | El campo `estado` solo admite `Nuevo`, `Bueno`, `Mal` (`inventory.entity.ts`, 17-18; `InventarioTab.tsx`, 32). No existen los cuatro estados exigidos ni un campo de disponibilidad. |
| RF06 | Generar reportes consolidados e indicadores de miembros, ministerios, actividades, inventario y economía. | 🟡 | Hay PDF por módulo (miembros, ministerios, grupos, inventario, actividades, usuarios) y dashboard demográfico. No hay reporte consolidado entre módulos, ni indicadores de actividades/inventario, y falta por completo economía. |

### 3.2 Requisitos no funcionales

| Código | Requisito | Estado | Evidencia / brecha |
|---|---|---|---|
| RNF01 | Restringir funcionalidades según roles Pastor, Secretaría y Tesorero. | ❌ | Los roles del sistema son `admin`, `líder` y `pastor` (`user.entity.ts`, 26-27), no los tres roles exigidos. No hay guards, JWT ni sesión: todos los endpoints son públicos (`members.controller.ts`, 12-41; `auth.module.ts`, 6-12). El menú muestra todos los módulos a cualquier usuario (`App.tsx`, 44-52 y 221-227). |
| RNF02 | Consultas consolidadas en máximo 3 segundos. | ⚪ | No hay paginación, índices, pruebas de carga ni medición. El frontend descarga todas las tablas al iniciar sesión (`AppContexto.tsx`, 76-94). Con 930 miembros podría funcionar, pero no está garantizado ni verificado. |
| RNF03 | Integridad: evitar asignaciones duplicadas y registros inconsistentes. | ❌ | Las validaciones son solo de interfaz; el backend acepta cualquier `Partial<Entity>` sin DTO ni validación (`members.controller.ts`, 17-19; `members.service.ts`, 21-24). No hay claves foráneas, unicidad de C.I. ni validación de ids de grupo/ministerio. |
| RNF04 | Respaldos periódicos y recuperación. | ❌ | No hay scripts, cron, endpoint ni servicio de backup. Solo existe el volumen de Docker para MySQL (`docker-compose.yml`, 15-16), que no es un respaldo. |
| RNF05 | Arquitectura multicapa. | ✅ | Frontend React (presentación), backend NestJS con controladores/servicios (negocio) y TypeORM/MySQL (datos). La separación existe, aunque sin DTOs ni capa de validación formal. |

### 3.3 Requisitos de dominio

| Código | Requisito | Estado | Evidencia / brecha |
|---|---|---|---|
| RD01 | Máximo un grupo y un ministerio por período. | ❌ | Un grupo: sí (`id_grupo` único). Un ministerio: no (hasta 3). No existe campo de período/ciclo, por lo que tampoco se puede aplicar “por período”. |
| RD02 | Niveles de discipulado 101, 201, 301, 401 y 501. | 🟡 | La interfaz solo ofrece esos valores (`MiembrosTab.tsx`, 998-1031), pero son casillas de cursos completados, no un nivel único actual. El backend no valida el dominio (`member.entity.ts`, 80-81). |
| RD03 | Junta directiva con Líder Principal, Secretario, Tesorero y Vocales. | 🟡 | Existen los campos (`ministry.entity.ts`, 17-30; `group.entity.ts`, 11-24), pero solo el líder es obligatorio; secretario, tesorero y vocales pueden quedar vacíos (`MinisteriosTab.tsx`, 109-112; `GruposTab.tsx`, 98-101). |
| RD04 | Los grupos de crecimiento no administran movimientos financieros. | ✅* | Se cumple “por ausencia”: no hay módulo financiero para nadie. No existe una restricción implementada que diferencie grupos de ministerios. |
| RD05 | Actividades con período de ejecución y espacio definido para detectar conflictos. | ❌ | Hay fecha, una hora y lugar, pero no hora de fin; sin intervalo completo no puede detectarse un cruce (`ActividadesTab.tsx`, 41-50; `activity.entity.ts`, 17-18). |
| RD06 | Actividades con presupuesto proyectado y costo real ejecutado. | ❌ | No existen esos campos ni cálculos (`activity.entity.ts`, 8-33). |

**Resumen `Requisitos_V1.pdf`:** 2 ✅ (uno de ellos por ausencia), 4 🟡, 10 ❌, 1 ⚪.

---

## 4. Matriz de cumplimiento — `PROYECTO_ingeniera_software.pdf`

Se evalúa la **Fase 3 (especificación final)** y, además, los requisitos de la Fase 2 que no quedaron reflejados en ella.

### 4.1 Requisitos funcionales finales (Fase 3)

| Código | Requisito | Estado | Evidencia / brecha |
|---|---|---|---|
| RF01 | Gestionar miembros y vincularlos a varios ministerios y un único grupo. | ✅ | CRUD completo; un grupo por miembro y hasta 3 ministerios (`MiembrosTab.tsx`, 894-947 y 1035-1079; `member.entity.ts`, 59-60 y 83-84). |
| RF02 | Iniciar sesión con correo y contraseña. | 🟡 | El backend acepta usuario **o** correo y valida con bcrypt (`auth.service.ts`, 13-36), pero no emite token/sesión, la API queda abierta y la respuesta del login devuelve el hash de la contraseña (`auth.controller.ts`, 20-24). |
| RF03 | Agendar actividades detectando conflictos en el mismo espacio y calcular variación presupuesto/costo real. | ❌ | No hay hora de fin, ni detección de conflictos, ni presupuesto/costo real (`ActividadesTab.tsx`, 41-50 y 139-158). |
| RF04 | Gestionar ingresos/egresos de ministerios, consolidar ofrendas y calcular saldo mensual/anual. | ❌ | No existe módulo económico ni entidades de movimiento/ofrenda. |
| RF05 | Controlar bienes por cantidad, estado y ubicación, con consultas individuales y consolidadas. | ❌ | Cantidad sí; estado es físico (Nuevo/Bueno/Mal), no disponibilidad; **no hay ubicación**; no se puede asignar un bien a un grupo desde el formulario (`InventarioTab.tsx`, 27-38 y 147-159), aunque la entidad tenga `id_grupo` (`inventory.entity.ts`, 35-36). |

### 4.2 Requisitos no funcionales finales

| Código | Requisito | Estado | Evidencia / brecha |
|---|---|---|---|
| RNF01 | Roles Pastor, Secretario y Tesorero con accesos diferenciados. | ❌ | Roles inexistentes (`admin`, `líder`, `pastor`) y ausencia total de autorización en backend y frontend. |
| RNF02 | Consultas consolidadas ≤ 3 s. | ⚪ | Sin pruebas ni optimización; se cargan todas las tablas en el cliente. |
| RNF03 | Integridad y consistencia; evitar fichas duplicadas. | ❌ | Sin validación de servidor, sin unicidad de C.I., sin claves foráneas y con `synchronize: true` (`database.config.ts`, 34). |
| RNF04 | Respaldo y recuperación periódicos. | ❌ | No implementado. |
| RNF05 | Arquitectura multicapa escalable. | ✅ | Capas React / NestJS / TypeORM presentes. |

### 4.3 Requisitos de dominio finales

| Código | Requisito | Estado | Evidencia / brecha |
|---|---|---|---|
| RD01 | Varios ministerios y un grupo dentro del mismo ciclo organizativo. | 🟡 | Varios ministerios y un grupo: sí. No existe el concepto de ciclo/período, por lo que no se puede garantizar “dentro del mismo ciclo”. |
| RD02 | Juntas directivas anuales rotativas con Líder, Secretario, Tesorero y Vocales. | ❌ | No hay año/período, no hay historial de juntas y los cargos no son obligatorios. El “historial de liderazgo” es un texto libre en el miembro (`member.entity.ts`, 68-69). |
| RD03 | Grupos de crecimiento sin movimientos financieros. | ✅* | Se cumple por ausencia de módulo financiero; no hay una restricción explícita. |
| RD04 | Actividad con espacio, fecha, hora de inicio y fin. | ❌ | Solo hay una hora; falta la hora de fin (`activity.entity.ts`, 17-18). |
| RD05 | Presupuesto proyectado y costo real por actividad. | ❌ | No existen. |

### 4.4 Requisitos de la Fase 2 no cubiertos por la Fase 3

| Requisito de la Fase 2 | Estado | Comentario |
|---|---|---|
| RF04: controlar juntas directivas, cargos ocupados/pendientes e historial de liderazgo. | ❌ | Solo se guarda la junta actual; no hay cargos pendientes ni historial estructurado. |
| RF05: detectar conflictos cuando dos actividades se superponen en el mismo espacio. | ❌ | No hay validación. |
| RF06: diferencia entre presupuesto proyectado y costo real. | ❌ | No hay campos ni cálculo. |
| RF07: ingresos/egresos de ministerios y saldo. | ❌ | No existe módulo económico. |
| RF08: consolidar ofrendas de sábado y domingo por mes/año. | ❌ | No existe registro de ofrendas. |
| RF09: bienes por tipo, cantidad, estado y ubicación. | ❌ | Falta ubicación y el estado no es de disponibilidad. |
| RF10: informes consolidados de miembros, juntas, actividades, bienes y economía. | 🟡 | Hay PDF por módulo y dashboard de miembros, pero no un consolidado integral ni economía. |
| RD02: grupos de mayores y jóvenes. | ✅ | Campo `categoria` y filtros por categoría (`group.entity.ts`, 32-33; `GruposTab.tsx`). |
| RD04: estado de bautismo. | ✅ | Campo booleano y fechas/lugar (`member.entity.ts`, 50-57). |
| RD07: tesorero responsable económico; ministerios con movimientos; ofrendas centrales. | ❌ | No existe el rol Tesorero ni el módulo. |
| RD08: rotación anual e historial de juntas. | ❌ | No implementado. |
| Alcance: carga de documentos/evidencias de actividades. | ❌ | No hay carga de archivos ni campo de evidencia. |
| Dashboard con misión/visión, bautizados por sexo, rangos de edad por sexo, simpatizantes, actividades de la semana y grupos que se reúnen. | 🟡 | Misión/visión y totales existen. Los desgloses por sexo se calculan pero no se muestran; “actividades de la semana” son las primeras 5 sin filtrar por semana; los grupos no tienen horario de reunión (`Dashboard.tsx`, 12-73). |

**Resumen del documento de 39 páginas (Fase 3):** 3 ✅ (uno por ausencia), 2 🟡, 9 ❌, 1 ⚪.

---

## 5. Modelos matemáticos exigidos

El proyecto de la materia pide implementar modelos matemáticos asociados a cada requisito. El código solo cubre una parte menor:

| Modelo | Requisito asociado | Estado |
|---|---|---|
| Teoría de conjuntos / funciones parciales | Máximo un grupo/ministerio | 🟡 Solo límite de 3 ministerios en la interfaz; no hay validación formal ni de servidor. |
| Grafo acíclico dirigido (DAG) | Jerarquía de ministerios/grupos | ❌ No hay jerarquía ni relaciones padre-hijo. |
| Intersección de intervalos temporales | Conflictos de horario | ❌ No hay hora de inicio/fin ni intersección. |
| Ecuación de balance contable | Ingresos + ofrendas − egresos | ❌ No existe módulo económico. |
| Partición de estados de stock | Disponible/en uso/dañado/mantenimiento | ❌ Solo Nuevo/Bueno/Mal. |
| KPIs estadísticos y porcentuales | Reportes | 🟡 Solo porcentajes demográficos; sin KPIs de actividades, inventario o economía. |
| Matriz RBAC | Roles y permisos | ❌ No implementada. |
| Complejidad O(log n) | Consultas ≤ 3 s | ❌ Búsquedas lineales en cliente, sin índices ni paginación. |
| Invariante de estado lógico | Integridad | ❌ Validación solo en formularios; backend sin DTO/constraints. |
| RPO/RTO | Respaldos | ❌ No hay respaldos. |
| Función inyectiva por período | Un grupo/ministerio por período | 🟡 Un grupo sí; ministerios no; no hay período. |
| Dominio discreto finito | Niveles 101-501 | 🟡 Solo en la interfaz; sin validación de servidor. |
| Mapeo estructurado de roles | Junta directiva | 🟡 Campos existen, pero no son obligatorios ni hay historial. |
| Coordenadas espacio-temporales | Fecha, hora, lugar | 🟡 Fecha, una hora y lugar; falta hora de fin. |
| Restricción de dominio relacional | Grupos sin finanzas | ⚪ Se cumple por ausencia del módulo. |
| CPI (presupuesto/costo real) | Evaluación económica de actividades | ❌ No implementado. |

---

## 6. Hallazgos técnicos que afectan la entrega

### 6.1 El build de producción no arranca

`npm run build` termina correctamente, pero `npm start` falla con:

```
PathError [TypeError]: Missing parameter name at index 1: *
```

La causa está en `backend/src/main.ts`, líneas 41-43:

```ts
expressInstance.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});
```

NestJS 11 usa Express 5, cuya sintaxis de wildcard cambió. Debe usarse una ruta compatible (por ejemplo, un middleware `expressInstance.use(...)` o `/{*splat}` según la versión) y probar el arranque real en producción.

### 6.2 `npm run lint` falla

```
src/paginas/MiembrosTab.tsx(932,37): error TS2367:
This comparison appears to be unintentional because the types
'"Jóvenes" | "Mayores"' and '"Ninguno"' have no overlap.
```

Es un error de tipos en la condición `required={grupoCategoria !== 'Ninguno'}`. Debe corregirse antes de entregar.

### 6.3 Docker Compose no es ejecutable tal como está

- `docker-compose.yml` referencia `Dockerfile`, pero **no existe** `Dockerfile` en el repositorio (líneas 19-21).
- El servicio `app` define `DB_USERNAME` y `DB_DATABASE` (líneas 30-32), pero `database.config.ts` lee `DB_USER` y `DB_NAME` (líneas 13 y 30). En Docker, la aplicación no detectaría MySQL y caería al fallback SQLite.
- El fallback SQLite usa `better-sqlite3` (`database.config.ts`, 39), dependencia que **no está instalada** en `package.json` ni en `node_modules`. Sin MySQL, el arranque falla.
- La contraseña de MySQL está escrita en el compose y el `.env`; no debe versionarse.

### 6.4 Seguridad

- No hay autenticación de API: cualquier persona puede hacer `GET/POST/PUT/DELETE` contra `/api/members`, `/api/users`, etc. No hay guards, token, sesión ni verificación de rol.
- `POST /api/auth/login` devuelve el objeto `UserEntity` completo, incluido `contrasena` (hash). El frontend guarda ese objeto en `localStorage` (`AppContexto.tsx`, 63-73 y 103).
- `GET /api/users` entrega todos los usuarios y sus hashes a cualquier cliente. No se excluye el campo `contrasena`.
- El usuario semilla es `Tito` / `1234` (`users.service.ts`, 14-33). Es una credencial conocida y débil.
- CORS está abierto sin restricción (`main.ts`, 20).
- No hay rate limiting, CSRF, helmet ni validación de entrada.

### 6.5 Integridad y base de datos

- `synchronize: true` en producción (`database.config.ts`, 34). Es riesgoso y no reemplaza migraciones.
- No hay claves foráneas ni relaciones TypeORM: `id_grupo`, `id_ministerio` son enteros sueltos. Se pueden guardar ids inexistentes.
- No hay restricción única para `ci` de miembro, por lo que se pueden duplicar fichas.
- No hay transacciones ni validación de reglas de negocio en el servidor.
- No hay historial de juntas, períodos, movimientos económicos ni auditoría.

### 6.6 Pruebas y metodología

- No hay tests unitarios, de integración ni E2E.
- No hay evidencia de Scrum (backlog, sprints, actas) en el repositorio.
- El README solo indica `npm install` y `npm run dev`; no documenta MySQL, variables de entorno, migraciones ni despliegue.

---

## 7. Prioridad de correcciones

### P0 — Imprescindible para aprobar los requisitos centrales

1. **Definir la línea base oficial** entre los dos PDF (un ministerio vs. varios; discipulado incluido vs. excluido).
2. **Implementar el módulo económico**: entidades de ingresos, egresos, ofrendas y presupuestos; endpoints; pantallas; cálculo de saldo mensual/anual y variación presupuesto/costo real.
3. **Implementar conflictos de actividades**: hora de inicio y fin, intersección de intervalos y validación de espacio/responsable.
4. **Implementar RBAC real**: roles Pastor, Secretaría y Tesorero; guards en backend; menú y rutas restringidas; eliminar roles `admin/líder` o mapearlos formalmente.
5. **Corregir inventario**: estados disponible/en uso/dañado/mantenimiento, ubicación y asignación a grupo; reporte consolidado.
6. **Corregir arranque de producción, lint y Docker** para que la entrega sea ejecutable.
7. **Proteger la API y dejar de devolver/guardar contraseñas**: token/sesión, DTOs, sanitización y no exponer `contrasena`.

### P1 — Necesario para cumplir el documento de 39 páginas

8. Historial anual de juntas directivas y cargos obligatorios.
9. Respaldos automáticos y procedimiento de restauración documentado.
10. Validación de integridad en backend y restricciones de base de datos (C.I. única, FKs, DTOs).
11. Reportes consolidados e indicadores de actividades, inventario y economía.
12. Dashboard con desgloses por sexo, actividades de la semana reales y horarios de grupos.
13. Carga de documentos/evidencias de actividades.
14. Pruebas automatizadas y evidencia de Scrum.

### P2 — Calidad y mantenibilidad

15. Índices y paginación para cumplir los 3 segundos con datos reales.
16. Migraciones TypeORM y `synchronize: false` en producción.
17. Documentación de instalación, variables de entorno, API y despliegue.
18. Sustituir la credencial semilla por un proceso de alta seguro.
19. Revisar los modelos matemáticos y dejar evidencia de su implementación (no solo en la interfaz).

---

## 8. Conclusión

El proyecto es una **base CRUD funcional y visualmente completa**, pero **no satisface los requisitos esenciales** de ninguno de los dos documentos: economía, presupuestos, ofrendas, conflictos de horario, roles/permisos, respaldos, historial de juntas y estados de inventario. Los requisitos que sí cumple son los de gestión básica de miembros, ministerios, grupos, actividades e inventario, junto con autenticación con contraseña cifrada, arquitectura por capas, interfaz responsive y reportes PDF por módulo.

Con el estado actual, la evaluación sería **“cumple parcialmente”**: sirve como prototipo de gestión administrativa, pero no como sistema que implemente las reglas de negocio ni los modelos matemáticos exigidos. Antes de continuar, debe resolverse la contradicción entre los dos PDF y priorizar el módulo económico, los conflictos de actividades y el control de acceso.
