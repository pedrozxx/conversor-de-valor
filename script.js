const form = document.querySelector("form")
const amount = document.getElementById("amount")
const currency = document.getElementById("currency")
const footer = document.querySelector("main footer")
const description = document.getElementById("description")
const result = document.getElementById("result")
const button = document.querySelector("button")

const CACHE_KEY = "currency_rates_cache"
const CACHE_TIME_KEY = "currency_rates_cache_time"
const CACHE_DURATION = 24 * 60 * 60 * 1000

let rates = {
  USD: null,
  EUR: null,
  GBP: null,
}

async function loadRates() {
  const cachedRates = localStorage.getItem(CACHE_KEY)
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY)

  if (cachedRates && cachedTime) {
    const cacheAge = Date.now() - Number(cachedTime)

    if (cacheAge < CACHE_DURATION) {
      rates = JSON.parse(cachedRates)
      return
    }
  }

  try {
    const response = await fetch(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL"
    )

    if (!response.ok) {
      throw new Error("Erro ao buscar cotações")
    }

    const data = await response.json()

    rates = {
      USD: Number(data.USDBRL.bid),
      EUR: Number(data.EURBRL.bid),
      GBP: Number(data.GBPBRL.bid),
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(rates))
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
  } catch (error) {
    console.log(error)
    alert("Não foi possível carregar as cotações. Tente novamente mais tarde.")
  }
}

amount.addEventListener("input", () => {
  const hasCharactersRegex = /\D+/g
  amount.value = amount.value.replace(hasCharactersRegex, "")
})

form.onsubmit = (event) => {
  event.preventDefault()

  if (!amount.value || Number(amount.value) <= 0) {
    alert("Valor inválido. Por favor, insira um número válido.")
    return
  }

  if (!rates.USD || !rates.EUR || !rates.GBP) {
    alert("As cotações ainda não foram carregadas.")
    return
  }

  switch (currency.value) {
    case "USD":
      convertToBRL(Number(amount.value), rates.USD, "US$")
      break
    case "EUR":
      convertToBRL(Number(amount.value), rates.EUR, "€")
      break
    case "GBP":
      convertToBRL(Number(amount.value), rates.GBP, "£")
      break
    case "BRL-USD":
      convertFromBRL(Number(amount.value), rates.USD, "US$")
      break
    case "BRL-EUR":
      convertFromBRL(Number(amount.value), rates.EUR, "€")
      break
    case "BRL-GBP":
      convertFromBRL(Number(amount.value), rates.GBP, "£")
      break
    default:
      alert("Selecione uma moeda.")
      return
  }
}

function convertToBRL(amountValue, price, symbol) {
  const total = amountValue * price

  description.textContent = `${symbol} 1 = ${formatCurrencyBRL(price)}`
  result.textContent = formatCurrencyBRL(total)
  footer.classList.add("show-result")
}

function convertFromBRL(amountValue, price, symbol) {
  const total = amountValue / price

  description.textContent = `R$ 1 = ${symbol} ${price.toFixed(2)}`
  result.textContent = `${symbol} ${total.toFixed(2)}`
  footer.classList.add("show-result")
}

function formatCurrencyBRL(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

loadRates()