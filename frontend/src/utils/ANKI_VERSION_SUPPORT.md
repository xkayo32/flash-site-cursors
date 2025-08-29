# Suporte de Versões do Anki

## Versões Suportadas

### ✅ Anki 2.1.x (RECOMENDADO)
- **Arquivo de coleção**: `collection.anki21`
- **Status**: Totalmente suportado
- **Notas**: Versão mais comum e estável. Recomendamos usar Anki 2.1 para exportação.

### ✅ Anki 2.0.x
- **Arquivo de coleção**: `collection.anki2`
- **Status**: Suportado com limitações
- **Limitações**: 
  - Alguns tipos de campos podem não ser reconhecidos
  - Modelos de cards mais básicos

### ⚠️ Anki 2.3.x (Futuro)
- **Arquivo de coleção**: `collection.anki23`
- **Status**: Não suportado
- **Fallback**: Exportar como JSON

### ❌ Versões Desconhecidas
- **Status**: Não suportado
- **Fallback**: Exportar como JSON ou TXT

## Formatos de Importação Alternativos

### JSON (Recomendado para versões não suportadas)

#### 1. Formato Anki JSON
```json
{
  "notes": [
    {
      "id": "1234",
      "flds": "Frente\x1fVerso",
      "tags": "tag1 tag2",
      "modelName": "Basic"
    }
  ]
}
```

#### 2. Formato AnkiConnect
```json
{
  "result": [
    {
      "noteId": "1234",
      "fields": {
        "Front": "Pergunta",
        "Back": "Resposta"
      },
      "tags": ["tag1", "tag2"],
      "modelName": "Basic"
    }
  ]
}
```

#### 3. Nosso Formato Padrão
```json
[
  {
    "type": "basic",
    "front": "Pergunta",
    "back": "Resposta",
    "tags": ["tag1", "tag2"],
    "difficulty": "medium"
  }
]
```

### CSV
```csv
Front,Back,Tags,Type,Extra
"Pergunta","Resposta","tag1, tag2","basic","Informação extra"
```

## Como Exportar do Anki

### Para versões suportadas (Anki 2.0.x e 2.1.x):
1. No Anki, vá em **Arquivo > Exportar**
2. Escolha **Anki Deck Package (*.apkg)**
3. Selecione o deck desejado
4. Clique em **Exportar**

### Para versões não suportadas:
1. **Opção 1 - JSON via AnkiConnect**:
   - Instale o addon AnkiConnect
   - Use a API para exportar as notas em JSON
   
2. **Opção 2 - Texto Simples**:
   - No Anki, vá em **Arquivo > Exportar**
   - Escolha **Cards in Plain Text (*.txt)**
   - Converta manualmente para JSON

3. **Opção 3 - CSV**:
   - Use um addon de exportação CSV
   - Ou exporte como texto e converta

## Detecção Automática de Versão

O sistema detecta automaticamente a versão do Anki baseado nos arquivos dentro do APKG:

1. **Extração do ZIP**: O arquivo .apkg é descompactado
2. **Busca pelo arquivo de coleção**: Procura por `collection.anki21`, `collection.anki2`, etc.
3. **Validação da estrutura**: Verifica se o banco SQLite tem as tabelas necessárias
4. **Fallback automático**: Se a versão não é suportada, sugere alternativas

## Tipos de Cards Suportados

### Modelos Anki → Nossos Tipos
- **Basic** → `basic`
- **Basic (and reversed card)** → `basic_inverted`
- **Basic (type in the answer)** → `type_answer`
- **Cloze** → `cloze`
- **Basic (optional reversed card)** → `basic_inverted`
- **Image Occlusion** → `image_occlusion` (Anki 2.1+)

## Processamento de Campos

### Anki 2.0.x
- Front, Back, Text, Extra

### Anki 2.1.x
- Front, Back, Text, Extra, Header, Image

### Mapeamento Automático
O sistema mapeia automaticamente os campos do Anki para nosso formato:
- `Front` → `front`
- `Back` → `back`
- `Extra` → `extra`
- `Text` → `text` (para cloze)

## Tratamento de Erros

### Erro: "Versão do Anki não suportada"
**Solução**: Exporte o deck como JSON ou use Anki 2.1.x

### Erro: "Arquivo de coleção não encontrado"
**Solução**: O arquivo APKG pode estar corrompido. Re-exporte do Anki.

### Erro: "Estrutura do banco SQLite inválida"
**Solução**: O arquivo pode estar corrompido ou ser de uma versão muito antiga/nova.

## Limitações Conhecidas

1. **Mídia/Imagens**: Suporte parcial para imagens embedadas
2. **Modelos Customizados**: Modelos muito customizados podem não ser reconhecidos
3. **Scheduling Info**: Informações de repetição espaçada não são importadas
4. **Decks Hierárquicos**: Estrutura de subdecks é achatada

## Recomendações

1. **Use Anki 2.1.x** para melhor compatibilidade
2. **Exporte como JSON** se tiver problemas com APKG
3. **Teste com poucos cards** antes de importar decks grandes
4. **Mantenha backup** dos seus decks originais