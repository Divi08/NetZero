# Zero Bot - AI Assistant

## Overview
Zero Bot is an AI assistant integrated into the Community Chat feature that helps users by answering questions and providing information about environmental policy cases. Users can mention the bot using `@zero` followed by their question or request.

## How It Works

### Mentioning the Bot
To interact with Zero Bot, users can type `@zero` followed by their question in the community chat message input. For example:
- `@zero What are the main environmental concerns in this case?`
- `@zero Explain the regulatory implications of this facility's violations`
- `@zero Summarize the policy issues in this case`

### Contextual Understanding
Zero Bot understands the context of conversations by examining:
- The current query (everything after the `@zero` mention)
- The previous 3-4 messages in the chat for context

This allows the bot to provide more relevant and helpful responses by considering the ongoing discussion.

### Response Generation
When a user mentions Zero Bot:
1. The message is sent to the chat as a normal user message
2. The system detects the `@zero` mention
3. The query and previous messages are extracted as context
4. A call is made to the Gemini 1.5 Flash API
5. The AI generates a relevant response
6. The response is posted back to the chat as a message from Zero Bot

### Technical Implementation
- Uses the Gemini 1.5 Flash model
- API key stored securely in environment variables
- Provides helpful, concise, and friendly responses
- Visually distinguishes bot messages with special styling
- Processes mentions asynchronously to maintain chat responsiveness

## Example Use Cases

1. **Information Retrieval**
   - `@zero What regulations apply to this facility?`
   - `@zero Explain the impact of this case on the local community`

2. **Policy Insights**
   - `@zero What policy recommendations would help prevent similar issues?`
   - `@zero How does this case compare to other environmental policy precedents?`

3. **Case Analysis**
   - `@zero What are the key environmental risks here?`
   - `@zero Summarize the main compliance issues in this case`

4. **Guidance**
   - `@zero How can citizens get involved in this type of environmental case?`
   - `@zero What data should we look at to better understand this situation?`

## Best Practices for Users

1. **Be Specific**: Clearly state what information you're looking for
2. **Provide Context**: If previous messages don't contain enough context, include relevant details in your question
3. **One Query at a Time**: For best results, ask one question per mention
4. **Follow Up**: You can ask follow-up questions by mentioning `@zero` again 