import boto3
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def extract_text_from_url(file_url):
    try:
        # Create Textract client
        client = boto3.client(
            "textract",
            region_name=os.getenv("AWS_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

        # Download file from Cloudinary (or any URL)
        response = requests.get(file_url)

        if response.status_code != 200:
            raise Exception("❌ Failed to download file")

        document_bytes = response.content

        # Call Textract
        result = client.detect_document_text(
            Document={"Bytes": document_bytes}
        )

        # Extract text
        extracted_text = ""

        for block in result["Blocks"]:
            if block["BlockType"] == "LINE":
                extracted_text += block["Text"] + "\n"

        return extracted_text

    except Exception as e:
        print("❌ OCR ERROR:", str(e))
        return ""


if __name__ == "__main__":

    # Replace with your Cloudinary file URL
    url = "https://res.cloudinary.com/dzl5iczuv/raw/upload/v1777441547/loan_documents/qdul6gcfceo9qnxhmgyw"

    print("\n🚀 Running OCR...\n")

    text = extract_text_from_url(url)

    print("\n===== OCR OUTPUT =====\n")
    print(text[:1000])   #print first 1000 characters