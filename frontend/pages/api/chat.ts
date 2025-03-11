import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import FormData from "form-data";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Parse form data using formidable
    const form = new formidable.IncomingForm();
    
    // Parse the incoming request
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "Error parsing form data", details: err.message });
      }

      // Create new FormData object to send to backend
      const formData = new FormData();

      // Append text fields (if fields are arrays, we use the first one)
      for (const key in fields) {
        const field = fields[key];
        if (Array.isArray(field)) {
          // If it's an array, we take the first value (or handle it accordingly)
          formData.append(key, field[0] ?? ""); // Fallback to empty string if null
        } else if (field) {
          formData.append(key, field as string);  // Otherwise, it's a single string
        }
      }

      // Append file(s) if any
      if (files.file) {
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        fileArray.forEach((file) => {
          if (file.filepath) {
            formData.append("file", fs.createReadStream(file.filepath), file.originalFilename ?? "default.jpg"); // Fallback if filename is null
          }
        });
      }

      // Send the multipart/form-data request to the backend
      const response = await axios.post("http://127.0.0.1:8000/api/chat/", formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      return res.status(200).json(response.data);
    });
  } catch (error: unknown) {
    // Narrow the type of error to an instance of Error
    if (error instanceof Error) {
      return res.status(500).json({ error: "Failed to communicate with backend", details: error.message });
    } else {
      // If it's not an instance of Error, return a generic error message
      return res.status(500).json({ error: "Failed to communicate with backend" });
    }
  }
}
