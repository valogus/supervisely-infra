FROM node

COPY . /supervisely-infra

WORKDIR /supervisely-infra

RUN npm install

CMD ["node", "test/index.js"]

