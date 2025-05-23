import { GoogleGenerativeAI } from "@google/generative-ai";

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gemini-1.5-pro",
  temperature: number = 0.4,
  num_tries: number = 1,
  verbose: boolean = false
): Promise<any> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const geminiModel = genAI.getGenerativeModel({ model: model });

  const list_input: boolean = Array.isArray(user_prompt);
  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt = `
You are to generate data in the following JSON format: ${JSON.stringify(output_format)}

IMPORTANT RULES:
1. ALL property values MUST be enclosed in double quotes
2. Do NOT include any line breaks within property values
3. Make sure the output is a valid, parseable JSON object or array
4. Do NOT include markdown code blocks, explanations, or any text outside the JSON
5. Do NOT use single quotes for property values, only double quotes
`;

    if (list_input) {
      output_format_prompt += `
6. Output must be a JSON array containing exactly ${user_prompt.length} objects, one for each input element
7. Each object must contain exactly the properties specified in the format above
`;
    }

    const combinedPrompt = `${system_prompt}\n${output_format_prompt}${error_msg}\n\n${user_prompt.toString()}`;

    try {
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
        generationConfig: {
          temperature: temperature,
        },
      });

      const response = result.response;
      let res: string = response.text() || "";

      // Extract JSON from markdown blocks
      const jsonMatch = res.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        res = jsonMatch[1];
      }

      // JSON sanitization
      res = res
        .replace(/(\w)"(\w)/g, "$1'$2") // Replace mid-word quotes with apostrophes
        .replace(/'/g, "'") // Keep apostrophes
        .replace(/\\"/g, '"') // Unescape quotes
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Ensure proper quoting
        .replace(/"\s*:\s*([^"{\[\d][^,}\]\n]*)([,}\]])/g, '":"$1"$2')
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]");

      if (verbose) {
        console.log("Final JSON to parse:", res);
      }

      try {
        let output: any = JSON.parse(res);

        if (list_input) {
          if (!Array.isArray(output)) {
            output = [output];
          }
          if (output.length !== user_prompt.length) {
            throw new Error(`Expected ${user_prompt.length} questions, but got ${output.length}`);
          }
        } else {
          output = Array.isArray(output) ? output[0] : output;
        }

        return list_input ? output : [output];
      } catch (e) {
        error_msg = `\n\nERROR: Last attempt resulted in invalid JSON. Please ensure you follow ALL formatting rules exactly. Result: ${res}\n\nError message: ${e}`;
        console.log("JSON parsing exception:", e);
        console.log("Current invalid json format:", res);
      }
    } catch (e) {
      error_msg = `\n\nError making API call to Gemini: ${e}`;
      console.log("API call exception:", e);
    }
  }

  return [];
}
