"""
TerraIQ AI RAG Regulatory Knowledge Base facade for DFZ and MZH.
"""
import sys
import os

api_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../api/fastapi"))
if api_path not in sys.path:
    sys.path.insert(0, api_path)

from infrastructure.regulatory_kb import REGULATORY_DOCUMENTS, get_all_regulatory_texts, search_regulatory_kb

__all__ = ["REGULATORY_DOCUMENTS", "get_all_regulatory_texts", "search_regulatory_kb"]
