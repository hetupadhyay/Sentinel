import os
import io
import base64
import numpy as np
import cv2
import logging
from typing import Optional
from app.detectors.base import BaseDetector, DetectorResult

# We use delayed imports to avoid long startup times if the module isn't used immediately
# but for the detector we will import what we need.
logger = logging.getLogger(__name__)

class ImageImpersonationDetector(BaseDetector):
    def __init__(self):
        self.data_dir = os.path.join(os.getcwd(), "data")
        self.lfw_dir = os.path.join(self.data_dir, "lfw_home", "lfw_funneled")
        self._lfw_initialized = False

    def _ensure_lfw(self):
        if self._lfw_initialized and os.path.exists(self.lfw_dir):
            return
        
        logger.info("Initializing LFW dataset for facial recognition (this may take a while)...")
        from sklearn.datasets import fetch_lfw_people
        # We fetch the dataset to ensure it's downloaded to data_home
        fetch_lfw_people(data_home=self.data_dir, download_if_missing=True)
        self._lfw_initialized = True
        logger.info("LFW dataset ready.")

    def warmup(self):
        """Warm up the detector by indexing the LFW dataset in the background."""
        try:
            self._ensure_lfw()
            import cv2
            import numpy as np
            # Create a tiny dummy image to trigger DeepFace.find indexing
            dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
            from deepface import DeepFace
            logger.info("Starting background indexing of facial dataset (this will take time)...")
            DeepFace.find(img_path=dummy_img, db_path=self.lfw_dir, enforce_detection=False, model_name="Facenet")
            logger.info("Facial dataset indexing complete.")
        except Exception as e:
            logger.error(f"Warmup failed: {e}")

    def _base64_to_cv2(self, b64_string: str):
        # Remove data URI prefix if present
        if "base64," in b64_string:
            b64_string = b64_string.split("base64,")[1]
        
        img_data = base64.b64decode(b64_string)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img

    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        image1_base64 = kwargs.get("image1_base64")
        image2_base64 = kwargs.get("image2_base64")

        if not image1_base64:
            return DetectorResult(score=0.0, confidence=100.0, signals=["No image provided"])

        from deepface import DeepFace

        try:
            img1 = self._base64_to_cv2(image1_base64)
            
            if image2_base64:
                # 2-Input Mode: Verify if img1 matches img2
                img2 = self._base64_to_cv2(image2_base64)
                
                # enforce_detection=False ensures it doesn't crash if face is slightly occluded
                result = DeepFace.verify(img1_path=img1, img2_path=img2, enforce_detection=False, model_name="Facenet")
                
                verified = result.get("verified", False)
                distance = result.get("distance", 0.0)
                
                if verified:
                    return DetectorResult(
                        score=0.0,
                        confidence=95.0,
                        signals=["Faces match identically. No impersonation detected."],
                        metadata={"distance": distance}
                    )
                else:
                    return DetectorResult(
                        score=95.0,
                        confidence=90.0,
                        signals=[
                            "CRITICAL: The uploaded suspect image does NOT match the reference ID.",
                            f"Facial distance metric: {distance:.2f} (exceeds threshold)"
                        ],
                        metadata={"distance": distance}
                    )
            else:
                # 1-Input Mode: Check against celebrity database (LFW)
                self._ensure_lfw()
                
                dfs = DeepFace.find(img_path=img1, db_path=self.lfw_dir, enforce_detection=False, model_name="Facenet")
                
                if len(dfs) > 0 and len(dfs[0]) > 0:
                    # Match found in LFW
                    match_path = dfs[0].iloc[0]['identity']
                    # Extract name from path e.g., data/lfw_home/lfw_funneled/George_W_Bush/George_W_Bush_0001.jpg
                    person_name = os.path.basename(os.path.dirname(match_path)).replace("_", " ")
                    
                    return DetectorResult(
                        score=90.0,
                        confidence=85.0,
                        signals=[
                            f"HIGH RISK: Image matches known public figure/celebrity: {person_name}.",
                            "Potential impersonation or deepfake usage of a public profile."
                        ],
                        metadata={"matched_person": person_name, "match_path": match_path}
                    )
                else:
                    return DetectorResult(
                        score=0.0,
                        confidence=80.0,
                        signals=["Image does not match any known high-profile public figures in the watchlist."]
                    )

        except Exception as e:
            logger.error(f"DeepFace analysis failed: {str(e)}")
            return DetectorResult(
                score=50.0, 
                confidence=20.0, 
                signals=[f"Facial recognition failed to process image: {str(e)}"]
            )
