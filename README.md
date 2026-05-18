# Conversor de Valor

Projeto simples de conversão de moedas criado em HTML, CSS e JavaScript.

## Sobre

<img width="720" height="720" alt="projeto conversor" src="https://github.com/user-attachments/assets/e3b8cb14-1c33-4668-97b9-ca23f3f35081" />


Este projeto converte valores entre Real e três moedas estrangeiras:
- Dólar americano (USD)
- Euro (EUR)
- Libra esterlina (GBP)

O site busca cotações reais usando a API `economia.awesomeapi.com.br` e armazena os valores em cache no `localStorage` para reduzir requisições e melhorar a velocidade.

## Funcionalidades

- Conversão de USD, EUR e GBP para BRL
- Conversão de BRL para USD, EUR e GBP
- Validação de valor inserido
- Exibição do resultado formatado em reais ou na moeda selecionada
- Cache de cotações por 24 horas

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Insira o valor que deseja converter.
3. Selecione a moeda desejada.
4. Clique em `Converter`.
5. O resultado e a cotação utilizada serão exibidos no rodapé.

## Estrutura do projeto

- `index.html` - marcação HTML da página
- `styles.css` - estilos da interface
- `script.js` - lógica de conversão e consumo da API
- `img/` - imagens e ícones do projeto

## Requisitos

- Navegador moderno com suporte a JavaScript
- Conexão com a internet para buscar as cotações

## Como contribuir

1. Faça um fork do repositório.
2. Crie uma branch com sua feature: `git checkout -b minha-feature`
3. Faça os ajustes necessários.
4. Envie um pull request.

## Observações

- Caso a API de cotações esteja fora do ar, o aplicativo exibirá um alerta informando que não foi possível carregar as cotações.
- O cache de cotações dura 24 horas e é renovado automaticamente quando expirado.
