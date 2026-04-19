# backend/warmup_ai.py
import os
import logging
import numpy as np
import cv2
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("warmup")

def warmup():
    logger.info("🚀 Starting Sentinel AI Warmup & Pre-loading...")

    # 1. Spacy Model
    logger.info("📦 Step 1: Downloading Spacy NLP model (en_core_web_sm)...")
    try:
        import spacy
        if not spacy.util.is_package("en_core_web_sm"):
            os.system("python -m spacy download en_core_web_sm")
            logger.info("Spacy model downloaded.")
        else:
            logger.info("Spacy model already exists.")
    except Exception as e:
        logger.error(f"Failed to download Spacy model: {e}")

    # 2. NLTK Data
    logger.info("📦 Step 2: Downloading NLTK data (punkt, stopwords)...")
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        logger.info("NLTK data downloaded.")
    except Exception as e:
        logger.error(f"Failed to download NLTK data: {e}")

    # 3. LFW Dataset (Celebrity Watchlist)
    logger.info("📦 Step 3: Downloading LFW celebrity dataset (for impersonation detection)...")
    try:
        from sklearn.datasets import fetch_lfw_people
        data_dir = os.path.join(os.getcwd(), "data")
        lfw_dir = os.path.join(data_dir, "lfw_home", "lfw_funneled")
        fetch_lfw_people(data_home=data_dir, download_if_missing=True)
        logger.info("LFW dataset downloaded.")
    except Exception as e:
        logger.error(f"Failed to download LFW dataset: {e}")

    # 4. DeepFace Models & Detectors
    logger.info("📦 Step 4: Pre-loading DeepFace models & facial detectors...")
    try:
        from deepface import DeepFace
        
        # Models to pre-load (downloading weights)
        # Facenet is our primary model for impersonation
        # VGG-Face is a common alternative
        models = ["Facenet", "VGG-Face"]
        for model in models:
            logger.info(f"   - Building {model} model weights...")
            DeepFace.build_model(model)
        
        # Detectors to pre-load
        # opencv is fast, retinaface is high precision
        detectors = ["opencv", "retinaface"]
        dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
        for det in detectors:
            logger.info(f"   - Warming up {det} facial detector...")
            try:
                DeepFace.extract_faces(img_path=dummy_img, detector_backend=det, enforce_detection=False)
            except:
                pass # Dummy images might fail detection, but weights are downloaded
        
        # 5. Indexing the LFW Dataset
        # This is critical for "finding" celebrities in seconds
        logger.info("📦 Step 5: Indexing facial dataset (creating embeddings)...")
        if os.path.exists(lfw_dir):
            # This creates the representations_facenet.pkl file
            DeepFace.find(img_path=dummy_img, db_path=lfw_dir, model_name="Facenet", enforce_detection=False)
            logger.info("Facial indexing complete.")
        else:
            logger.warning(f"LFW directory not found at {lfw_dir}, skipping indexing.")
            
    except Exception as e:
        logger.error(f"DeepFace warmup failed: {e}")

    logger.info("✅ All models and datasets are pre-loaded. Sentinel is ready for instant analysis!")

if __name__ == "__main__":
    warmup()
