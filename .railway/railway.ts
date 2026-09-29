import { defineRailway, github, postgres, project, service } from "railway/iac";

export default defineRailway(() => {
  const database = postgres("ubepari-postgres", {
    region: "asia-southeast1-eqsg3a",
  });

  const storefront = service("ubepari-pc", {
    source: github("emmanuelste/ubepari-pc", { branch: "main" }),
    build: "npm run build",
    start: "npm start",
    regions: { "asia-southeast1-eqsg3a": 1 },
    healthcheck: "/api/health",
    healthcheckTimeout: 300,
    env: {
      DATABASE_URL: database.env.DATABASE_URL,
      DATABASE_SSL: "true",
    },
  });

  return project("ubepari-pc", {
    resources: [storefront, database],
  });
});
