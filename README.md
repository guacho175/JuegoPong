# Pong Neon

Juego en vivo: https://pong-ne-n-956223175156.us-west1.run.app/

## Descripcion

Pong Neon reinterpreta el clasico Pong con IA rival, ranking global y una interfaz cyber neon compatible con escritorio y dispositivos tactiles.

## Estandar aplicado

Pong sigue la misma referencia estructural de JuegoSerpiente.

- Header, ranking, zona de juego y reproductor en layout consistente.
- Tokens compartidos de color y tipografia.
- Arquitectura y despliegue comunes al resto de la franquicia.

## Arquitectura comun

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + motion/react
- Juego en canvas con loop de render optimizado
- Ranking remoto + respaldo localStorage
- Dockerfile multistage + cloudbuild.yaml

## Controles

- Escritorio: flechas arriba/abajo o W/S.
- Movil: swipe vertical para mover la paleta.

## Desarrollo local

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar entorno local:

```bash
npm run dev
```

3. Validar tipado:

```bash
npm run lint
```

## Build y despliegue

- Build: npm run build
- Runtime: puerto 8080
- Cloud Run mediante Dockerfile y cloudbuild.yaml

## Creditos

Desarrollado por Galindez & IA.
