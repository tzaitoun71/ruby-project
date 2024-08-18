import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
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

  const llm = new OpenAI({
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

// Function to transcribe audio using Whisper API
const transcribeAudio = async (audio: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append("file", audio);
  formData.append("model", "whisper-1");

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.text;
};

// Convert ReadableStream to Blob
const streamToBlob = async (stream: ReadableStream<Uint8Array>): Promise<Blob> => {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  let done = false;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) {
      chunks.push(value);
    }
    done = readerDone;
  }

  const blob = new Blob(chunks, { type: 'audio/wav' });
  console.log("Blob size:", blob.size);
  return blob;
};

export const POST = async (req: NextRequest) => {
  try {
    const audioStream = req.body; // Assuming the voice recording is sent as a binary stream

    if (!audioStream) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    // Convert the stream to a Blob
    const audioBlob = await streamToBlob(audioStream);

    // Transcribe the audio to text using Whisper API
    const transcript = await transcribeAudio(audioBlob);

    const { selfQueryRetriever, llm } = await setupPineconeLangchain();

    // Step 1: Use the LLM to determine if the text is a complaint and generate a summary
    const complaintCheckPrompt = `Is the following text a complaint? If yes, provide a summary in plain text without using markdown: "${transcript}"`;

    const complaintCheckResponse = await llm.invoke([
      { type: 'system', content: 'You are a system that identifies complaints and summarizes them in plain text without using markdown.' },
      { type: 'user', content: complaintCheckPrompt },
    ]) as { content: string } | string;

    let content: string;
    if (typeof complaintCheckResponse === 'string') {
      content = complaintCheckResponse;
    } else if ('content' in complaintCheckResponse) {
      content = complaintCheckResponse.content;
    } else {
      throw new Error("Unexpected response format from LLM");
    }

    const summary = content.replace("Yes, the text is a complaint.", "").trim();
    const isComplaint = content.toLowerCase().includes("yes");

    if (!isComplaint) {
      return NextResponse.json({
        complaint: false,
        summary: summary || null,
        product: null,
        subProduct: null,
      });
    }

    // Step 2: Retrieve relevant documents (if any) using Pinecone to assist in categorization
    const relevantDocuments = await selfQueryRetriever.invoke(transcript);
    const documentContents = relevantDocuments.map(doc => doc.pageContent).join("\n");

    // Step 3: Use the LLM to assign a product and sub-product category
    const categorizationPrompt = `Based on the following text and relevant documents, categorize this complaint into a product and sub-product in plain text without using markdown: "${transcript}". Relevant documents: "${documentContents}"`;

    const categorizationResponse = await llm.invoke([
      { type: 'system', content: 'You are a system that categorizes complaints into product and sub-product categories in plain text without using markdown.' },
      { type: 'user', content: categorizationPrompt },
    ]) as { content: string } | string;

    const categorization = typeof categorizationResponse === 'string'
      ? categorizationResponse
      : categorizationResponse.content;

    const [product, subProduct] = categorization.split("\n").map((line: string) =>
      line.replace(/^Product:|Sub-product:/, '').trim()
    );

    return NextResponse.json({
      complaint: true,
      summary: summary,
      product: product || null,
      subProduct: subProduct || null,
    });
  } catch (error : any) {
    console.error("Error processing query:", error.message, error.stack);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

// Allow handling of OPTIONS request (e.g., for CORS preflight)
export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
};
