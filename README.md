# Martian-Robots

## Requirements
- NodeJS >= v14
- Docker-Compose >= v1.13.0

## Getting Started

- Create an environment file
```bash
touch environment/environment.ts
```
- Append content
```ts
import { environmentType } from "./environment.type";

export const environment: environmentType = {
    api: {
        autoListen: true,
        port: 8080
    },
    redis: {
        host: 'localhost',
        port: 6379,
    }
}
```

### Run locally
```bash
npm run docker:compose:up
```

```bash
npm install
```

```bash
npm run test
```

### Start developeing
```bash
npm run test:watch:debug
```

```bash
npm run test:coverage
```

### Build image

```bash
npm run docker:build
```

## License
GPL