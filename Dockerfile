FROM node:18-alpine

COPY . /supervisely-infra

WORKDIR /supervisely-infra

RUN npm install

CMD ["node", "src/index.js"]

