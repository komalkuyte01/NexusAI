import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from rich import print
from src.tools import web_search

output = web_search.invoke("Latest news on artificial intelligence")
print(output)
