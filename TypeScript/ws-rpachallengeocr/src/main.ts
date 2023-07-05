// std
import { readdir, rmSync } from "node:fs"
import { writeFile } from "node:fs/promises"
// externo
import { Builder, Browser, By, WebDriver, until } from "selenium-webdriver"

const LOCATORS = {
    "img": By.xpath("//img"),
    "file": By.id("file"),
    "img-size": By.className("img-size"),
    "jsShadowRoot": By.id("jsShadowRoot"),
    "texto": By.xpath('//*[@id="result-sec"]/div[1]'),
    "textoExistente": By.xpath('//*[@id="result-sec"]/div[1]/br'),
    "start": By.id("start"),
    "next": By.id("tableSandbox_next"),
    "trs": By.xpath('//*[@id="tableSandbox"]/tbody/tr'),
    "id": (index: number) => By.xpath(`//*[@id="tableSandbox"]/tbody/tr[${index}]/td[2]`),
    "dueDate": (index: number) => By.xpath(`//*[@id="tableSandbox"]/tbody/tr[${index}]/td[3]`),
    "urlImagem": (index: number) => By.xpath(`//*[@id="tableSandbox"]/tbody/tr[${index}]/td[4]/a`),
    "submit": By.name("csv"),
    "status": By.xpath("/html/body/div/div/div[2]/div/div[2]/h1/span"),
    "mensagem": By.xpath("/html/body/div/div/div[2]/div/div[2]/strong")
} as const

interface Invoice {
    ID: string
    DueDate: string
    InvoiceNo?: string
    InvoiceDate?: string
    CompanyName?: string
    TotalDue?: string
    urlImagem?: string
}

async function sleep( seconds: number ): Promise<void> {
	return new Promise( _ => setTimeout(_, seconds * 1000) )
}

function obterNomeImagem( urlImagem: string ): string {
    return urlImagem.split("/").slice(-1)[0]
}

async function obterTextoImagem( navegador: WebDriver, nomeImagem: string ): Promise<string[]> {
    let abaOriginal = await navegador.getWindowHandle()

    // abrir nova aba e trocar o navegador para ela
    await navegador.switchTo().newWindow("tab")
    await navegador.get("https://www.imagetotext.info/")

    // upload imagem
    await navegador.findElement(LOCATORS.file)
                   .sendKeys(`${process.cwd()}\\arquivos\\${nomeImagem}`)
    await navegador.wait(until.elementTextContains(
        await navegador.findElement(LOCATORS["img-size"]), 
        "MB"
    ))
    await navegador.findElement(LOCATORS.jsShadowRoot)
                   .click()
        
    // obter o texto
    await navegador.wait( until.elementLocated(LOCATORS.textoExistente) )
    let texto = await navegador.findElement(LOCATORS.texto).getText()

    // retornar à aba original
    await navegador.close()
    await navegador.switchTo().window(abaOriginal)
    
    return texto.split("\n")
}

async function baixarImagem( navegador: WebDriver, urlImagem: string ): Promise<void> {
    let abaOriginal = await navegador.getWindowHandle()

    // abrir nova aba e trocar o navegador para ela
    await navegador.switchTo().newWindow("tab")
    await navegador.get(urlImagem)

    // baixar imagem
    let imagem = await navegador.findElement(LOCATORS.img).takeScreenshot(),
        nomeImagem = obterNomeImagem(urlImagem)
    await writeFile( `./arquivos/${nomeImagem}`, imagem, "base64" )

    // retornar à aba original
    await navegador.close()
    await navegador.switchTo().window(abaOriginal)
}

async function main(): Promise<void> {
	const navegador = await new Builder().forBrowser(Browser.EDGE).build()
    await navegador.manage().window().maximize()
    await navegador.manage().setTimeouts({ implicit: 10000, pageLoad: 10000 })
    let invoices: Invoice[] = []

    try {
        // inicicar e aguardar os dados atualizarem
        await navegador.get("https://rpachallengeocr.azurewebsites.net/")
        await navegador.findElement(LOCATORS.start).click()
        await sleep(1)

        // percorrer todas as páginas 
        while( true ){
            // percorrer todos os invoices na página
            let trs = await navegador.findElements(LOCATORS.trs)
            for( let tr = 1; tr <= trs.length; tr++ ){
                let hoje = new Date().toISOString().split("T")[0]
                let dueDate = await navegador.findElement( LOCATORS.dueDate(tr) ).getText()
                
                // garantir que o DueDate, convertido para YYYY-MM-DD, é menor ou igual a hoje
                if( dueDate.split("-").reverse().join("-") > hoje ) continue

                invoices.push({
                    ID: await navegador.findElement( LOCATORS.id(tr) ).getText(),
                    DueDate: dueDate,
                    urlImagem: await navegador.findElement( LOCATORS.urlImagem(tr) ).getAttribute("href")
                })
            }
            
            // próxima página ?
            let next = await navegador.findElement(LOCATORS.next),
                _class = await next.getAttribute("class")
            
            if( _class.endsWith("disabled") ) break
            else await next.click()
        }

        // baixar e obter dados da imagens
        for( let invoice of invoices ){
            let { urlImagem } = invoice,
                nomeImagem = obterNomeImagem(urlImagem!)

            delete invoice.urlImagem
            await baixarImagem(navegador, urlImagem!)
            let linhas = await obterTextoImagem(navegador, nomeImagem)

            invoice.InvoiceNo = linhas[7].split(" ")[1].replace("#", "")
            invoice.InvoiceDate = linhas[6].split("-").reverse().join("-")
            invoice.CompanyName = linhas[0]
            invoice.TotalDue = linhas.slice(-3)[0]
        }

        // criar o .csv
        let crlf = "\r\n",
            csv: string[] = [ Object.keys(invoices[0]).join(",") + crlf ],
            nomeArquivo = "output.csv"
            
        invoices.forEach( invoice => csv.push(Object.values(invoice).join(",") + crlf) )
        await writeFile( `./arquivos/${nomeArquivo}`, csv )
        
        // finalizar
        await navegador.findElement(LOCATORS.submit).sendKeys(`${process.cwd()}\\arquivos\\${nomeArquivo}`)
        await sleep(1)
        console.log({
            status: await navegador.findElement(LOCATORS.status).getText(),
            mensagem: await navegador.findElement(LOCATORS.mensagem).getText()
        });

    } finally {
        await sleep(5)
		await navegador.quit()
        process.exit(0)
	}
}

// limpar pasta dos arquivos
readdir( "./arquivos", (erro, arquivos) => 
    arquivos.forEach( arquivo => rmSync(`./arquivos/${arquivo}`) )
)

// Desafio https://rpachallengeocr.azurewebsites.net/
main()