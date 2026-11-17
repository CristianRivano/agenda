# TODO AgendaNanai

## 1. Storefront y navegación pública

- [ ] La página `/` presenta Masajes Nanai con una explicación breve, enlaces a `/book/Nanai` y `/app`, y un panel de próximas franjas disponibles.
- [ ] La interfaz usa el fondo `#3B141A`, superficies `#522129`, acento principal `#E5A853`, acento secundario `#C9863B`, texto principal `#FDF3E7` y texto atenuado equivalente a `rgba(253,243,231,0.78)`.
- [ ] El manifiesto `/manus-routes.json` incluye `/`, `/book/Nanai`, `/confirmation` y todas las rutas del workspace.

## 2. Reserva pública y datos de cliente

- [ ] `/book/Nanai` funciona como una sola página con pasos contraíbles: servicio, masajista o cualquiera, fecha y franja.
- [ ] El servidor calcula las franjas a partir de la disponibilidad y descuenta reservas existentes en la zona horaria del negocio; cada franja muestra también la hora local del cliente.
- [ ] El lateral muestra un resumen vivo del servicio, masajista, fecha, horario, duración, señal y saldo.
- [ ] El formulario de datos valida en línea con `react-hook-form` y `zod`, incluyendo nombre, email, teléfono, sector y notas.
- [ ] El cliente puede iniciar Stripe Checkout para pagar la señal; la franja pendiente queda bloqueada durante 15 minutos y se muestra una cuenta atrás.
- [ ] `/confirmation` confirma la reserva y ofrece la descarga de un archivo `.ics`.

## 3. Autenticación, base de datos y pagos

- [ ] El workspace usa el inicio de sesión OAuth/Goauth existente y conserva `webdev_app_session`; las acciones administrativas requieren sesión válida.
- [ ] La base de datos tiene tablas para servicios, masajistas, disponibilidad, clientes, reservas, holds y pagos, con seed idempotente de datos realistas de Masajes Nanai.
- [ ] Stripe se habilita mediante la integración administrada; la aplicación registra pagos, procesa el webhook suscrito y evita duplicados de eventos.

## 4. Workspace del propietario

- [ ] `/app` tiene barra lateral con Hoy, Calendario, Disponibilidad, Servicios, Clientes y Pagos.
- [ ] Hoy muestra trabajos del día, estados, próximos trabajos y un gráfico de horas reservadas; todos los listados/gráficos contemplan carga, vacío y error.
- [ ] Calendario ofrece vistas día, semana, mes y lista; permite arrastrar para reprogramar y abrir un panel lateral para gestionar estado, masajista y cancelación.
- [ ] Disponibilidad muestra horario semanal, descansos y ausencias por masajista.
- [ ] Servicios permite revisar modalidades, duración, precio, señal y estado.
- [ ] Clientes muestra búsqueda, datos de contacto e historial de reservas.
- [ ] Pagos muestra fecha, cliente, reserva, importe, método y estado.

## 5. Accesibilidad y sistema visual

- [ ] Los componentes interactivos usan React Aria Components como sistema de componentes, con estilos Tailwind y navegación completa por teclado.
- [ ] Se usan FullCalendar con vistas gratuitas, `react-day-picker`, Sonner, `react-hook-form` con zod y Phosphor Icons.
- [ ] La interfaz tiene un único color de acento interactivo, estados de foco visibles, textos de estado, y estados de carga/vacío/error en todas las listas y gráficos.
