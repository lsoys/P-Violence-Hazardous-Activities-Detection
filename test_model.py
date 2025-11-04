#!/usr/bin/env python3
"""
Test script to debug the model without running the full Flask app
"""

import torch
import numpy as np
from model import Model
import option
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_model():
    """Test the model with dummy data"""
    try:
        # Check device
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {device}")
        
        # Create model
        args = option.parser.parse_args()
        args.feature_size = 1152
        args.num_classes = 1
        
        model = Model(args)
        model.to(device)
        model.eval()
        
        logger.info("✓ Model created successfully")
        
        # Create dummy features (same shape as real features)
        features = np.random.randn(200, 1152).astype(np.float32)
        features_tensor = torch.from_numpy(features).to(device)
        
        # Add batch dimension: (seq_len, features) -> (1, seq_len, features)
        if features_tensor.dim() == 2:
            features_tensor = features_tensor.unsqueeze(0)
            
        logger.info(f"Features tensor shape: {features_tensor.shape}, device: {features_tensor.device}")
        
        # Test forward pass
        with torch.no_grad():
            logits, logits2 = model(features_tensor, seq_len=None)
            logger.info(f"✓ Forward pass successful")
            logger.info(f"Logits shape: {logits.shape}, Logits2 shape: {logits2.shape}")
            
            # Process outputs like in the main app
            logits_squeezed = torch.squeeze(logits)
            frame_predictions = torch.sigmoid(logits_squeezed).cpu().numpy()
            
            if frame_predictions.ndim == 0:
                frame_predictions = np.array([frame_predictions])
            elif frame_predictions.ndim == 1:
                pass  # Already 1D
            else:
                frame_predictions = np.mean(frame_predictions, axis=1)
            
            overall_confidence = float(np.mean(frame_predictions))
            
            logger.info(f"✓ Post-processing successful")
            logger.info(f"Overall confidence: {overall_confidence:.3f}")
            logger.info(f"Frame predictions shape: {frame_predictions.shape}")
            logger.info(f"Sample frame predictions: {frame_predictions[:10]}")
            
        return True
        
    except Exception as e:
        logger.error(f"✗ Error: {e}", exc_info=True)
        return False

if __name__ == "__main__":
    logger.info("Starting model test...")
    success = test_model()
    if success:
        logger.info("✓ All tests passed!")
    else:
        logger.error("✗ Tests failed!")