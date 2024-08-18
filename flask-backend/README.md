# RAG Ollama document reader

This project uses technology like Langchain, Chroma DB, Ollama embeddings, as well as utilizes Ollama to run open source LLM models to perform RAG on PDFs. The solution is fully local without using any external models and APIs.

## Getting Started

### Ollama

Before running, ensure that ollama has been installed. If not, please install it [here](https://ollama.com/download). After that you **must** run `ollama serve` to start Ollama server on your machine.

We will be using `mistral` as the base LLM model and `nomic-embed-text` as the embedding model in this project.

```shell
# Pull the required models if you haven't
ollama pull nomic-embed-text
ollama pull mistral

# Start Ollama server
ollama serve
```

### Run Project

```shell
conda create -n flask-backend
conda activate flask-backend

# Install Dependencies
pip install -r requirements.txt

# Start the server
python app.py
```
