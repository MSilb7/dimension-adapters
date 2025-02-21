import axios from 'axios'
import { IJSON } from '../adapters/types'
interface Price { decimals: number, price: number, symbol: string, timestamp: number }
const pricesStore: IJSON<IJSON<Price>> = {}

export const getPrices = async (tokens: string[], timestamp?: number) => {
    let path = "/current"
    if (timestamp) {
        path = `/historical/${timestamp}`
    }
    let tokens2Fetch = tokens
    if (pricesStore[timestamp ?? '']) {
        const storedtokens = Object.keys(pricesStore[timestamp ?? ''])
        tokens2Fetch = tokens.filter(token => !storedtokens.includes(token))
    }
    let res = { data: { coins: {} } }
    if (tokens2Fetch.length > 0)
        res = await axios.get(`https://coins.llama.fi/prices${path}/${tokens2Fetch.join(",")}`)
    if (timestamp)
        pricesStore[timestamp] = {
            ...pricesStore[timestamp],
            ...res.data.coins
        }
    return {
        ...getObjFromAttrs(pricesStore[timestamp ?? ''], tokens),
        ...res.data.coins,
    } as IJSON<Price>
}

const getObjFromAttrs = <T>(obj: IJSON<T>, list: string[]) => list.reduce((acc, curr) => {
    acc[curr] = obj[curr]
    return acc
}, {} as IJSON<T>)