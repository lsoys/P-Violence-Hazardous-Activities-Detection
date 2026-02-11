"""
Optimized High-Accuracy SCVD Training
Faster convergence, no interruptions
"""

import os
import pickle
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score
from sklearn.preprocessing import StandardScaler
import json
from datetime import datetime
from tqdm import tqdm


class PrecomputedDataset(Dataset):
    """Dataset using pre-computed features"""
    
    def __init__(self, features, labels):
        self.features = features
        self.labels = labels
    
    def __len__(self):
        return len(self.labels)
    
    def __getitem__(self, idx):
        return {
            'features': torch.FloatTensor(self.features[idx]),
            'label': torch.LongTensor([self.labels[idx]])
        }


class OptimizedViolenceModel(nn.Module):
    """Optimized model for fast, accurate training"""
    
    def __init__(self, input_size=32, hidden_size=64, num_classes=3):
        super(OptimizedViolenceModel, self).__init__()
        
        # Simpler architecture for faster training
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=2,
            batch_first=True,
            bidirectional=True,
            dropout=0.3
        )
        
        lstm_out_size = hidden_size * 2
        
        # Simpler head
        self.fc1 = nn.Linear(lstm_out_size, 128)
        self.dropout1 = nn.Dropout(0.3)
        
        self.fc2 = nn.Linear(128, 64)
        self.dropout2 = nn.Dropout(0.2)
        
        self.fc3 = nn.Linear(64, num_classes)
        
        self.relu = nn.ReLU()
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        
        # Mean pooling
        pooled = torch.mean(lstm_out, dim=1)
        
        x = self.fc1(pooled)
        x = self.relu(x)
        x = self.dropout1(x)
        
        x = self.fc2(x)
        x = self.relu(x)
        x = self.dropout2(x)
        
        logits = self.fc3(x)
        
        return logits


def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for batch in dataloader:
        features = batch['features'].to(device)
        labels = batch['label'].squeeze(1).to(device)
        
        optimizer.zero_grad()
        outputs = model(features)
        loss = criterion(outputs, labels)
        
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        
        total_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)
    
    return total_loss / len(dataloader), correct / total


def validate(model, dataloader, criterion, device):
    """Validate model"""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for batch in dataloader:
            features = batch['features'].to(device)
            labels = batch['label'].squeeze(1).to(device)
            
            outputs = model(features)
            loss = criterion(outputs, labels)
            
            total_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)
            
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    return total_loss / len(dataloader), correct / total, all_preds, all_labels


