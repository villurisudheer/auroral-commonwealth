FROM node:22-alpine
WORKDIR /app
COPY . .
# Fail the Docker build before deployment if a country edit introduces a missing comma,
# duplicate ID, malformed resource, broken module, or simulation-breaking value.
RUN npm run validate
ENV PORT=8000
EXPOSE 8000
CMD ["node", "server.mjs"]
