const fs = require('fs')
const yaml = require('js-yaml')
const axios = require('axios').default
const { HttpsProxyAgent } = require('https-proxy-agent')
const httpAgent = new HttpsProxyAgent('http://127.0.0.1:7890')

const http = axios.create({
    httpAgent, httpsAgent: httpAgent, timeout: 3000
})

axios.defaults.baseURL = 'http://127.0.0.1:9090'

const config = fs.readFileSync('./config.yaml', 'utf8').replace(/<!str>/g, '')
const { proxies } = yaml.load(config)

// console.log(proxies)

async function setGlobal() {
    return axios.patch('/configs', { "mode": "Global" })
}

async function setProxy(name) {
    return axios.put('/proxies/GLOBAL', {
        name
    })
}

async function getRegion() {
    return http.get('http://ipinfo.io', { headers: { "Content-Type": 'curl' } })
}

async function run() {
    const res = {proxies: []}
    await setGlobal()

    for (let proxy of proxies) {
        try {

            await setProxy((proxy.name))
            const {data} = await getRegion()
            console.log(data)
            const {country} = data
       
            res.proxies.push({
                ...proxy, name: country
            })
        } catch (error) {
            // console.log(error)
            // throw error
        }

    }

    fs.writeFileSync('res.yaml', yaml.dump(res), 'utf8')
}

run()