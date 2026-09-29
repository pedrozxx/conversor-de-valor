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

function isValidRates(value) {
  return value && ["USD", "EUR", "GBP"].every(
    (code) => Number.isFinite(value[code]) && value[code] > 0
  )
}

function parseRate(value) {
  if (typeof value !== "string" && typeof value !== "number") return NaN
  return Number(value)
}

function readCachedRates() {
  try {
    const cachedRates = JSON.parse(localStorage.getItem(CACHE_KEY))
    const cachedTime = Number(localStorage.getItem(CACHE_TIME_KEY))
    const cacheAge = Date.now() - cachedTime

    if (isValidRates(cachedRates) && Number.isFinite(cachedTime) &&
        cacheAge >= 0 && cacheAge < CACHE_DURATION) {
      return cachedRates
    }
  } catch {
    // Cache inválido ou armazenamento bloqueado não impede a consulta à API.
  }
  return null
}

async function loadRates() {
  button.disabled = true
  const cachedRates = readCachedRates()
  if (cachedRates) {
    rates = cachedRates
    button.disabled = false
    return
  }

  try {
    const response = await fetch(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL"
    )

    if (!response.ok) {
      throw new Error("Erro ao buscar cotações")
    }

    const data = await response.json()

    const fetchedRates = {
      USD: parseRate(data?.USDBRL?.bid),
      EUR: parseRate(data?.EURBRL?.bid),
      GBP: parseRate(data?.GBPBRL?.bid),
    }
    if (!isValidRates(fetchedRates)) {
      throw new Error("Cotações inválidas na resposta da API")
    }
    rates = fetchedRates
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(rates))
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
    } catch {
      // O cache é opcional; a cotação válida continua disponível em memória.
    }
    button.disabled = false
  } catch (error) {
    console.log(error)
    alert("Não foi possível carregar as cotações. Tente novamente mais tarde.")
  }
}

amount.addEventListener("input", () => {
  footer.classList.remove("show-result")
})
currency.addEventListener("change", () => {
  footer.classList.remove("show-result")
})

form.onsubmit = (event) => {
  event.preventDefault()
  footer.classList.remove("show-result")

  const value = amount.value.trim()
  const parsedAmount = Number(value.replace(",", "."))
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value) ||
      !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    alert("Insira um valor positivo com até duas casas decimais, sem separador de milhar.")
    return
  }

  if (!isValidRates(rates)) {
    alert("As cotações ainda não foram carregadas.")
    return
  }

  switch (currency.value) {
    case "USD":
      convertToBRL(parsedAmount, rates.USD, "US$")
      break
    case "EUR":
      convertToBRL(parsedAmount, rates.EUR, "€")
      break
    case "GBP":
      convertToBRL(parsedAmount, rates.GBP, "£")
      break
    case "BRL-USD":
      convertFromBRL(parsedAmount, rates.USD, "US$")
      break
    case "BRL-EUR":
      convertFromBRL(parsedAmount, rates.EUR, "€")
      break
    case "BRL-GBP":
      convertFromBRL(parsedAmount, rates.GBP, "£")
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

  description.textContent = `R$ 1 = ${symbol} ${(1 / price).toFixed(2)}`
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
