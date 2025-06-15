const outputDir = "./css/";
const fs = require("fs");
function generateCSS(name, property, range, withExtras = false) {
	let css = "";
	const step = 0.125;
	for (let i = 0; i <= range; i++) {
		css += `.${name}-${i} { ${property}: ${(i * step).toFixed(3)}rem }\n`;
	}

	// Append useful fractions
	const commonFractions = [
		[1, 2],
		[1, 3],
		[2, 3],
		[1, 4],
		[3, 4],
		[1, 5],
		[2, 5],
		[3, 5],
		[4, 5],
		[1, 6],
		[5, 6],
		[1, 8],
		[3, 8],
		[5, 8],
		[7, 8],
		[1, 9],
		[2, 9],
		[4, 9],
		[5, 9],
		[7, 9],
		[8, 9],
		[1, 10],
		[3, 10],
		[7, 10],
		[9, 10],
		[1, 12],
		[5, 12],
		[7, 12],
		[11, 12],
		[1, 16],
		[3, 16],
		[5, 16],
		[7, 16],
		[9, 16],
		[11, 16],
		[13, 16],
		[15, 16],
	];
	for (const [numerator, denominator] of commonFractions) {
		const value = ((numerator / denominator) * 100).toFixed(3) + "%";
		css += `.${name}-${numerator}\\/${denominator} { ${property}: ${value} }\n`;
	}
	if (withExtras) {
		// Extra values (tailwind style + dynamic fractions)
		const extras = {
			width: [
				["full", "100%"],
				["screen", "100vw"],
				["auto", "auto"],
				["fit", "fit-content"],
				["min", "min-content"],
				["max", "max-content"],
				["none", "none"],
			],
			height: [
				["full", "100%"],
				["screen", "100vh"],
				["auto", "auto"],
				["fit", "fit-content"],
				["min", "min-content"],
				["max", "max-content"],
				["none", "none"],
			],
		};
		// Append static extras
		if (extras[property]) {
			for (const [key, val] of extras[property]) {
				css += `.${name}-${key} { ${property}: ${val} }\n`;
			}
		}
	}
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
	const fileName = `${outputDir}${property}.css`;
	fs.writeFile(fileName, css.trim(), (err) => {
		if (err) {
			console.error(`Error writing to file ${fileName}:`, err);
		} else {
			console.log(`CSS file ${fileName} created successfully.`);
		}
	});
}

generateCSS("p", "padding", 256);
generateCSS("pt", "padding-top", 256);
generateCSS("pr", "padding-right", 256);
generateCSS("pb", "padding-bottom", 256);
generateCSS("pl", "padding-left", 256);
generateCSS("m", "margin", 256);
generateCSS("mt", "margin-top", 256);
generateCSS("mr", "margin-right", 256);
generateCSS("mb", "margin-bottom", 256);
generateCSS("ml", "margin-left", 256);
generateCSS("w", "width", 256, true);
generateCSS("h", "height", 256, true);
generateCSS("max-w", "max-width", 256, true);
generateCSS("max-h", "max-height", 256, true);
generateCSS("min-w", "min-width", 256, true);
generateCSS("min-h", "min-height", 256, true);

setTimeout(() => {
	fs.readdir(outputDir, (err, files) => {
		if (err) {
			console.error("Failed to read css directory:", err);
			return;
		}

		const importBlockStart =
			"/* ********** GENERATED IMPORTS START ********** */";
		const importBlockEnd =
			"/* ********** GENERATED IMPORTS END ************ */";

		const importLines = files
			.filter((file) => file.endsWith(".css"))
			.map((file) => `@import "./css/${file}";`)
			.join("\n");

		const fullImportBlock = `${importBlockStart}\n${importLines}\n${importBlockEnd}`;

		const stylesPath = "./styles.css";

		fs.readFile(stylesPath, "utf8", (err, data) => {
			let updatedContent = "";

			if (err && err.code === "ENOENT") {
				// styles.css doesn't exist yet
				updatedContent = `${fullImportBlock}\n\n`;
			} else if (err) {
				console.error("Failed to read styles.css:", err);
				return;
			} else {
				const escapedStart = importBlockStart.replace(
					/[.*+?^${}()|[\]\\]/g,
					"\\$&",
				);
				const escapedEnd = importBlockEnd.replace(
					/[.*+?^${}()|[\]\\]/g,
					"\\$&",
				);

				const regex = new RegExp(
					`${escapedStart}[\\s\\S]*?${escapedEnd}`,
					"gm",
				);

				if (regex.test(data)) {
					// Replace existing block
					updatedContent = data.replace(regex, fullImportBlock);
				} else {
					// Prepend at top
					updatedContent = `${fullImportBlock}\n\n${data}`;
				}
			}

			fs.writeFile(stylesPath, updatedContent.trim() + "\n", (err) => {
				if (err) {
					console.error("Failed to update styles.css:", err);
				} else {
					console.log("styles.css updated with generated imports.");
				}
			});
		});
	});
}, 1000); // Delay to ensure all files are written before reading
