# GitHub Pages

El repositorio publica el frontend estático de AgendaNanai en GitHub Pages. Esta modalidad conserva la navegación, la interfaz de reservas y los datos de demostración, pero GitHub Pages no ejecuta el servidor Express, Goauth, la base de datos administrada ni los webhooks de Stripe.

Para operar reservas reales con autenticación, disponibilidad persistente, bloqueo de 15 minutos y pagos, usa el Preview o despliegue administrado de Manus. El workflow `.github/workflows/pages.yml` publica automáticamente cada push a `main` en el proyecto Pages de `agenda`.
