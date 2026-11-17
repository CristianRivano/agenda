# Plan de AgendaNanai

## Enfoque de implementación

AgendaNanai será una aplicación React/Express/tRPC/Drizzle sobre la plantilla `web-db-user`, con servidor y base de datos administrada. La autenticación usará el flujo OAuth de Manus/Goauth del starter y conservará la cookie `webdev_app_session`. Las reservas públicas leerán catálogo, masajistas, disponibilidad y reservas desde procedimientos tRPC; el servidor generará franjas en la zona horaria de Talca, descontará reservas confirmadas y mantendrá holds pendientes con expiración de 15 minutos. Stripe Checkout se habilitará como integración administrada, con una ruta de creación de sesión y webhook idempotente.

El producto se dividirá en un storefront público (`/`, `/book/Nanai`, `/confirmation`) y un workspace operativo (`/app` con páginas Hoy, Calendario, Disponibilidad, Servicios, Clientes y Pagos). La primera entrega incluye datos de demostración realistas, estados de carga/vacío/error visibles, fallbacks amables si la base no está disponible en Preview y un calendario operativo con interacciones de reprogramación simuladas de forma segura en el cliente mientras el backend persiste las actualizaciones.

## Estructura del proyecto

- `client/src/App.tsx`: enrutado público y workspace.
- `client/src/pages/`: Home, Book, Confirmation y vistas del workspace.
- `client/src/components/`: shell, primitives accesibles basados en React Aria Components y piezas de reservas.
- `client/src/data/demo.ts`: contenido y datos de demostración reutilizables para estados iniciales.
- `server/routers.ts`: procedimientos públicos y protegidos de catálogo, slots, reservas, clientes y pagos.
- `server/db.ts`: queries y seed idempotente de la base administrada.
- `drizzle/schema.ts` y `drizzle/`: tablas de negocio y migraciones.
- `client/public/manus-routes.json`: manifiesto completo de rutas del sitio.

## Diseño

### Estilos considerados

- **Editorial nocturno de bienestar** — 0.07: paneles oscuros, tipografía serena y acentos cálidos para comunicar pausa y confianza.
- **Clínico minimalista** — 0.06: mucho blanco, líneas finas y contraste funcional para priorizar eficiencia.
- **Boutique terracota** — 0.05: superficies cálidas, serif editorial y textura artesanal para una marca de autor.

Se elige **Editorial nocturno de bienestar**.

### Movimiento de diseño

Una mezcla de dashboard editorial y agenda de estudio boutique: densa, cálida y silenciosa, con jerarquía tipográfica fuerte en lugar de decoración genérica.

### Principios

1. Claridad operativa: cada vista deja visible el siguiente paso y el estado del negocio.
2. Calidez precisa: el dorado identifica acciones y selección sin convertir la interfaz en un arcoíris.
3. Densidad legible: tarjetas y tablas compactas, con suficiente respiración, foco de teclado y estados explícitos.
4. Confianza: precios, duración, zona horaria, bloqueo de 15 minutos y políticas aparecen cerca de la acción.

### Filosofía de color

El fondo vino `#3B141A` representa una pausa íntima y nocturna. Las tarjetas `#522129` levantan el contenido sin separarlo del ambiente. El dorado `#E5A853` es el único acento interactivo y funciona como hilo conductor de selección, progreso y llamadas a la acción. `#C9863B` queda para estados secundarios y detalles de datos. El texto crema `#FDF3E7` y su variante atenuada sostienen contraste amable sobre superficies profundas.

### Paradigma de layout

El storefront usa una columna editorial izquierda con contexto y una columna de acción derecha para disponibilidad. El workspace usa una barra lateral compacta fija, una cabecera con fecha/estado y un lienzo de trabajo con tarjetas asimétricas en lugar de una cuadrícula de marketing.

### Elementos distintivos

- Monograma circular “N” con anillo dorado como marca y avatar de negocio.
- Píldoras de estado con borde dorado y fondos vinosos, nunca colores saturados.
- Mini gráfico de horas con barras doradas sobre una línea base suave para conectar bienestar con operación.

### Interacción y animación

Los pasos de reserva se expanden y colapsan con transiciones de 160 ms; la selección activa usa borde y glow dorado discreto. El foco de teclado siempre tiene anillo de 2 px en dorado. Los skeletons respetan el fondo. No se usan animaciones de rebote ni parallax; las transiciones deben sentirse como cambiar una tarjeta de agenda.

### Tipografía

`DM Sans` para interfaz, datos y botones; `Cormorant Garamond` para titulares editoriales y nombres de servicios. La jerarquía usa titulares compactos, labels en mayúsculas con tracking y números tabulares.

### Esencia de marca

AgendaNanai convierte la coordinación de masajes a domicilio en una agenda tranquila y clara para clientes y propietarios. Personalidad: serena, resolutiva y cercana.

### Voz

- Titulares: “Una pausa que sí cabe en tu agenda.”
- Microcopy: “Elige una franja; nosotros cuidamos los detalles.”

### Wordmark y color propio

El wordmark combina “Agenda” en DM Sans semibold con “Nanai” en Cormorant Garamond italic, acompañado por un anillo de pausa incompleto. El dorado `#E5A853` es el color propio de la marca y no se comparte con estados de error o éxito.
