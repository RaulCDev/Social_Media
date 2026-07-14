FROM node:18 AS dependencies

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci


FROM dependencies AS development

ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]


FROM dependencies AS build

COPY . .
RUN npm run build


FROM node:18-slim AS production

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
