# Shiprocket delivery checks

The product-page pincode form calls `POST /api/shipping/check`. The function authenticates with Shiprocket on the server, checks serviceability from pickup postcode `410221`, and returns only delivery availability, COD availability, and ETA. Courier names and rates are never sent to the browser.

Set these variables in Vercel under **Project Settings → Environment Variables** for Production (and Preview if required):

```text
SHIPROCKET_API_EMAIL=the-email-of-the-Shiprocket-API-user
SHIPROCKET_API_PASSWORD=the-password-of-the-Shiprocket-API-user
SHIPROCKET_PICKUP_POSTCODE=410221
SHIPROCKET_WEIGHT_KG=2.4
SHIPROCKET_LENGTH_CM=30
SHIPROCKET_BREADTH_CM=20
SHIPROCKET_HEIGHT_CM=20
```

After saving the variables, redeploy the project. Do not add the Shiprocket token, email, or password to `app.js`, `index.html`, `.env.example`, or GitHub. The API token is cached only in the serverless function runtime and is refreshed before its ten-day expiry.
