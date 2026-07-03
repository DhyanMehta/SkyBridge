import sys
import os
import types

# Vercel sets the backend directory as the root. We need imports like 'backend.main' to work.
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_mod = types.ModuleType("backend")
backend_mod.__path__ = [backend_root]
sys.modules["backend"] = backend_mod

from backend.main import app
