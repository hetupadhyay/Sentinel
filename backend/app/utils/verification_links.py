# backend/app/utils/verification_links.py

import urllib.parse

def generate_verification_link(company: str, title: str) -> str:
    """
    Generates a Google Search query restricted to the company's official domain
    if known, otherwise a general professional search query.
    """
    if not company:
        return ""
        
    # Mapping of common companies to their official career site domains
    CAREER_DOMAINS = {
        "Google": "careers.google.com",
        "Meta": "metacareers.com",
        "Amazon": "amazon.jobs",
        "Microsoft": "careers.microsoft.com",
        "Apple": "apple.com/jobs",
        "Netflix": "jobs.netflix.com",
        "Nvidia": "nvidia.com/en-us/about-nvidia/careers",
        "OpenAI": "openai.com/careers",
        "Anthropic": "anthropic.com/careers",
        "Tesla": "tesla.com/careers",
        "Goldman Sachs": "goldmansachs.com/careers",
        "JPMorgan": "jpmorganchase.com/careers",
    }
    
    domain = CAREER_DOMAINS.get(company)
    query = f'"{title}"' if title else f'"{company}" jobs'
    
    if domain:
        full_query = f'site:{domain} {query}'
    else:
        full_query = f'official career site "{company}" {query}'
        
    encoded_query = urllib.parse.quote(full_query)
    return f"https://www.google.com/search?q={encoded_query}"
