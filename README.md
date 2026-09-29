# Conversor de moedas

🔗 **[Abrir o projeto](https://conversor-de-valor.vercel.app)**

Aplicação em HTML, CSS e JavaScript, sem framework ou backend próprio. O projeto exercita consumo de API, validação de dados, eventos do DOM e persistência local.

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
- Valores positivos com até duas casas decimais, usando vírgula ou ponto
- Validação de cotações e recuperação de cache inválido ou indisponível
- Exibição do resultado formatado em reais ou na moeda selecionada
- Cache de cotações por 24 horas

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Insira o valor: `1250,50` ou `1250.50`. Não use separador de milhar.
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

A execução do site não exige Node.js, instalação de pacotes ou build. Para servir os arquivos via HTTP, caso tenha Python instalado, execute `python -m http.server 8000` e acesse `http://localhost:8000`.

## Testes e integração contínua

Use Node.js 22 e npm:

```sh
npm ci
npm test
```

Os testes em `tests/converter.test.cjs` usam o executor nativo do Node.js e jsdom para carregar o HTML e executar o script real. A API é simulada, sem depender da rede ou da cotação do dia. Os cenários verificam centavos, cotação inversa, cache válido e inválido, armazenamento bloqueado, entradas ambíguas, respostas inválidas e falha de rede.

O workflow `.github/workflows/ci.yml` executa a suíte em pull requests e pushes para `main`. Os testes em jsdom não substituem testes visuais em navegadores reais.

## Decisões técnicas

Cada cotação representa quantos reais equivalem a uma unidade da moeda estrangeira. Converter para reais multiplica pelo preço; converter reais para outra moeda divide pelo preço. A descrição de `R$ 1` usa o inverso desse preço.

O cache é uma otimização, não um requisito para a conversão. A aplicação só aceita as três cotações quando são números finitos e positivos. Erros de leitura, JSON inválido, data futura ou prazo vencido levam a uma nova consulta; erros de gravação não descartam uma resposta válida da API. Se o armazenamento estiver bloqueado, as cotações permanecem em memória naquela sessão.

## Como contribuir

1. Faça um fork do repositório.
2. Crie uma branch com sua feature: `git checkout -b minha-feature`
3. Faça os ajustes necessários.
4. Envie um pull request.

## Observações

- Caso a API de cotações esteja fora do ar, o aplicativo exibirá um alerta informando que não foi possível carregar as cotações.
- O cache é conferido ao abrir a página e pode durar 24 horas; as cotações não são atualizadas continuamente.
- Sem cache válido, uma falha na API bloqueia a conversão. Recarregue a página para tentar novamente.
- O projeto não inclui taxas, impostos ou spread, nem realiza operações de câmbio.
- Os cálculos usam `Number` do JavaScript e arredondamento na apresentação; não há aritmética decimal de precisão financeira.

## Licenca

Distribuido sob a licenca MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.

## Autor

**Pedro Augusto Darolt** - [GitHub](https://github.com/pedrozxx) - [LinkedIn](https://www.linkedin.com/in/pedro-darolt/) - pedrocod.dev@gmail.com
