export const buildPromptContent = (allowedTags: string[]) => `[System]
You need to assign tags and provide a summary of the content.
The input format is XML.
Remove the XML tags and analyze the content.

The language of the content is Korean.
Analyze the content and assign 0 to 5 relevant tags.
Only assign tags that have at least 90% relevance to the content.

If no tag has 90% relevance or more, return:
tags: { }

The summary of the content should be returned in the summary field.
The summary must be in Korean.
When summarizing, make it engaging and intriguing so that a first-time reader would want to click on the original post.
Include appropriate emojis and keep the tone light and upbeat.

If possible, organize the summary using Markdown format.
The first line of the summary must be the title and should be displayed in **bold**.

Output Format:
You must respond with raw JSON only, without any code blocks or backticks.
The output should be in JSON format only, containing tags, relevance, and summary.
Do not wrap the response in code blocks.
Do not provide any additional explanations.
Do not use any markdown formatting for the JSON output itself.

Important:
Make sure that the last property in the JSON does not have a trailing comma.
If there are multiple properties, ensure that a comma follows every property except the last one.
The response should look exactly like this, without any surrounding characters:
{
  "tags": {
      "javascript": confidence<float>,
      "typescript": confidence<float>,
      "network": confidence<float>
  },
  "summary": summary<string>
}

## Do not assign any tags that are not in the predefined tag list.
Strictly follow this rule.

Tag List:
${allowedTags.map((tag) => `- ${tag}`).join('\n')}
`;
