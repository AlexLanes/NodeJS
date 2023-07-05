var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// std
import { readdir, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
// externo
import { Builder, Browser, By, until } from "selenium-webdriver";
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
    "id": (index) => By.xpath(`//*[@id="tableSandbox"]/tbody/tr[${index}]/td[2]`),
    "dueDate": (index) => By.xpath(`//*[@id="tableSandbox"]/tbody/tr[${index}]/td[3]`),
    "urlImagem": (index) => By.xpath(`//*[@id="tableSandbox"]/tbody/tr[${index}]/td[4]/a`),
    "submit": By.name("csv"),
    "status": By.xpath("/html/body/div/div/div[2]/div/div[2]/h1/span"),
    "mensagem": By.xpath("/html/body/div/div/div[2]/div/div[2]/strong")
};
function sleep(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(_ => setTimeout(_, seconds * 1000));
    });
}
function obterNomeImagem(urlImagem) {
    return urlImagem.split("/").slice(-1)[0];
}
function obterTextoImagem(navegador, nomeImagem) {
    return __awaiter(this, void 0, void 0, function* () {
        let abaOriginal = yield navegador.getWindowHandle();
        // abrir nova aba e trocar o navegador para ela
        yield navegador.switchTo().newWindow("tab");
        yield navegador.get("https://www.imagetotext.info/");
        // upload imagem
        yield navegador.findElement(LOCATORS.file)
            .sendKeys(`${process.cwd()}\\arquivos\\${nomeImagem}`);
        yield navegador.wait(until.elementTextContains(yield navegador.findElement(LOCATORS["img-size"]), "MB"));
        yield navegador.findElement(LOCATORS.jsShadowRoot)
            .click();
        // obter o texto
        yield navegador.wait(until.elementLocated(LOCATORS.textoExistente));
        let texto = yield navegador.findElement(LOCATORS.texto).getText();
        // retornar à aba original
        yield navegador.close();
        yield navegador.switchTo().window(abaOriginal);
        return texto.split("\n");
    });
}
function baixarImagem(navegador, urlImagem) {
    return __awaiter(this, void 0, void 0, function* () {
        let abaOriginal = yield navegador.getWindowHandle();
        // abrir nova aba e trocar o navegador para ela
        yield navegador.switchTo().newWindow("tab");
        yield navegador.get(urlImagem);
        // baixar imagem
        let imagem = yield navegador.findElement(LOCATORS.img).takeScreenshot(), nomeImagem = obterNomeImagem(urlImagem);
        yield writeFile(`./arquivos/${nomeImagem}`, imagem, "base64");
        // retornar à aba original
        yield navegador.close();
        yield navegador.switchTo().window(abaOriginal);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const navegador = yield new Builder().forBrowser(Browser.EDGE).build();
        yield navegador.manage().window().maximize();
        yield navegador.manage().setTimeouts({ implicit: 10000, pageLoad: 10000 });
        let invoices = [];
        try {
            // inicicar e aguardar os dados atualizarem
            yield navegador.get("https://rpachallengeocr.azurewebsites.net/");
            yield navegador.findElement(LOCATORS.start).click();
            yield sleep(1);
            // percorrer todas as páginas 
            while (true) {
                // percorrer todos os invoices na página
                let trs = yield navegador.findElements(LOCATORS.trs);
                for (let tr = 1; tr <= trs.length; tr++) {
                    let hoje = new Date().toISOString().split("T")[0];
                    let dueDate = yield navegador.findElement(LOCATORS.dueDate(tr)).getText();
                    // garantir que o DueDate, convertido para YYYY-MM-DD, é menor ou igual a hoje
                    if (dueDate.split("-").reverse().join("-") > hoje)
                        continue;
                    invoices.push({
                        ID: yield navegador.findElement(LOCATORS.id(tr)).getText(),
                        DueDate: dueDate,
                        urlImagem: yield navegador.findElement(LOCATORS.urlImagem(tr)).getAttribute("href")
                    });
                }
                // próxima página ?
                let next = yield navegador.findElement(LOCATORS.next), _class = yield next.getAttribute("class");
                if (_class.endsWith("disabled"))
                    break;
                else
                    yield next.click();
            }
            // baixar e obter dados da imagens
            for (let invoice of invoices) {
                let { urlImagem } = invoice, nomeImagem = obterNomeImagem(urlImagem);
                delete invoice.urlImagem;
                yield baixarImagem(navegador, urlImagem);
                let linhas = yield obterTextoImagem(navegador, nomeImagem);
                invoice.InvoiceNo = linhas[7].split(" ")[1].replace("#", "");
                invoice.InvoiceDate = linhas[6].split("-").reverse().join("-");
                invoice.CompanyName = linhas[0];
                invoice.TotalDue = linhas.slice(-3)[0];
            }
            // criar o .csv e fazer o submit
            let crlf = "\r\n", csv = [Object.keys(invoices[0]).join(",") + crlf], nomeArquivo = "output.csv";
            invoices.forEach(invoice => csv.push(Object.values(invoice).join(",") + crlf));
            yield writeFile(`./arquivos/${nomeArquivo}`, csv);
            yield navegador.findElement(LOCATORS.submit).sendKeys(`${process.cwd()}\\arquivos\\${nomeArquivo}`);
            // finalizar
            yield sleep(1);
            console.log({
                status: yield navegador.findElement(LOCATORS.status).getText(),
                mensagem: yield navegador.findElement(LOCATORS.mensagem).getText()
            });
        }
        finally {
            yield sleep(5);
            yield navegador.quit();
            process.exit(0);
        }
    });
}
// limpar pasta dos arquivos
readdir("./arquivos", (erro, arquivos) => arquivos.forEach(arquivo => rmSync(`./arquivos/${arquivo}`)));
// Desafio https://rpachallengeocr.azurewebsites.net/
main();
