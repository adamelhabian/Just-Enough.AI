from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "Backend"
ML_DIR = ROOT / "ML"

if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import app
