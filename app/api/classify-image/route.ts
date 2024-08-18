import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../config/Firebase'; // Adjust the path as needed

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Ensure the file is of type 'File'
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Uploaded file must be a File' }, { status: 400 });
    }

    // Upload the file to Firebase Storage
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, new Uint8Array(await file.arrayBuffer()));
    const imageUrl = await getDownloadURL(storageRef);

    // Make a request to OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What is displayed in the image?",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            },
          ]
        },
      ],
      max_tokens: 300,
    });

    const description = response.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
