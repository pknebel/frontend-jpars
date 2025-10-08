# Sistema de Ajuda Inteligente - Documentação

## 📋 Visão Geral

Foi implementado um sistema de ajuda inteligente que auxilia o usuário após múltiplas tentativas incorretas nas telas de **Remoção de Recursão** e **Fatoração**.

## 🎯 Objetivo

Oferecer uma experiência de aprendizado progressiva onde:
- O usuário tem liberdade de tentar resolver o problema
- Após 3 tentativas incorretas, o sistema oferece ajuda
- O usuário pode aceitar ou rejeitar a ajuda
- Se rejeitar, ganha mais 3 tentativas
- O processo se repete até que o usuário acerte ou aceite a ajuda

## 🚀 Funcionalidades Implementadas

### 1. Contador de Tentativas
- Conta automaticamente tentativas incorretas de validação
- Reinicia quando o usuário acerta ou aceita ajuda
- Exibe logs no console para debug

### 2. Modal de Ajuda
- Aparece após 3 tentativas incorretas
- Design moderno e responsivo
- Bloqueia interações até que o usuário escolha uma opção

### 3. Busca de Resposta Correta
- Busca automaticamente a resposta do backend
- Endpoints específicos para cada tela
- Loading overlay durante o carregamento

### 4. Preenchimento Automático
- Preenche o campo de texto com a resposta correta
- Permite que o usuário valide e continue o fluxo

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:

#### 1. `/src/components/HelpModal.jsx`
Componente modal reutilizável para oferecer ajuda.

**Propriedades:**
```javascript
{
  isOpen: boolean,          // Controla visibilidade
  onAccept: () => void,     // Callback quando usuário aceita
  onReject: () => void,     // Callback quando usuário rejeita
  tentativas: number        // Número de tentativas (sempre 3)
}
```

#### 2. `/src/components/HelpModal.css`
Estilos do modal com animações e responsividade.

**Características:**
- Animação de fade-in para overlay
- Animação de slide-up para conteúdo
- Totalmente responsivo
- Z-index alto (10000) para garantir visibilidade
- Design moderno com gradiente roxo

### Arquivos Modificados:

#### 1. `/src/pages/RemocaoRecursao/index.jsx`
**Adicionado:**
- Estado `tentativasIncorretas` - contador de erros
- Estado `showHelpModal` - controle do modal
- Estado `isLoadingAnswer` - loading ao buscar resposta
- Função `buscarRespostaCorreta()` - busca do backend
- Função `handleAcceptHelp()` - quando usuário aceita ajuda
- Função `handleRejectHelp()` - quando usuário rejeita ajuda
- Lógica no `handleValidate()` para incrementar contador
- Modal no JSX
- Loading overlay no JSX

**Endpoint usado:**
```
GET http://localhost:8080/jpars/gramatica/sem-recursao/{idWorkflow}
```

#### 2. `/src/pages/Fatoracao/index.jsx`
**Adicionado:**
- Mesma estrutura da página de Remoção de Recursão
- Estado `tentativasIncorretas`
- Estado `showHelpModal`
- Estado `isLoadingAnswer`
- Função `buscarRespostaCorreta()`
- Função `handleAcceptHelp()`
- Função `handleRejectHelp()`
- Lógica no `handleValidate()`
- Modal no JSX
- Loading overlay no JSX

**Endpoint usado:**
```
GET http://localhost:8080/jpars/gramatica/ll1/{idWorkflow}
```

#### 3. `/src/pages/RemocaoRecursao/styles.css`
**Adicionado:**
- Classe `.loading-overlay` - overlay de carregamento
- Estilos para spinner e texto de loading

#### 4. `/src/pages/Fatoracao/styles.css`
**Adicionado:**
- Classe `.loading-overlay` - overlay de carregamento
- Estilos para spinner e texto de loading

## 🔄 Fluxo de Funcionamento

```
┌─────────────────────────────────────────┐
│  1. Usuário digita gramática            │
│     e clica em "Validar"                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  2. Sistema valida no backend           │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ✅ Correto      ❌ Incorreto
         │                │
         ▼                ▼
┌──────────────┐  ┌──────────────────────┐
│ Sucesso!     │  │ Incrementa contador  │
│ Pode avançar │  │ tentativasIncorretas │
└──────────────┘  └─────────┬────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │ tentativas >= 3?    │
                  └────┬───────┬────────┘
                       │       │
                   Não │       │ Sim
                       │       │
                       ▼       ▼
              ┌────────────┐  ┌──────────────┐
              │ Tente      │  │ Mostra modal │
              │ novamente  │  │ de ajuda     │
              └────────────┘  └──────┬───────┘
                                     │
                            ┌────────┴────────┐
                            │                 │
                       Usuário        Usuário
                       aceita         rejeita
                            │                 │
                            ▼                 ▼
              ┌──────────────────────┐  ┌─────────────┐
              │ Busca resposta do    │  │ Reseta      │
              │ backend e preenche   │  │ contador    │
              │ automaticamente      │  │ para 0      │
              └──────────────────────┘  └─────────────┘
```

## 💻 Exemplos de Uso

### Como o Sistema Detecta Erro

```javascript
// Em handleValidate()
if (response.ok) {
  // Sucesso - resetar contador
  setTentativasIncorretas(0);
  setIsValidated(true);
} else {
  // Erro - incrementar contador
  const novasTentativas = tentativasIncorretas + 1;
  setTentativasIncorretas(novasTentativas);
  
  // Verificar se atingiu 3 tentativas
  if (novasTentativas >= 3) {
    setShowHelpModal(true);
  }
}
```

### Como Buscar a Resposta Correta

