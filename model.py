
import torch
import torch.nn as nn
import torch.nn.functional as F


class Model(nn.Module):
    """Optimized LSTM-based violence detection model"""
    
    def __init__(self, args=None, input_size=32, hidden_size=128, num_classes=3):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True, num_layers=3, dropout=0.3, bidirectional=True)
        self.dropout = nn.Dropout(0.5)
        self.classifier = nn.Linear(hidden_size, num_classes)  # Use hidden_size, not 2*hidden_size
    
    def forward(self, inputs, seq_len=None):
        # inputs: (batch, seq, features)
        lstm_out, _ = self.lstm(inputs)  # (batch, seq, 2*hidden)
        # Take forward direction only
        forward_out = lstm_out[..., :128]  # (batch, seq, hidden)
        # Apply classifier to each timestep
        logits_per_frame = self.classifier(self.dropout(forward_out))  # (batch, seq, num_classes)
        # For overall, take mean across sequence
        overall_logits = logits_per_frame.mean(dim=1)  # (batch, num_classes)
        return overall_logits, logits_per_frame


