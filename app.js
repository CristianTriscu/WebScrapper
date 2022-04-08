const { default: axios } = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { convertArrayToCSV } = require('convert-array-to-csv');

async function getHtml(url) {
    const response = await axios.get(url);
    const html = response.data;

    return html;
}

function getProductList(html) {
    const selector = ".product-item-info";
    const $ = cheerio.load(html);

    const productList = $(selector);
    return productList;

}

function getData(productsArray) {
    const data = [];

    for (let i = 0; i < productsArray.length; i++) {
        const $ = cheerio.load(productsArray[i]);
        const productNameSelector = ".product-item-link";
        const productFinalPriceSelector = ".price-final_price > span:first-child";
        const productOldPriceSelector = ".old-price > span:first-child"
        const productIdSelector = ".price-box";

        let productName = $(productNameSelector).text().trim();
        let productPrice = $(productFinalPriceSelector).text();
        let oldPrice = $(productOldPriceSelector).text();
        let productId = $(productIdSelector).attr("data-product-id");

        productPrice = productPrice.split("\n");
        const index1 = Math.floor(productPrice.length / 2);
        productPrice = Number(productPrice[index1].replace(/\s/g, '').replace("Lei", "").replace(",", "."));
        let esteRedus = 'NU';
        if (oldPrice) {
            esteRedus = 'DA';
            oldPrice = oldPrice.split('\n');
            const index2 = Math.floor(oldPrice.length / 2);
            oldPrice = Number(oldPrice[index2].replace(/\s/g, '').replace("Lei", "").replace(",", "."));
        }

        data.push({
            nume: productName,
            esteRedus: esteRedus,
            pret_actual: productPrice,
            pret_vechi: oldPrice,
            id: productId
        })


    }
    return data;
}
async function runTest() {
    //https://carrefour.ro/cosmetice-si-ingrijire-personala?p=93

    const url = "https://carrefour.ro/cosmetice-si-ingrijire-personala?p=13";
    const html = await getHtml(url);
    const productList = getProductList(html);
    const data = getData(productList);

    saveData("ingrijire.csv", data);
}

function saveData(fileName = "output_all.csv", data) {

    const header = Object.keys(data[0]);
    const val = convertArrayToCSV(data, {
        header,
        separator: ','
    });

    fs.writeFile(fileName, val, (err) => {
        if (err) console.log(err);
        console.log('Fisierul s-a salvat cu succes!');
    });
}

runTest();










