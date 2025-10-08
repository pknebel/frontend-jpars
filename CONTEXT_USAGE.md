# Guia de Uso do Contexto de Gramática

## Visão Geral

Este sistema implementa um contexto React para gerenciar a gramática selecionada pelo usuário. O ID da gramática e todas as suas propriedades ficam disponíveis globalmente para todas as páginas do aplicativo.

## Estrutura do Contexto

O contexto (`GramaticaContext`) armazena:
- **idWorkflow**: ID único da gramática selecionada
- **gramatica**: Texto completo da gramática
- **nivel**: Nível de dificuldade (Fácil, Intermediário, Difícil)
- **possuiRecursao**: Boolean indicando se possui recursão
- **possuiFatoracao**: Boolean indicando se possui fatoração
- **gramaticaSelecionada**: Objeto completo do workflow

## Como Usar em Componentes

### 1. Importar o Hook

```javascript
import { useGramatica } from '../contexts/GramaticaContext';
// ou para páginas em subpastas:
import { useGramatica } from '../../contexts/GramaticaContext';
```

### 2. Usar o Hook no Componente

```javascript
function MeuComponente() {
  const { 
    idWorkflow,           // ID da gramática
    gramaticaSelecionada, // Objeto completo
    hasGramaticaSelecionada, // Função para verificar se há gramática
    selecionarGramatica,  // Função para selecionar nova gramática
    limparGramatica       // Função para limpar seleção
  } = useGramatica();

  // Usar o ID em chamadas à API
  useEffect(() => {
    if (hasGramaticaSelecionada()) {
      fetch(`http://localhost:8080/jpars/algo/${idWorkflow}`)
        .then(response => response.json())
        .then(data => console.log(data));
    }
  }, [idWorkflow, hasGramaticaSelecionada]);

  return (
    <div>
      <h1>Minha Página</h1>
      {gramaticaSelecionada && (
        <p>Trabalhando com gramática ID: {idWorkflow}</p>
      )}
    </div>
  );
}
```

### 3. Verificar e Redirecionar se Não Houver Gramática

É uma boa prática verificar se há uma gramática selecionada e redirecionar o usuário caso não haja:

```javascript
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../contexts/GramaticaContext';

function MinhaTelaQueNecessitaGramatica() {
  const navigate = useNavigate();
  const { hasGramaticaSelecionada, idWorkflow } = useGramatica();

  useEffect(() => {
    if (!hasGramaticaSelecionada()) {
      console.log('Nenhuma gramática selecionada. Redirecionando...');
      navigate('/selecao-gramatica');
    }
  }, [hasGramaticaSelecionada, navigate]);

  // Restante do código...
}
```

## Propriedades Disponíveis

| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| `idWorkflow` | number \| null | ID único da gramática selecionada |
| `gramatica` | string \| null | Texto completo da gramática |
| `nivel` | string \| null | Nível de dificuldade |
| `possuiRecursao` | boolean | Se a gramática possui recursão |
| `possuiFatoracao` | boolean | Se a gramática possui fatoração |
| `gramaticaSelecionada` | object \| null | Objeto completo do workflow |

## Funções Disponíveis

### `selecionarGramatica(workflow)`
Seleciona uma gramática e armazena no contexto e localStorage.

```javascript
const { selecionarGramatica } = useGramatica();

const handleSelect = (workflow) => {
  selecionarGramatica(workflow);
  navigate('/proxima-tela');
};
```

### `limparGramatica()`
Remove a seleção atual do contexto e localStorage.

```javascript
const { limparGramatica } = useGramatica();

const handleClear = () => {
  limparGramatica();
  navigate('/selecao-gramatica');
};
```

### `hasGramaticaSelecionada()`
Verifica se há uma gramática selecionada.

```javascript
const { hasGramaticaSelecionada } = useGramatica();

if (hasGramaticaSelecionada()) {
  // Fazer algo com a gramática
}
```

### `getIdGramatica()`
Retorna apenas o ID da gramática (ou null).

```javascript
const { getIdGramatica } = useGramatica();
const id = getIdGramatica(); // Retorna o ID ou null
```

## Persistência

O contexto automaticamente:
- **Salva** a gramática selecionada no `localStorage` quando uma nova gramática é selecionada
- **Restaura** a gramática do `localStorage` quando a aplicação é recarregada
- **Remove** a gramática do `localStorage` quando `limparGramatica()` é chamado

Isso significa que o usuário não perde a seleção ao recarregar a página!

## Exemplos de Uso nas Páginas

### Exemplo 1: Validar Gramática com o ID

```javascript
const handleValidate = async () => {
  const payload = {
    idWorkflow: idWorkflow,
    gramaticaEntrada: minhaGramatica
  };

  const response = await fetch('http://localhost:8080/jpars/gramatica/validar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Processar resposta...
};
```

### Exemplo 2: Buscar Dados Baseados na Gramática

```javascript
useEffect(() => {
  if (idWorkflow) {
    fetch(`http://localhost:8080/jpars/gramatica/ll1/${idWorkflow}`)
      .then(res => res.text())
      .then(data => setGramaticaLL1(data));
  }
}, [idWorkflow]);
```

### Exemplo 3: Exibir Informações da Gramática

```javascript
return (
  <div>
    <h1>Trabalhando com Gramática</h1>
    {gramaticaSelecionada && (
      <>
        <p><strong>ID:</strong> {idWorkflow}</p>
        <p><strong>Nível:</strong> {nivel}</p>
        <p><strong>Possui Recursão:</strong> {possuiRecursao ? 'Sim' : 'Não'}</p>
        <p><strong>Possui Fatoração:</strong> {possuiFatoracao ? 'Sim' : 'Não'}</p>
        <pre>{gramatica}</pre>
      </>
    )}
  </div>
);
```

## Páginas Já Integradas

As seguintes páginas já estão usando o contexto:
- ✅ Seleção de Gramáticas
- ✅ Remoção de Recursão
- ✅ Fatoração
- ✅ First/Follow
- ✅ Geração da Tabela Sintática (básico)
- ✅ Recuperação de Erros (básico)
- ✅ Validação de Sentença (básico)

## Fluxo Recomendado

1. Usuário seleciona gramática em `/selecao-gramatica`
2. Sistema salva no contexto via `selecionarGramatica(workflow)`
3. Usuário é redirecionado para a próxima tela apropriada
4. Todas as telas subsequentes podem acessar `idWorkflow` e outras propriedades
5. Sistema persiste a seleção no localStorage para sobreviver recarregamentos

## Troubleshooting

### Problema: "useGramatica must be used within a GramaticaProvider"
**Solução**: Certifique-se de que o componente está dentro do `<GramaticaProvider>` no `App.jsx`.

### Problema: idWorkflow é null
**Solução**: Verifique se o usuário selecionou uma gramática primeiro. Use `hasGramaticaSelecionada()` para verificar.

### Problema: Dados não persistem após reload
**Solução**: O contexto usa localStorage automaticamente. Verifique se o localStorage não está desabilitado no navegador.

## Contribuindo

Ao adicionar novas páginas que precisam do ID da gramática:
1. Importe o hook `useGramatica`
2. Use `hasGramaticaSelecionada()` para verificar se há gramática
3. Redirecione para `/selecao-gramatica` se não houver
4. Use `idWorkflow` nas suas chamadas à API