def main():
    """Main training"""
    
    config = {
        'model_name': 'violence_detection_model_v2.pth',
        'epochs': 50,
        'batch_size': 8,
        'learning_rate': 0.001,
        'weight_decay': 1e-4,
        'hidden_size': 64,
        'num_classes': 3,
        'device': 'cuda' if torch.cuda.is_available() else 'cpu',
    }
    
    print("\n" + "="*80)
    print("OPTIMIZED VIOLENCE DETECTION TRAINING")
    print("="*80)
    print(f"Device: {config['device']}")
    print(f"Batch Size: {config['batch_size']}")
    print(f"Epochs: {config['epochs']}")
    print("="*80 + "\n")
    
    device = torch.device(config['device'])
    
    # Load features
    print("[1/5] Loading pre-extracted features...")
    features_file = r'd:\LSOYS APP AND GAMES\GITHUB -- dummy\XDVioDet\ckpt\scvd_features.pkl'
    
    if not os.path.exists(features_file):
        print("ERROR: Run preprocess_scvd_fast.py first!")
        return
    
    with open(features_file, 'rb') as f:
        all_data = pickle.load(f)
    
    train_features = np.array(all_data['train']['features'])
    train_labels = np.array(all_data['train']['labels'])
    test_features = np.array(all_data['test']['features'])
    test_labels = np.array(all_data['test']['labels'])
    
    print(f"  Train: {len(train_features)} samples")
    print(f"  Test: {len(test_features)} samples")
    
    # Normalize
    print("\n[2/5] Normalizing features...")
    scaler = StandardScaler()
    original_shape = train_features.shape
    train_flat = train_features.reshape(-1, train_features.shape[-1])
    train_flat = scaler.fit_transform(train_flat)
    train_features = train_flat.reshape(original_shape)
    
    test_flat = test_features.reshape(-1, test_features.shape[-1])
    test_flat = scaler.transform(test_flat)
    test_features = test_flat.reshape(test_features.shape[0], test_features.shape[1], -1)
    
    # Split
    print("\n[3/5] Creating train/val split...")
    indices = np.arange(len(train_features))
    train_idx, val_idx = train_test_split(
        indices, test_size=0.2, random_state=42,
        stratify=train_labels
    )
    
    train_feat = train_features[train_idx]
    train_lbl = train_labels[train_idx]
    val_feat = train_features[val_idx]
    val_lbl = train_labels[val_idx]
    
    # Datasets
    print("\n[4/5] Creating datasets...")
    train_dataset = PrecomputedDataset(train_feat, train_lbl)
    val_dataset = PrecomputedDataset(val_feat, val_lbl)
    test_dataset = PrecomputedDataset(test_features, test_labels)
    
    train_loader = DataLoader(train_dataset, batch_size=config['batch_size'], 
                            shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=config['batch_size'], 
                           shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=config['batch_size'], 
                            shuffle=False, num_workers=0)
    
    # Model
    print("\n[5/5] Creating model...")
    model = OptimizedViolenceModel(
        input_size=train_feat.shape[-1],
        hidden_size=config['hidden_size'],
        num_classes=config['num_classes']
    ).to(device)
    
    print(f"  Parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Training
    criterion = nn.CrossEntropyLoss(
        weight=torch.tensor([1.0, 1.5, 1.5]).to(device)
    )
    
    optimizer = optim.AdamW(model.parameters(), 
                           lr=config['learning_rate'],
                           weight_decay=config['weight_decay'])
    
    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=config['epochs'], eta_min=1e-6
    )
    
    print("\nTraining...\n")
    
    best_val_acc = 0
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
    
    for epoch in range(config['epochs']):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, 
                                           optimizer, device)
        val_loss, val_acc, _, _ = validate(model, val_loader, criterion, device)
        
        scheduler.step()
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"Epoch {epoch+1:3d}/{config['epochs']}: "
                  f"Train Loss={train_loss:.4f}, Acc={train_acc:.4f} | "
                  f"Val Loss={val_loss:.4f}, Acc={val_acc:.4f}")
        
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            model_path = os.path.join(
                r'd:\LSOYS APP AND GAMES\GITHUB -- dummy\XDVioDet\ckpt',
                config['model_name']
            )
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'config': config,
                'val_acc': val_acc
            }, model_path)
    
    # Test
    print("\n" + "="*80)
    print("TEST EVALUATION")
    print("="*80)
    
    model_path = os.path.join(
        r'd:\LSOYS APP AND GAMES\GITHUB -- dummy\XDVioDet\ckpt',
        config['model_name']
    )
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    
    test_loss, test_acc, test_preds, test_labels_list = validate(
        model, test_loader, criterion, device
    )
    
    print(f"\nTest Accuracy: {test_acc:.4f}")
    
    print("\nConfusion Matrix:")
    cm = confusion_matrix(test_labels_list, test_preds)
    print(cm)
    
    print("\nClassification Report:")
    class_names = ['Normal', 'Violence', 'Weaponized']
    print(classification_report(test_labels_list, test_preds, target_names=class_names))
    
    # Save results
    results = {
        'timestamp': datetime.now().isoformat(),
        'config': config,
        'test_accuracy': float(test_acc),
        'test_loss': float(test_loss),
        'confusion_matrix': cm.tolist(),
        'class_names': class_names,
        'training_history': history,
        'best_val_accuracy': float(best_val_acc)
    }
    
    results_path = os.path.join(
        r'd:\LSOYS APP AND GAMES\GITHUB -- dummy\XDVioDet\ckpt',
        'training_results.json'
    )
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=4)
    
    print(f"\n✓ Training complete!")
    print(f"✓ Model: {model_path}")
    print(f"✓ Test Accuracy: {test_acc:.4f}")
    print("="*80 + "\n")
    
    return model, config


if __name__ == "__main__":
    model, config = main()
