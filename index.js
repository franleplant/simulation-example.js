"use strict";
const pad = require("pad")
const moment = require("moment")
const chalk = require("chalk")
const data = require("./data")

// Calc ta (accumulated Ta)
data.reduce((ta_prev, client) => {
  const ta = client.Ta + ta_prev
  client.ta = ta
  return ta
}, 0)


// Calc the table per se
for (let i = 0; i < data.length; i++) {
  const ta = data[i].ta
  const Ts = data[i].Ts
  const ta_prev = i === 0 ? 0 : data[i-1].ta
  const tsf_prev = i === 0 ? 0 : data[i-1].tsf


  const ts0 = Math.max(tsf_prev, ta)
  const tsf = ts0 + Ts
  const Tws = Ts
  const Twq = ts0 - ta
  const Tw = Tws + Twq
  const Tid = ts0 - tsf_prev

  data[i].ts0 = ts0
  data[i].tsf = tsf
  data[i].Tw = Tw
  data[i].Tid = Tid
}



// Pretty print the god damm thing!
const today = moment().hour(0).minute(0)
const formmatAsTime = ["ta", "ts0", "tsf"]
const h = ["i", "Ta", "Ts", "ta", "ts0", "tsf", "Tw", "Tid"]
const head = h.map(h => {
  const padding = formmatAsTime.indexOf(h) >= 0 ? 6 : 3
  return pad(padding,h)
}).join(" ")

console.log(chalk.magenta(head))

data.forEach((d, i) => {
  let res = h.map(h => {
    if (formmatAsTime.indexOf(h) >= 0) {
      return pad(6, today.clone().minute(d[h] || 0).format("HH:mm"))
    }
    return pad(3, h === "i" ? i+1 : d[h] || 0)
  })
  .join(" ")
  if (i % 2 !== 0) {
    res = chalk.inverse(res)
  }
  console.log(res)
})


console.log()
const TwT = data.reduce(((acc, d) => d.Tw + acc), 0)
const TidT = data.reduce(((acc, d) => d.Tid + acc), 0)
console.log("Tiempo de espera promedio")
console.log(TwT / data.length)
console.log("Porcentaje del tiempo de inactividad del cajero")
console.log(100 * TidT / data[data.length - 1].tsf, "%")

