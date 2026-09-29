import { defineRailway, github, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const database = volume("ubepari-data", {
    region: "asia-southeast1-eqsg3a",
    sizeMB: 512,
  });

  const storefront = service("ubepari-pc", {
    source: github("emmanuelste/ubepari-pc", { branch: "main" }),
    build: "npm run build",
    start: "npm start",
    regions: { "asia-southeast1-eqsg3a": 1 },
    healthcheck: "/api/health",
    healthcheckTimeout: 300,
    volumeMounts: { "/app/data": database },
  });

  return project("ubepari-pc", {
    resources: [storefront, database],
  });
});
