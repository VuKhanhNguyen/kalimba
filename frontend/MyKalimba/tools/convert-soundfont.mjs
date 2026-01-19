import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const input = process.argv[2];
const output = process.argv[3] ?? input;

if (!input) {
  console.error(
    "Usage: node tools/convert-soundfont.mjs <input.js> [output.js]",
  );
  process.exit(1);
}

const code = fs.readFileSync(input, "utf8");

const context = { MIDI: undefined };
vm.createContext(context);
vm.runInContext(code, context, { filename: path.basename(input) });

const soundfont = context?.MIDI?.Soundfont?.kalimba;
if (!soundfont || typeof soundfont !== "object") {
  throw new Error(
    `Failed to evaluate soundfont. Expected MIDI.Soundfont.kalimba object in ${input}`,
  );
}

const json = JSON.stringify(soundfont, null, 2);
if (!json.startsWith("{") || (!json.endsWith("}\n") && !json.endsWith("}"))) {
  throw new Error("Unexpected JSON.stringify output");
}

// soundfont-player's midiJsToJson() expects the MIDI.js file to end the object with a trailing comma
// so it can safely strip the last comma and add '}' back before JSON.parse.
const jsonWithTrailingComma = json.replace(/\n\}$/, ",\n}");

const out =
  'if (typeof MIDI === "undefined") var MIDI = {};\n' +
  'if (typeof MIDI.Soundfont === "undefined") MIDI.Soundfont = {};\n' +
  `MIDI.Soundfont.kalimba = ${jsonWithTrailingComma};\n`;

fs.writeFileSync(output, out, "utf8");
console.log(`Wrote converted soundfont to ${output}`);
