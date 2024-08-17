import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import fs from 'fs';
import path from 'path';

// Path to your JSON file
const jsonFilePath = path.resolve('./app/api/upload-json-to-pinecone/ruby_hackathon_data.json');

// Function to load JSON data from the file
const loadJSONData = (): any[] => {
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  return JSON.parse(rawData);
};

// Function to load documents from JSON data
const loadDocumentsFromJSON = (data: any[]): Document[] => {
  return data.map((item, index) => new Document({
    pageContent: JSON.stringify(item._source),
    metadata: { id: item._id, index },
  }));
};

const setupPineconeLangchain = async () => {
  // Load JSON data from file
  const jsonData = loadJSONData();
  console.log("JSON data loaded:", jsonData);

  // Load documents from JSON data
  const allDocs = loadDocumentsFromJSON(jsonData);
  console.log("Documents loaded:", allDocs);

  // Initialize Pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);
  console.log("Pinecone index initialized");

  // Initialize embeddings
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY as string,
  });
  console.log("Embeddings instance created");

  // Create vector store from all documents
  const vectorStore = await PineconeStore.fromDocuments(allDocs, embeddings, {
    pineconeIndex: pineconeIndex,
  });
  console.log("Vector store created");

  // Initialize LLM
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8,
    apiKey: process.env.OPENAI_API_KEY as string,
  });
  console.log("LLM instance created");

  // Initialize SelfQueryRetriever
  const selfQueryRetriever = SelfQueryRetriever.fromLLM({
    llm: llm,
    vectorStore: vectorStore,
    documentContents: "Document content",
    attributeInfo: [],
    structuredQueryTranslator: new PineconeTranslator(),
  });
  console.log("SelfQueryRetriever instance created");

  return { selfQueryRetriever, llm };
};

export const POST = async (req: NextRequest) => {
  try {
    console.log("Received request");
    const { question } = await req.json();
    console.log("Question received:", question);

    if (!question) {
      console.log("No question provided");
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const { selfQueryRetriever, llm } = await setupPineconeLangchain();
    console.log("Pinecone and LangChain setup complete");

    // Retrieve relevant documents
    const relevantDocuments = await selfQueryRetriever.invoke(question);
    console.log("Relevant documents retrieved:", relevantDocuments);

    const documentContents = relevantDocuments.map(doc => doc.pageContent).join("\n");
    console.log("Document contents:", documentContents);

    // Prepare messages for the LLM
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: question },
      { role: "system", content: documentContents },
    ];
    console.log("Messages prepared for LLM:", messages);

    // Generate a response based on the retrieved documents
    const response = await llm.invoke(messages as any);
    console.log("Response generated:", response);

    const answer = response.content;
    console.log("Generated response content:", answer);

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
};
