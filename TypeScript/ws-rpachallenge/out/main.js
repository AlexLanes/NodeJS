var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// externo
import * as Xlsx from "xlsx";
import { readFileSync as ReadFile } from "node:fs";
import { Builder, Browser, By } from "selenium-webdriver";
let de_para = {
    "labelFirstName": "First Name",
    "labelLastName": "Last Name",
    "labelCompanyName": "Company Name",
    "labelRole": "Role in Company",
    "labelAddress": "Address",
    "labelEmail": "Email",
    "labelPhone": "Phone Number",
}, locators = {
    iniciar: By.xpath("//button"),
    inputs: By.xpath("//form/div//input"),
    submit: By.xpath("//form/input"),
    status: By.xpath("/html/body/app-root/div[2]/app-rpa1/div/div[2]/div[1]"),
    mensagem: By.xpath("/html/body/app-root/div[2]/app-rpa1/div/div[2]/div[2]")
}, linhasCsv;
function sleep(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(_ => setTimeout(_, seconds * 1000));
    });
}
function montaCsv(caminhoRelativo) {
    let file = ReadFile(caminhoRelativo, "utf-8"), book = Xlsx.read(file, { type: 'string' }), sheet = book.Sheets[book.SheetNames[0]];
    linhasCsv = Xlsx.utils.sheet_to_json(sheet);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const navegador = yield new Builder().forBrowser(Browser.EDGE).build();
        yield navegador.manage().window().maximize();
        yield navegador.manage().setTimeouts({ implicit: 10000, pageLoad: 10000 });
        try {
            // abrir página e iniciar
            yield navegador.get("https://www.rpachallenge.com/");
            yield navegador.findElement(locators.iniciar).click();
            // cada linha do csv
            for (let linha of linhasCsv) {
                // cada input no form, exceto o submit
                let inputs = yield navegador.findElements(locators.inputs);
                for (let input of inputs) {
                    let atributo = yield input.getAttribute("ng-reflect-name"), coluna = de_para[atributo];
                    yield input.sendKeys(linha[coluna]);
                }
                // Próxima página
                yield navegador.findElement(locators.submit).click();
            }
            // Finalizar
            console.log({
                "status": yield navegador.findElement(locators.status).getText(),
                "mensagem": yield navegador.findElement(locators.mensagem).getText(),
            });
        }
        finally {
            yield sleep(5);
            yield navegador.quit();
            process.exit(0);
        }
    });
}
// Desafio https://www.rpachallenge.com/
montaCsv("challenge.csv");
main();
