const outputDir = "./css/";
const fs = require("fs");

function generateCSS(
	name,
	properties,
	range,
	withExtras = false,
	step = 0.125,
	unit = "rem",
) {
	let css = "";

	// Generate rem-based classes
	for (let i = 0; i <= range; i++) {
		const value = `${(i * step).toFixed(3)}${unit}`;
		const rules = properties.map((prop) => `${prop}: ${value}`).join("; ");
		css += `.${name}-${i} { ${rules} }\n`;
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
		const rules = properties.map((prop) => `${prop}: ${value}`).join("; ");
		css += `.${name}-${numerator}\\/${denominator} { ${rules} }\n`;
	}

	if (withExtras) {
		const extrasMap = {
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

		for (const prop of properties) {
			if (extrasMap[prop]) {
				for (const [key, val] of extrasMap[prop]) {
					css += `.${name}-${key} { ${prop}: ${val} }\n`;
				}
			}
		}
	}

	// Single file per group name (like p.css)
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
	const fileName = `${outputDir}${name}.css`;
	fs.writeFile(fileName, css.trim(), (err) => {
		if (err) {
			console.error(`Error writing to file ${fileName}:`, err);
		} else {
			console.log(`CSS file ${fileName} created successfully.`);
		}
	});
}

generateCSS("p", ["--pt", "--pr", "--pb", "--pl"], 256, true);
generateCSS("px", ["--pr", "--pl"], 256, true);
generateCSS("py", ["--pt", "--pb"], 256, true);
generateCSS("pt", ["--pt"], 256, true);
generateCSS("pr", ["--pr"], 256, true);
generateCSS("pb", ["--pb"], 256, true);
generateCSS("pl", ["--pl"], 256, true);

generateCSS("m", ["--mt", "--mr", "--mb", "--ml"], 256, true);
generateCSS("mx", ["--mr", "--ml"], 256, true);
generateCSS("my", ["--mt", "--mb"], 256, true);
generateCSS("mt", ["--mt"], 256, true);
generateCSS("mr", ["--mr"], 256, true);
generateCSS("mb", ["--mb"], 256, true);
generateCSS("ml", ["--ml"], 256, true);

generateCSS("w", ["width"], 256, true);
generateCSS("h", ["height"], 256, true);
generateCSS("min-w", ["min-width"], 256, true);
generateCSS("max-w", ["max-width"], 256, true);
generateCSS("min-h", ["min-height"], 256, true);
generateCSS("max-h", ["max-height"], 256, true);

generateCSS("fs", ["font-size"], 256);
generateCSS("lh", ["line-height"], 256);

generateCSS(
	"r",
	["--round-tl", "--round-tr", "--round-bl", "--round-br"],
	256,
	true,
);
generateCSS("rt", ["--round-tl", "--round-tr"], 256, true);
generateCSS("rr", ["--round-tr", "--round-br"], 256, true);
generateCSS("rb", ["--round-bl", "--round-br"], 256, true);
generateCSS("rl", ["--round-tl", "--round-bl"], 256, true);
generateCSS("rtl", ["--round-tl"], 256, true);
generateCSS("rtr", ["--round-tr"], 256, true);
generateCSS("rbl", ["--round-bl"], 256, true);
generateCSS("rbr", ["--round-br"], 256, true);
generateCSS("b", ["--border-t", "--border-r", "--border-b", "--border-l"], 16, true, 1, "px");
generateCSS("bt", ["--border-t"], 16, true, 1, "px");
generateCSS("br", ["--border-r"], 16, true, 1, "px");
generateCSS("bb", ["--border-b"], 16, true, 1, "px");
generateCSS("bl", ["--border-l"], 16, true, 1, "px");

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
