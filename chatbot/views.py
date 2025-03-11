import os
import pytesseract
import tempfile
from PIL import Image
import fitz  # PyMuPDF for PDF extraction
import docx
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from openai import AzureOpenAI
from .models import Conversation
from .serializers import ConversationSerializer

# Configure the Azure OpenAI credentials
AZURE_OPENAI_API_KEY = "ec28868b64064a5ead7ecc86857de9ab"
AZURE_OPENAI_API_BASE = "https://mapu-openai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview"
AZURE_OPENAI_API_VERSION = "2024-08-01-preview"

# Initialize the Azure OpenAI Client
client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    base_url=AZURE_OPENAI_API_BASE,
    api_version=AZURE_OPENAI_API_VERSION,
)

class ChatAPIView(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)  # Allow multipart form data, form, and json

    def post(self, request, *args, **kwargs):
        content_type = request.content_type
        user_message = request.data.get("message", None)
        file = request.data.get("file", None)

        # Validate that the user message is provided
        if not user_message:
            return Response({"error": "User message is required."}, status=status.HTTP_400_BAD_REQUEST)

        bot_reply = ""
        file_url = None
        extracted_text = ""

        # Process file if provided (handle multipart/form-data)
        if file:
            try:
                # Store the file temporarily
                temp_file = self.store_file_temporarily(file)

                # Extract text from the file
                extracted_text = self.extract_text_from_file(temp_file)

                # Combine extracted text with the user message
                combined_input = f"{user_message}\n\nExtracted Text from File: {extracted_text}" if extracted_text else user_message

                # Send combined input to GPT-4 for analysis
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": combined_input}],
                )
                bot_reply = response.choices[0].message.content

                # Optionally, set file URL or path (if needed for further processing)
                file_url = temp_file

                # Remove temporary file after processing
                os.remove(temp_file)

            except Exception as e:
                return Response({"error": f"Error processing file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            # If no file, just send the user message to GPT-4
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": user_message}],
            )
            bot_reply = response.choices[0].message.content

        # Store the conversation (text + file URL if present)
        conversation = Conversation.objects.create(
            user_message=user_message,
            bot_reply=bot_reply,
            file_url=file_url if file else None  # Save file URL if file exists
        )
        serializer = ConversationSerializer(conversation)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def store_file_temporarily(self, file):
        """Store the file temporarily."""
        # Create a temporary directory to store the file
        temp_dir = tempfile.mkdtemp()

        # Write the file to the temporary directory
        temp_file_path = os.path.join(temp_dir, file.name)

        with open(temp_file_path, 'wb') as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)

        return temp_file_path

    def extract_text_from_file(self, file):
        """Extracts text from images and documents."""
        file_extension = file.split('.')[-1].lower()

        extracted_text = ""

        if file_extension in ["jpg", "jpeg", "png"]:  # For image files
            # Use OCR to extract text from the image
            image = Image.open(file)
            extracted_text = pytesseract.image_to_string(image)

        elif file_extension in ["pdf"]:  # For PDF files
            # Extract text from PDF using PyMuPDF
            doc = fitz.open(file)
            for page in doc:
                extracted_text += page.get_text()

        elif file_extension in ["docx"]:  # For DOCX files
            # Extract text from DOCX files
            doc = docx.Document(file)
            for paragraph in doc.paragraphs:
                extracted_text += paragraph.text

        return extracted_text if extracted_text else "No text extracted from the file."
