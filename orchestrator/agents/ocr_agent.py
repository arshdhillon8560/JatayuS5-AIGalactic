import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def extract_text_s3(s3_key):
    try:
        bucket = os.getenv("AWS_S3_BUCKET")

        print("\n Reading from S3:", s3_key)
        print("Bucket:", bucket)

        if not bucket:
            raise Exception("AWS_S3_BUCKET is missing in env")

        client = boto3.client(
            "textract",
            region_name=os.getenv("AWS_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

        response = client.detect_document_text(
            Document={
                "S3Object": {
                    "Bucket": bucket,
                    "Name": s3_key
                }
            }
        )

        text = ""
        for block in response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                text += block["Text"] + "\n"

        print("OCR TEXT LENGTH:", len(text))
        return text

    except Exception as e:
        print("OCR ERROR:", str(e))
        return ""