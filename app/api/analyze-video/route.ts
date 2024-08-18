import { NextRequest, NextResponse } from 'next/server';
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import fs from 'fs';
import path from 'path';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore, PineconeTranslator } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Setup function for Pinecone, embeddings, and LLM
const setupPineconeLangchain = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const selfQueryRetriever = SelfQueryRetriever.fromLLM({
    llm: llm,
    vectorStore: vectorStore,
    documentContents: "Document content",
    attributeInfo: [],
    structuredQueryTranslator: new PineconeTranslator(),
  });

  return { selfQueryRetriever, llm };
};

const credentials = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle newline characters in the private key
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const filePath = path.join('/tmp', file.name);
    await fs.promises.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const client = new VideoIntelligenceServiceClient({
      projectId: credentials.projectId,
      credentials: credentials.credentials,
    });

    const videoBuffer = fs.readFileSync(filePath);
    const inputContent = videoBuffer.toString('base64');

    const [operation] = await client.annotateVideo({
      inputContent,
      features: [7, 1, 6],
      videoContext: {
        speechTranscriptionConfig: {
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
      },
    });

    const [operationResult] = await operation.promise();

    const transcription = operationResult.annotationResults?.[0].speechTranscriptions
      ?.map((transcript) => transcript.alternatives?.[0].transcript)
      .join(' ') || '';

    const labels = operationResult.annotationResults?.[0].segmentLabelAnnotations?.map((label) => label.entity?.description) || [];

    const detectedText = operationResult.annotationResults?.[0].textAnnotations?.map((text) => text.text).join(', ') || '';

    await fs.promises.unlink(filePath);

    const analysisText = `Transcription: ${transcription}\nLabels: ${labels.join(', ')}\nDetected Text: ${detectedText}`;

    const { llm } = await setupPineconeLangchain();

    const analysisPrompt = `
Analyze the following information extracted from a video and respond in the following JSON format:
{
  "is_complaint": <true_or_false>,
  "summary": "<summary_of_the_complaint>",
  "product": "<product_name>",
  "sub_product": "<sub_product_name>"
}
Information:
"${analysisText}"
`;

    const analysisResponse = await llm.invoke([
      new SystemMessage('You are an AI that analyzes extracted video content and provides a structured response in JSON format.'),
      new HumanMessage(analysisPrompt),
    ]);

    let resultJSON = {
      is_complaint: false,
      summary: "No summary available",
      product: "No product identified",
      sub_product: "No sub-product identified"
    };

    try {
      // Handle different types of content from GPT
      let responseContent = '';
      if (typeof analysisResponse.content === 'string') {
        responseContent = analysisResponse.content;
      } else if (Array.isArray(analysisResponse.content)) {
        responseContent = analysisResponse.content.join(' ');
      } else if (typeof analysisResponse.content === 'object' && analysisResponse.content !== null) {
        responseContent = JSON.stringify(analysisResponse.content);
      }

      // Remove potential code block delimiters and whitespace
      responseContent = responseContent
        .replace(/```json/g, '')  // Remove "```json"
        .replace(/```/g, '')      // Remove "```"
        .trim();

      // Parse the cleaned content as JSON
      resultJSON = JSON.parse(responseContent);
    } catch (error) {
      console.error('Failed to parse GPT response as JSON:', error);
    }

    return NextResponse.json(resultJSON);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
}
