from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms.ollama import Ollama
import pandas as pd
from pandasai import SmartDataframe
from get_embedding_function import get_embedding_function

CHROMA_PATH = "chroma"
SCORE_THRESHOLD = 450

PROMPT_TEMPLATE = """
Additional context:

{context}

---

Answer this question: {question}
"""

EXTRA_CSV_PROMPT = "Answer as short as possible. You have a pandas dataframe variable df, answer as simple as possible for this user query:"

prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
model = Ollama(model="mistral")

def query(query_text: str):
    # Prepare the DB.
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)
    
    # Search the DB.
    results = db.similarity_search_with_score(query_text, k=3)

    # filtered_results = [(doc, score) for doc, score in results if score > SCORE_THRESHOLD]
    context_text = "\n\n---\n\n".join([doc.page_content for doc, score in results if score < SCORE_THRESHOLD])
    
    prompt = prompt_template.format(context=context_text, question=query_text)
    # print(prompt)

    for chunk in model.stream(prompt):
        yield chunk
    sources = [{ doc.metadata.get("id", None): score } for doc, score in results if score < SCORE_THRESHOLD]
    yield '\n\nSources: ' + str(sources)

def query_csv(filename: str, query: str):
    df = pd.read_csv(f'data/{filename}')
    llm = model
    # Initialize SmartDataframe with DataFrame and LLM configuration
    pandas_ai = SmartDataframe(df, config={ "llm": llm, "open_charts": False })
    # Chat with the DataFrame using the provided query
    result = pandas_ai.chat(f'{EXTRA_CSV_PROMPT}: {query}', 'string')
    print(f'Final result: {result}')
    return result

def ping_query(query_text: str):
    prompt = prompt_template.format(context="", question=query_text)
    result = model.invoke(prompt)
    print(f"Ping Result: {result}")
