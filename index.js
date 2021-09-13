const puppeteer = require('puppeteer');
const fs = require('fs');

const url = 'https://de.tradingview.com/symbols/BTCUSD/technicals/';

(async () => {
	let browser;
	try {
		browser = await puppeteer.launch({
		  	headless: true,
		  	args: [
		  		'--window-size=1366,768'
		  	]
		});
		const page = await browser.newPage();
		await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36');
		await page.mouse;
		await page.goto(url);
		
		await page.waitForSelector('#technicals-root div[class^="itemContent"]');

		await page.click('#technicals-root div[class^="itemContent"]');

		await page.waitFor(500);

		await page.on('console', consoleObj => console.log(consoleObj.text()));


		const data = await page.evaluate(() => {
			let returnData = [];
			let speedometerWrappers = document.querySelectorAll('div[class^="speedometerWrapper"]');
			speedometerWrappers.forEach(element => {
				const counterElement = element.querySelector('div[class^="countersWrapper"]');
				if(counterElement) {
					let parsedData = counterElement.innerText.split('\n');
					returnData.push({
						category: element.children[0].innerText.trim(),
						data: parsedData
					});
				}
			});
			return returnData;
		});

		let formattedData = '';
		if(data.length > 0) {
			data.forEach(datum => {
				formattedData += `
[${+ new Date()}]\n\r
${datum.category}\n\r
\t${datum.data[1]} : ${datum.data[0]}\n\r
\t${datum.data[3]} : ${datum.data[2]}\n\r
\t${datum.data[5]} : ${datum.data[4]}\n\r\n\r`;
			});
		}

		fs.appendFileSync('log.txt', formattedData);

		await browser.close();

	} catch(e) {
		console.log(e);
		await browser.close();
	}
  // await browser.close();
})();