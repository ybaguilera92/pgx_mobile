# PGx Reports — Angular Native (@ng-native)

Aplicación desarrollada con **Angular Native** (`@ng-native`), el framework que renderiza componentes de Angular directamente como vistas nativas de iOS y Android a través del renderizador Fabric de React Native y el ecosistema Expo, sin depender de WebViews ni Capacitor.

## Arquitectura

- **Framework**: [Angular Native](https://ng-native.com) (`@ng-native/components`, `@ng-native/fabric`, `@ng-native/platform`, `@ng-native/device`, `@ng-native/web`).
- **Primitivas Nativas**: Componentes que compilan a vistas nativas reales en móvil y DOM equivalente en web:
  - `<safe-area-view>`: Área segura nativa para muescas y barras de sistema.
  - `<scroll-view>`: Contenedor con scroll nativo fluido.
  - `<view>`: Contenedor de diseño flexbox nativo (`android.view.View` / `UIView`).
  - `<text>`: Renderizado de texto nativo con jerarquía tipográfica.
  - `<text-input>`: Entrada de texto nativa con soporte para `secureTextEntry` (contraseña).
  - `<pressable>`: Interacción táctil nativa mediante el sistema de eventos `(press)`.
  - `<image>`: Renderizado nativo de imágenes (`logo-mini.png`).
- **Estado Reactivo**: Angular Signals (`signal()`, `computed()`), arquitectura zoneless y AOT.
- **Expo & Metro**: Configuración de `app.json` y `metro.config.js` (`withNgNative`) para empaquetado móvil nativo en iOS y Android.
- **Web & Preview**: Integración con `@ng-native/web/vite` en `vite.config.ts` para servir la app en desarrollo en el puerto 3000 con proxy para `/api/v1`.

## Scripts

- `npm start`: Inicia el empaquetador Metro con Expo para ejecutar en dispositivos y simuladores nativos.
- `npm run dev`: Inicia el servidor de desarrollo web en `http://0.0.0.0:3000` con proxy a los servicios PGx.
- `npm run build`: Compila la aplicación para producción.
- `npm run lint`: Valida la integridad de tipos TypeScript (`tsc --noEmit`).

## Funcionalidades

1. **Búsqueda de Reporte PGx**: Validación reactiva de número de accesión y clave de seguridad, con persistencia local del último número de accesión.
2. **Escáner QR**: Escaneo en tiempo real mediante cámara con visor láser o carga alternativa de imagen con decodificación `jsQR`.
3. **Descarga y Visualización**: Diálogo modal nativo con barra de progreso reactiva (0% a 100%) y descarga de reporte PDF.
4. **Modo Oscuro / Claro**: Detección y alternancia de tema nativo con persistencia.
5. **Notificaciones**: Banner integrado para avisos de éxito y errores.
