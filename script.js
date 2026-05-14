// obtendo o elemento do formulário e do select de moeda
const currency = document.getElementById('currency');
const form = document.getElementById('form');
// obtem o valor selecionado pelo usuário
const amount = document.getElementById('amount');
// obtem e valida o input do usuário
amount.addEventListener('input', () => {
    // regex para remover caracteres não numéricos
    const HasCharactersRegex = /\D+/g;
    amount.value = amount.value.replace(HasCharactersRegex, '');
});
