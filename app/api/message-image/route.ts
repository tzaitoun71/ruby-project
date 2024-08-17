import { NextRequest, NextResponse } from 'next/server';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../config/Firebase';
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const text = formData.get('text') as string;

    if (!file || !text) {
      return NextResponse.json({ error: 'File and text are required' }, { status: 400 });
    }

    // Ensure the file is of type 'File'
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Uploaded file must be a File' }, { status: 400 });
    }

    // Upload the file to Firebase Storage
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, new Uint8Array(await file.arrayBuffer()));
    const imageUrl = await getDownloadURL(storageRef);

    // Setup Pinecone and Langchain
    const { selfQueryRetriever, llm } = await setupPineconeLangchain();

    // Step 1: Use the LLM to analyze both text and image
    const analysisPrompt = `Analyze the following text and image URL. Is it a complaint? Provide a summary, product, and sub-product in plain text:
    - Text: "${text}"
    - Image URL: "${imageUrl}"`;

    const analysisResponse = await llm.invoke([
      new SystemMessage('You are an AI that analyzes both text and images and provides concise results in plain text.'),
      new HumanMessage(analysisPrompt),
    ]);

    // Handle the response content
    let resultContent = '';
    if (typeof analysisResponse.content === 'string') {
      resultContent = analysisResponse.content.trim();
    } else if (Array.isArray(analysisResponse.content)) {
      resultContent = analysisResponse.content.map((item) => (typeof item === 'string' ? item : '')).join(' ').trim();
    } else if (typeof analysisResponse.content === 'object' && analysisResponse.content !== null) {
      resultContent = JSON.stringify(analysisResponse.content);
    }

    // Step 2: Process the analysis results
    const isComplaint = resultContent.toLowerCase().includes("complaint");
    const summaryMatch = resultContent.match(/summary:\s*(.*)/i);
    const productMatch = resultContent.match(/product:\s*(.*)/i);
    const subProductMatch = resultContent.match(/sub-product:\s*(.*)/i);

    const summary = summaryMatch ? summaryMatch[1].trim() : "No summary available";
    const product = productMatch ? productMatch[1].trim() : "Product Category Example";
    const subProduct = subProductMatch ? subProductMatch[1].trim() : "Sub-product Category Example";

    // Return the formatted JSON response
    return NextResponse.json({
      complaint: isComplaint,
      summary: summary,
      product: product,
      subProduct: subProduct,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
}
