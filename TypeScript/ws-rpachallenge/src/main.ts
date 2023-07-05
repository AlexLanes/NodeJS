// externo
import * as Xlsx from "xlsx"
import { readFileSync as ReadFile } from "node:fs"
import { Builder, Browser, By } from "selenium-webdriver"

let de_para: Record<string, string> = {
        "labelFirstName": "First Name",
        "labelLastName": "Last Name",
        "labelCompanyName": "Company Name",
        "labelRole": "Role in Company",
        "labelAddress": "Address",
        "labelEmail": "Email",
        "labelPhone": "Phone Number",
    },
    locators: Record<string, By> = {
        iniciar: By.xpath("//button"),
        inputs: By.xpath("//form/div//input"),
        submit: By.xpath("//form/input"),
        status: By.xpath("/html/body/app-root/div[2]/app-rpa1/div/div[2]/div[1]"),
        mensagem: By.xpath("/html/body/app-root/div[2]/app-rpa1/div/div[2]/div[2]")
    },
    linhasCsv: Record<string, string>[]

async function sleep( seconds: number ): Promise<void> {
	return new Promise( _ => setTimeout(_, seconds * 1000) )
}

function montaCsv( caminhoRelativo: string ): void {
    let file = ReadFile( caminhoRelativo, "utf-8" ),
        book = Xlsx.read( file, {type: 'string'} ),
        sheet = book.Sheets[ book.SheetNames[0] ]

    linhasCsv = Xlsx.utils.sheet_to_json( sheet )
}

async function main() {
	const navegador = await new Builder().forBrowser(Browser.EDGE).build()
    await navegador.manage().window().maximize()
    await navegador.manage().setTimeouts({ implicit: 10000, pageLoad: 10000 })

	try {
        // abrir página e iniciar
		await navegador.get("https://www.rpachallenge.com/")
        await navegador.findElement(locators.iniciar).click()
        
        // cada linha do csv
        for( let linha of linhasCsv ){
            
            // cada input no form, exceto o submit
            let inputs = await navegador.findElements(locators.inputs)
            for( let input of inputs ){
                let atributo = await input.getAttribute("ng-reflect-name"),
                    coluna = de_para[atributo]
                    
                await input.sendKeys( linha[coluna] )
            }
            
            // Próxima página
            await navegador.findElement(locators.submit).click()
        }

        // Finalizar
        console.log({
            "status": await navegador.findElement(locators.status).getText(),
            "mensagem": await navegador.findElement(locators.mensagem).getText(),
        })

	} finally {
        await sleep(5)
		await navegador.quit()
        process.exit(0)
	}
}

// Desafio https://www.rpachallenge.com/
montaCsv("challenge.csv")
main()