import os

def search_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if '[0.1]*1536' in content.replace(' ', ''):
                            print(f'Found in: {path}')
                        if 'mock_openai_embeddings' in content:
                            print(f'mock_openai_embeddings in: {path}')
                except Exception as e:
                    pass

search_files(r'C:\Users\expre\.gemini\antigravity\scratch\terraiq')
