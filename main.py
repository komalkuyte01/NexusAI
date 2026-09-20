import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from rich import print
from src.tools import web_search, scrape_url

output = scrape_url.invoke("https://en.wikipedia.org/wiki/Artificial_intelligence")
print(output)
