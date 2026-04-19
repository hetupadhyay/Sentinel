import logging
from sklearn.datasets import fetch_lfw_people
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_download")

DATA_DIR = "/app/data"
os.makedirs(DATA_DIR, exist_ok=True)

try:
    logger.info("Attempting to fetch LFW dataset...")
    data = fetch_lfw_people(data_home=DATA_DIR, download_if_missing=True)
    logger.info(f"Successfully fetched {len(data.images)} images.")
except Exception as e:
    logger.error(f"Download failed: {e}")
