FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Development target
FROM base AS dev
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build target
FROM base AS build
RUN npm run build

# Production target (serve static files)
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
