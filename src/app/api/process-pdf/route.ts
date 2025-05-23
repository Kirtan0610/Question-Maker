// app/api/extract-pdf-text/route.ts
import { NextResponse } from "next/server";
import pdf from "pdf-parse";

export const runtime = "nodejs"; // Ensure this runs in a Node.js environment
export const maxDuration = 30; // Set a maximum duration for the API route

export async function POST(req: Request) {
  try {
    console.log("API route called");

    // Parse the FormData
    const formData = await req.formData();
    console.log("FormData received:", formData);

    // Get the file from FormData
    const file = formData.get("file") as File;
    if (!file) {
      console.error("No file provided");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Convert the file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      console.error("Empty file content");
      return NextResponse.json(
        { error: "Empty file content" },
        { status: 400 }
      );
    }

    console.log("Extracting text from PDF...");
    const data = await pdf(buffer);

    // Check if text was extracted
    if (!data.text || data.text.trim() === "") {
      console.error("No text content found in the PDF");
      return NextResponse.json(
        { error: "No text content found in the PDF" },
        { status: 422 }
      );
    }

    console.log("Text extracted successfully");
    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        error: "Failed to extract text from PDF. Please try again.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}