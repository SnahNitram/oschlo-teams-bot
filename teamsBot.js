const { TeamsActivityHandler, TurnContext, CardFactory } = require("botbuilder");
const axios = require("axios");
const { marked } = require("marked");

// Add these debug logs at the top of teamsBot.js after the imports
console.log("\n=== Environment Variables Debug ===");
console.log({
    env: process.env.NODE_ENV,
    teamsfxEnv: process.env.TEAMSFX_ENV,
    flowise_endpoint: process.env.BOT_FLOWISE_API_ENDPOINT,
    flowise_chatflow: process.env.BOT_FLOWISE_CHATFLOW_ID,
    flowise_key: process.env.BOT_FLOWISE_API_KEY ? 'Present' : 'Missing'
});
console.log("===============================\n");

const FLOWISE_BASE_URL = process.env.BOT_FLOWISE_API_ENDPOINT?.replace(/\/$/, '');  // Remove trailing slash
const FLOWISE_API_ENDPOINT = `${FLOWISE_BASE_URL}/api/v1/prediction/${process.env.BOT_FLOWISE_CHATFLOW_ID}`;
console.log("Constructed API Endpoint:", FLOWISE_API_ENDPOINT);

// Language mapping for code blocks
const languageMap = {
  'python': 'Python',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'java': 'Java',
  'cpp': 'C++',
  'c++': 'C++',
  'csharp': 'C#',
  'c#': 'C#',
  'ruby': 'Ruby',
  'php': 'PHP',
  'go': 'Go',
  'rust': 'Rust',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'sql': 'SQL',
  'html': 'HTML',
  'css': 'CSS',
  'shell': 'Shell',
  'bash': 'Bash',
  'json': 'JSON',
  'xml': 'XML',
  'yaml': 'YAML',
  'markdown': 'Markdown',
  'md': 'Markdown'
};

// Convert markdown to Teams-compatible format
const convertMarkdownToTeams = (text) => {
  // Handle code blocks
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? languageMap[lang.toLowerCase()] || lang : '';
    return `\`\`\`${language}\n${code}\`\`\``;
  });

  // Replace markdown inline code
  text = text.replace(/`([^`]+)`/g, '`$1`');

  // Convert headers
  text = text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `**${content}**\n`;
  });

  // Convert bold and italic
  text = text.replace(/\*\*(.+?)\*\*/g, '**$1**');
  text = text.replace(/_(.+?)_/g, '*$1*');

  // Convert lists
  text = text.replace(/^(\s*)-\s+(.+)$/gm, (match, spaces, content) => {
    const level = Math.floor(spaces.length / 2);
    return `${' '.repeat(level)}• ${content}`;
  });

  // Convert links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($2)');

  return text;
};

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      console.log("=== Message Received ===");
      console.log("Message text:", context.activity.text);
      
      try {
          const removedMentionText = TurnContext.removeRecipientMention(context.activity);
          const messageText = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
          console.log("Processed message:", messageText);
          
          // Create session ID based on conversation
          const sessionId = `teams_${context.activity.conversation.id}`;
          console.log("Session ID:", sessionId);
  
          // Log the API call details
          console.log("Making API call to:", FLOWISE_API_ENDPOINT);
          
          // Make API request to Flowise
          const response = await axios({
              method: 'post',
              url: FLOWISE_API_ENDPOINT,
              data: {
                  question: messageText,
                  overrideConfig: {
                      sessionId: sessionId
                  }
              },
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${process.env.BOT_FLOWISE_API_KEY}`
              },
              validateStatus: (status) => status === 200
          });
  
          console.log("Flowise response received:", response.data);
  
          if (response.data && response.data.text) {
              const cleanResponse = convertMarkdownToTeams(response.data.text);
              console.log("Processed response:", cleanResponse);
              
              // Create adaptive card for response
              const card = CardFactory.adaptiveCard({
                  type: 'AdaptiveCard',
                  version: '1.0',
                  body: [
                      {
                          type: 'TextBlock',
                          text: cleanResponse,
                          wrap: true
                      }
                  ]
              });
  
              await context.sendActivity({ attachments: [card] });
              console.log("Response sent to Teams");
          } else {
              console.log("No text in response from Flowise");
              await context.sendActivity("I'm sorry, I couldn't process that request properly.");
          }
      } catch (error) {
          console.error("Error processing message:", error);
          console.error("Error details:", {
              message: error.message,
              response: error.response?.data
          });
          await context.sendActivity("I'm sorry, I encountered an error processing your request. Please try again later.");
      }
  
      await next();
  });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          // Instead, make an initial call to Flowise to get the welcome message
          const welcomeResponse = await this.flowiseAPI.sendMessageAndWaitForResponse(
              "", // Empty message to trigger welcome message
              context.activity.conversation.id,
              {
                  isFirstMessage: true // Add a flag to indicate this is the initial message
              }
          );
          
          if (welcomeResponse && welcomeResponse.text) {
              await context.sendActivity(welcomeResponse.text);
          }
          break;
        }
      }
      await next();
    });
  }

  async handleTeamsMessagesAsync(context, next) {
    // Only send to Flowise if this is a user message (not the initial welcome)
    if (context.activity.text) {
        await this.flowiseAPI.sendMessageAndWaitForResponse(
            context.activity.text, 
            context.activity.conversation.id,
            {
                skipWelcomeMessage: true // Add flag to skip welcome message for regular messages
            }
        );
    }
    await next();
  }
}

module.exports.TeamsBot = TeamsBot;