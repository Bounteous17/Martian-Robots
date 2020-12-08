FROM node:14.15.1-alpine3.10

WORKDIR /usr/src/app
COPY ./build ./build
COPY ./node_modules ./node_modules

CMD ["node", "./build/app.js"]