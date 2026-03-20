# ╔══════════════════════════════════════════════════════════════╗
# ║     ECOSCAN — COLAB TRAINING NOTEBOOK                       ║
# ║     Copy each CELL into Google Colab and run in order       ║
# ╚══════════════════════════════════════════════════════════════╝
# FIRST: Runtime → Change runtime type → T4 GPU → Save

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CELL 1 — Install Kaggle
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
!pip install kaggle
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CELL 2 — Upload kaggle.json and connect
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
from google.colab import files
files.upload()   # click Choose File → select kaggle.json

!mkdir -p ~/.kaggle
!cp kaggle.json ~/.kaggle/
!chmod 600 ~/.kaggle/kaggle.json
print("✅ Kaggle connected!")
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CELL 3 — Download TrashNet dataset (6 categories)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
!kaggle datasets download -d garythung/trashnet
!unzip -q trashnet.zip -d trash_data
!ls trash_data/dataset-resized/
print("✅ Dataset ready! You should see 6 folders above.")
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CELL 4 — Train the AI Model
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
import json, os, shutil, random

# ── Split dataset 80% train / 20% test ──────────────────────────
SOURCE = "trash_data/dataset-resized"
TRAIN  = "data/train"
TEST   = "data/test"

for split in [TRAIN, TEST]:
    for cls in os.listdir(SOURCE):
        os.makedirs(f"{split}/{cls}", exist_ok=True)

random.seed(42)
for cls in os.listdir(SOURCE):
    images = [f for f in os.listdir(f"{SOURCE}/{cls}") if f.endswith(('.jpg','.png','.jpeg'))]
    random.shuffle(images)
    cut = int(len(images) * 0.8)
    for img in images[:cut]:
        shutil.copy(f"{SOURCE}/{cls}/{img}", f"{TRAIN}/{cls}/{img}")
    for img in images[cut:]:
        shutil.copy(f"{SOURCE}/{cls}/{img}", f"{TEST}/{cls}/{img}")

print("✅ Dataset split: 80% train / 20% test")

# ── Data Augmentation ────────────────────────────────────────────
train_gen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=25,
    zoom_range=0.25,
    horizontal_flip=True,
    vertical_flip=False,
    shear_range=0.15,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest'
)
test_gen = ImageDataGenerator(rescale=1./255)

train_data = train_gen.flow_from_directory(
    TRAIN, target_size=(224, 224),
    batch_size=32, class_mode="categorical", shuffle=True
)
test_data = test_gen.flow_from_directory(
    TEST, target_size=(224, 224),
    batch_size=32, class_mode="categorical", shuffle=False
)

print(f"✅ Classes: {train_data.class_indices}")
print(f"   Train samples: {train_data.samples}")
print(f"   Test samples:  {test_data.samples}")

# ── Build Model (MobileNetV2 Transfer Learning) ──────────────────
base = MobileNetV2(weights="imagenet", include_top=False, input_shape=(224, 224, 3))
base.trainable = False  # freeze base

x = GlobalAveragePooling2D()(base.output)
x = BatchNormalization()(x)
x = Dense(512, activation="relu")(x)
x = Dropout(0.4)(x)
x = Dense(256, activation="relu")(x)
x = Dropout(0.3)(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.2)(x)
out = Dense(train_data.num_classes, activation="softmax")(x)

model = Model(inputs=base.input, outputs=out)
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

print(f"✅ Model built. Total params: {model.count_params():,}")

# ── Phase 1: Train top layers only (10 epochs) ───────────────────
print("\n📚 Phase 1: Training top layers...")
history1 = model.fit(
    train_data,
    validation_data=test_data,
    epochs=10,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(patience=2, factor=0.5, verbose=1)
    ]
)

# ── Phase 2: Fine-tune last 30 layers of base ────────────────────
print("\n🔧 Phase 2: Fine-tuning base model...")
base.trainable = True
for layer in base.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=Adam(learning_rate=0.0001),  # lower LR for fine-tuning
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

history2 = model.fit(
    train_data,
    validation_data=test_data,
    epochs=10,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(patience=2, factor=0.5, verbose=1)
    ]
)

# ── Save class labels ─────────────────────────────────────────────
labels = {str(v): k for k, v in train_data.class_indices.items()}
with open("class_labels.json", "w") as f:
    json.dump(labels, f)

# ── Save model ────────────────────────────────────────────────────
model.save("ewaste_model.h5")

best_acc = max(max(history1.history['val_accuracy']), max(history2.history['val_accuracy']))
print(f"\n✅ Training complete!")
print(f"   Best accuracy: {best_acc*100:.1f}%")
print(f"   Classes: {labels}")
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CELL 5 — Download files to your PC
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
from google.colab import files
files.download("ewaste_model.h5")      # ~15MB — the trained AI brain
files.download("class_labels.json")   # tiny — waste category names
print("✅ Both files downloaded to your PC!")
"""