```javascript
// Remoção de Recursão
const response = await fetch(
  `http://localhost:8080/jpars/gramatica/sem-recursao/${idWorkflow}`
);

// Fatoração
const response = await fetch(
  `http://localhost:8080/jpars/gramatica/ll1/${idWorkflow}`
);
```

### Como o Modal é Exibido

```jsx
<HelpModal
  isOpen={showHelpModal}
  onAccept={handleAcceptHelp}
  onReject={handleRejectHelp}
  tentativas={3}
/>
```

## 🎨 Interface do Usuário

### Modal de Ajuda

**Aparência:**
- Overlay escuro semi-transparente
- Card branco centralizado
- Header com gradiente roxo
- Texto explicativo claro
- Dois botões: "Não, quero tentar mais" e "Sim, mostrar resposta"

**Animações:**
- Fade-in do overlay (0.3s)
- Slide-up do conteúdo (0.3s)
- Hover nos botões com elevação

### Loading Overlay

**Aparência:**
- Tela cheia com fundo escuro
- Spinner centralizado
- Texto "Buscando resposta correta..."

## 📊 Estatísticas da Implementação

- **Arquivos Criados**: 2 (HelpModal.jsx + HelpModal.css)
- **Arquivos Modificados**: 4 (2 páginas + 2 arquivos CSS)
- **Linhas de Código**: ~300 linhas
- **Componentes Reutilizáveis**: 1 (HelpModal)
- **Build Status**: ✅ Compilado com sucesso

## 🧪 Como Testar

### Teste 1: Fluxo Completo com Rejeição
1. Abra a tela de Remoção de Recursão ou Fatoração
2. Digite uma gramática incorreta
3. Clique em "Validar" (1ª tentativa)
4. Digite outra gramática incorreta
5. Clique em "Validar" (2ª tentativa)
6. Digite outra gramática incorreta
7. Clique em "Validar" (3ª tentativa)
8. **Modal deve aparecer!**
9. Clique em "Não, quero tentar mais"
10. Você terá mais 3 tentativas

### Teste 2: Fluxo com Aceitação
1. Siga os passos 1-8 do Teste 1
2. Clique em "Sim, mostrar resposta"
3. **Loading deve aparecer**
4. **Campo deve ser preenchido automaticamente**
5. Mensagem de sucesso deve aparecer
6. Clique em "Validar" para confirmar

### Teste 3: Sucesso na 2ª Tentativa
1. Digite uma gramática incorreta (1ª tentativa)
2. Digite a gramática correta (2ª tentativa)
3. **Modal NÃO deve aparecer**
4. Contador deve ser resetado

## 🔍 Logs no Console

O sistema gera logs detalhados:

```javascript
// Quando erro é detectado
"Tentativa incorreta 1/3"
"Tentativa incorreta 2/3"
"Tentativa incorreta 3/3"

// Quando busca resposta
"Buscando resposta correta para gramática ID: 1"
"Resposta correta recebida: [conteúdo]"

// Quando usuário aceita
"Usando gramática do contexto: {...}"
```

## ⚙️ Configuração

### Alterar Número de Tentativas

Para mudar de 3 para outro número:

1. **No código (handleValidate):**
```javascript
// Trocar >= 3 por >= N
if (novasTentativas >= 3) {
  setShowHelpModal(true);
}
```

2. **No modal:**
```jsx
<HelpModal
  tentativas={3}  // Mudar para N
/>
```

### Customizar Mensagens

**Em handleRejectHelp():**
```javascript
setMessage('Você tem mais 3 tentativas. Boa sorte!');
// Pode ser alterado para qualquer mensagem
```

**Em handleAcceptHelp():**
```javascript
setMessage('Resposta correta preenchida! Clique em "Validar" para continuar.');
// Pode ser alterado para qualquer mensagem
```

## 🎓 Boas Práticas Aplicadas

1. **Componentes Reutilizáveis**: HelpModal pode ser usado em outras páginas
2. **Separação de Responsabilidades**: Lógica separada da apresentação
3. **Estados Independentes**: Cada página gerencia seus próprios contadores
4. **Feedback Visual**: Loading, mensagens e animações claras
5. **Acessibilidade**: Modal bloqueia interações até decisão
6. **Error Handling**: Try-catch em todas as chamadas ao backend
7. **Console Logs**: Facilitam debug e desenvolvimento

## 🚀 Extensões Futuras

### Sugestões de Melhorias:

1. **Sistema de Dicas Progressivas**
   - 1ª tentativa errada: dica básica
   - 2ª tentativa errada: dica intermediária
   - 3ª tentativa errada: opção de ver resposta

2. **Histórico de Tentativas**
   - Mostrar tentativas anteriores do usuário
   - Destacar diferenças entre tentativas

3. **Sistema de Pontuação**
   - Pontos por acertar de primeira
   - Menos pontos se precisar de ajuda

4. **Analytics**
   - Rastrear quantos usuários precisam de ajuda
   - Identificar gramáticas mais difíceis

5. **Tutorial Interativo**
   - Passo a passo para iniciantes
   - Skip para usuários experientes

## 🔒 Segurança

- ✅ Validação sempre no backend
- ✅ Resposta correta só vem do backend (não hardcoded)
- ✅ IDs vêm do contexto seguro
- ✅ Sem exposição de lógica de validação no frontend

## 📞 Suporte

Para dúvidas sobre o sistema de ajuda:
1. Consulte este documento
2. Verifique os logs no console
3. Examine o código de HelpModal.jsx
4. Teste o fluxo completo

---

**Status**: ✅ Implementado e Testado  
**Última atualização**: 2025-10-08  
**Build**: ✅ Compilado com sucesso

