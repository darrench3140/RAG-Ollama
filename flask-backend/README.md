# RAG Ollama document reader

This project uses technology like Langchain, Chroma DB, Ollama embeddings, as well as utilizes Ollama to run open source LLM models to perform RAG on PDFs. The solution is fully local without using any external models and APIs.

## Getting Started

### Ollama

Before running, ensure that ollama has been installed. If not, please install it [here](https://ollama.com/download). After that you **must** run `ollama serve` to start Ollama server on your machine.

We will be using `mistral` as the base LLM model and `nomic-embed-text` as the embedding model in this project.

```shell
ollama pull nomic-embed-text
ollama pull mistral
```

### Run Project

```shell
# Install Dependencies
pip install -r requirements.txt

# Populate the database
python ./populate_database.py

# Clear the database then Populate it
python ./populate_database.py --reset

# Run the command with your query
python ./query_data.py "How much each players get for each round in Monopoly?"

# Run testcases
pytest ./test_rag.py
```

## Update document

1. Place new pdf files inside the `data` folder
1. `python ./populate_database.py`
