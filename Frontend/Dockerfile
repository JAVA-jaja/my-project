FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/backend.conf.template
COPY configure-backend.sh /docker-entrypoint.d/05-configure-backend.sh
RUN chmod +x /docker-entrypoint.d/05-configure-backend.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
