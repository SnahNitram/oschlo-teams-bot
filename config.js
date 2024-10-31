const config = {
  MicrosoftAppId: process.env.MICROSOFT_APP_ID,
  MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
  MicrosoftAppType: "MultiTenant",  // Since we set this in Azure
  MicrosoftAppTenantId: process.env.TEAMS_APP_TENANT_ID || "",  // Optional for multi-tenant
};

module.exports = config;