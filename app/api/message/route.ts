import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";

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

export const POST = async (req: NextRequest) => {
  try {
    const { text } = await req.json(); // Get the input text from the request body

    // If no text is provided, return an error response
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const { selfQueryRetriever, llm } = await setupPineconeLangchain(); // Setup Pinecone and Langchain

    // Step 1: Use the LLM to determine if the text is a complaint and generate a summary
    const complaintCheckPrompt = `Is the following text a complaint? If yes, provide a summary in plain text without using markdown: "${text}"`;
    const complaintCheckResponse = await llm.invoke([
      { type: 'system', content: 'You are a system that identifies complaints and summarizes them in plain text without using markdown.' },
      { type: 'user', content: complaintCheckPrompt },
    ]);

    // Determine the type of content and handle it accordingly
    let content: string | undefined = undefined;

    if (typeof complaintCheckResponse.content === 'string') {
      content = complaintCheckResponse.content;
    } else if (Array.isArray(complaintCheckResponse.content)) {
      content = complaintCheckResponse.content.map(item => (typeof item === 'string' ? item : '')).join(' ');
    } else if (typeof complaintCheckResponse.content === 'object' && complaintCheckResponse.content !== null) {
      content = JSON.stringify(complaintCheckResponse.content);
    }

    if (!content) {
      throw new Error("Unexpected response content type");
    }

    // Remove the specific phrase "Yes, the text is a complaint." if it exists
    const summary = content.replace("Yes, the text is a complaint.", "").trim();

    const lowerCaseContent = content.toLowerCase();
    const isComplaint = lowerCaseContent.includes("yes");

    if (!isComplaint) {
      return NextResponse.json({ 
        complaint: false,
        summary: summary,
        product: null,
        subProduct: null
      });
    }

    // Step 2: Retrieve relevant documents (if any) using Pinecone to assist in categorization
    const relevantDocuments = await selfQueryRetriever.invoke(text);
    const documentContents = relevantDocuments.map(doc => doc.pageContent).join("\n");

    // Step 3: Use the LLM to assign a product and sub-product category
    const categorizationPrompt = `Based on the following text and relevant documents, categorize this complaint into a product and sub-product in plain text without using markdown: "${text}". Relevant documents: "${documentContents}"`;
    const categorizationResponse = await llm.invoke([
      { type: 'system', content: 'You are a system that categorizes complaints into product and sub-product categories in plain text without using markdown.' },
      { type: 'user', content: categorizationPrompt },
    ]);

    const categorization = typeof categorizationResponse.content === 'string'
      ? categorizationResponse.content
      : JSON.stringify(categorizationResponse.content);

    // Split categorization to get product and sub-product
    const [product, subProduct] = categorization.split("\n").map(line => line.replace(/^Product:|Sub-product:/, '').trim());

    // Return the structured JSON
    return NextResponse.json({
      complaint: true,
      summary: summary,
      product: product || null,
      subProduct: subProduct || null,
    });
  } catch (error) {
    console.error("Error processing query:", error); // Log any errors that occur
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

// Allow handling of OPTIONS request (e.g., for CORS preflight)
export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
};
