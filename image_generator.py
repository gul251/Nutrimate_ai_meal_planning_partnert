from dotenv import load_dotenv
import requests
import os
import uuid

# load env FIRST
load_dotenv()

# environment variable
HF_TOKEN = os.getenv("Meal_img_generate", "")

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

def generate_image(prompt, save_dir="generated_images"):
    """
    Generate AI image from prompt using HuggingFace SDXL API
    Returns: file path or None
    """

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": prompt},
            timeout=60
        )

        if response.status_code == 200:

            os.makedirs(save_dir, exist_ok=True)

            file_name = f"{uuid.uuid4().hex}.png"
            file_path = os.path.join(save_dir, file_name)

            with open(file_path, "wb") as f:
                f.write(response.content)

            return file_path

        else:
            print("❌ HF API Error:", response.text)
            return None

    except Exception as e:
        print("❌ Image generation failed:", str(e))
        return None
    


