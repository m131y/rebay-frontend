# Stage 1: Build
FROM node:20 AS build

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL} 

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# 💡 [디버깅 추가 1] ARG 값이 제대로 전달되었는지 확인 (로그에 찍힘)
RUN echo "ARG check: VITE_API_URL received is: [${VITE_API_URL}]"

# Vite가 읽을 수 있는 .env.production 생성
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

# 그냥 npm run build
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
