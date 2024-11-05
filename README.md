# Oschlo Teams Bot

A Microsoft Teams bot that connects to a Flowise API endpoint, enabling AI-powered conversations within Teams. The bot supports private chats, group chats, and team channels.

## Features

- 🤖 Direct integration with Flowise AI
- 💬 Support for private chats, group chats, and team channels
- 🔄 Markdown message formatting support
- 🌐 Multi-tenant support for organization-wide deployment
- 📝 Conversation history tracking with session IDs

## Prerequisites

- Node.js 16.x or higher
- A Microsoft 365 account with admin access
- A Flowise instance with an API endpoint
- An Azure account (for bot registration)
- A Render.com account (for deployment)

## Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/snahnitram/oschlo-teams-bot.git
cd oschlo-teams-bot
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
BOT_FLOWISE_API_ENDPOINT=your_flowise_endpoint
BOT_FLOWISE_CHATFLOW_ID=your_chatflow_id
BOT_FLOWISE_API_KEY=your_flowise_api_key
MICROSOFT_APP_ID=your_azure_bot_id
MICROSOFT_APP_PASSWORD=your_azure_bot_password
```

4. Start the development server
```bash
npm run dev:teamsfx
```

## Azure Bot Registration

1. Create a new bot registration in Azure Portal
2. Note down the Microsoft App ID and generate a client secret
3. Configure the messaging endpoint (after deployment)
4. Enable the Microsoft Teams channel

## Deployment to Render

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure environment variables:
   - BOT_FLOWISE_API_ENDPOINT
   - BOT_FLOWISE_CHATFLOW_ID
   - BOT_FLOWISE_API_KEY
   - MICROSOFT_APP_ID
   - MICROSOFT_APP_PASSWORD
4. Set the following:
   - Build Command: `npm install`
   - Start Command: `node index.js`

## Teams App Manifest

1. Update `manifest.json` with your app details:
   - Update `id` (Teams App ID)
   - Update `botId` (Azure Bot ID)
   - Update `validDomains` with your Render domain
   - Customize name, descriptions, and other fields

2. Package the manifest:
   - Use Teams Toolkit in VS Code
   - Create `color.png` (192x192) and `outline.png` (32x32) icons
   - Generate the app package

## Organization-wide Deployment

1. Go to Teams Admin Center
2. Upload your packaged app
3. Set organizational policies
4. Deploy to users

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| BOT_FLOWISE_API_ENDPOINT | Your Flowise API endpoint URL | Yes |
| BOT_FLOWISE_CHATFLOW_ID | Your Flowise chatflow ID | Yes |
| BOT_FLOWISE_API_KEY | Your Flowise API key | Yes |
| MICROSOFT_APP_ID | Azure Bot registration App ID | Yes |
| MICROSOFT_APP_PASSWORD | Azure Bot client secret | Yes |

## Architecture

```
Teams Client <-> Azure Bot Service <-> Render.com (Bot Host) <-> Flowise API
```

## Best Practices

- Keep your client secret and API keys secure
- Regularly rotate secrets and API keys
- Monitor bot performance and errors
- Update npm packages regularly for security
- Test in a development environment before deploying

## Creating Client-Specific Instances

To create a new instance for a client:
1. Create a new Web Service in Render
2. Create a new bot registration in Azure
3. Generate new Teams App ID
4. Update manifest with new IDs
5. Configure client-specific Flowise endpoint

## Support

For issues and feature requests, please create an issue in this repository.

## License

[Your chosen license]

## Contributing

[Your contribution guidelines]