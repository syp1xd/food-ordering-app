FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

# envsubst for templating nginx config with PORT/BACKEND_URL
RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV BACKEND_URL=http://localhost:8000

CMD ["sh", "-c", "envsubst '$$PORT $$BACKEND_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" ]