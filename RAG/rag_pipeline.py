from pypdf import PdfReader



def load_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        content = page.extract_text()
        if content:
            text += content
    
    return text

def chunk_text(text,chunk_size,overlap):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start : end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks
pdf_text = load_pdf("Some_Useful_things_about_ML.pdf")

chunks = chunk_text(pdf_text,overlap = 100,chunk_size = 400)

from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

chunk_embeddings = model.encode(chunks)

print(type(chunk_embeddings))
print(len(chunk_embeddings))        
print(len(chunk_embeddings[0]))   


import faiss
import numpy as np