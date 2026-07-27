# Pong Neón 🎾

Bienvenido al repositorio de **Pong Neón**, una reinvención técnica y moderna del clásico juego de tenis retro, desarrollado en **React**, **TypeScript** y **Vite**. Este proyecto forma parte del universo **Neon Arcade**, destacando por su estética retrowave y su arquitectura orientada al rendimiento.

🌐 **Juega ahora en:** [https://pong.orbynexdigital.cl/](https://pong.orbynexdigital.cl/)

## 🚀 Arquitectura y Tecnologías

El juego está diseñado como una aplicación web de alto rendimiento (SPA), garantizando fluidez en los inputs del usuario (60 FPS) y un renderizado impecable a través de React.

- **Frontend:** React 19, TypeScript (para seguridad de tipos estricta y mejor mantenibilidad).
- **Tooling:** Vite
- **Estilos:** CSS modular (animaciones fluidas por GPU, variables CSS, y efectos de brillo *glow* dinámicos).
- **Infraestructura:** Serverless nativo vía Vercel.

## 🎮 Caso de Uso y Funcionalidades (Game Design)

El caso de uso principal de la aplicación es proveer una experiencia arcade completa tanto en dispositivos de escritorio como en terminales móviles. 

### Funcionalidades Técnicas:
* **Físicas en Tiempo Real:** Cálculo preciso de rebotes, colisiones y velocidad adaptativa de la pelota (paddle tracking).
* **Responsive Design:** La cancha y los controles están programados para escalar dinámicamente y funcionar de manera nativa en navegadores móviles (Mobile-first). Cuenta con soporte para eventos táctiles (touch events) para controlar la raqueta.
* **Sistema de Puntaje y Ranking:** Persistencia del estado de la partida y un sistema de ranking o historial que guarda las puntuaciones máximas (High Scores), incentivando la rejugabilidad.
* **Audio Interactivo:** Integración con la Web Audio API para efectos de sonido reactivos (rebotes, puntos anotados) de baja latencia.

## 🛠️ Instalación y Ejecución Local

Si deseas correr este proyecto y modificar el código fuente:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/guacho175/JuegoPong.git
   cd JuegoPong
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor local:
   ```bash
   npm run dev
   ```

4. Visualiza la aplicación en `http://localhost:5173`.

## 👨‍💻 Autor

Desarrollado y mantenido por **Galindez** - 2026.
