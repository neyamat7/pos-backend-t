import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get feature name from command line argument
const featureName = process.argv[2];

if (!featureName) {
  console.error("❌ Please provide a feature name!");
  console.log("Usage: node generate.js <feature-name>");
  process.exit(1);
}

// Create feature folder path (inside src/features)
const featurePath = path.join(__dirname, "src", "features", featureName);

// Check if folder already exists
if (fs.existsSync(featurePath)) {
  console.error(`❌ Feature "${featureName}" already exists!`);
  process.exit(1);
}

// Create the folder
fs.mkdirSync(featurePath, { recursive: true });

// Capitalize first letter for model name
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const capitalizedName = capitalize(featureName);

// File templates
const templates = {
  model: `import mongoose from 'mongoose';

const ${featureName}Schema = new mongoose.Schema({
  // Add your schema fields here
  
}, {
  timestamps: true,
});

export default mongoose.model('${capitalizedName}', ${featureName}Schema);
`,

  controller: `import * as ${featureName}Service from './${featureName}.services.js';

`,

  services: `import ${capitalizedName} from './${featureName}.model.js';

`,

  router: `import express from 'express';
import  ${featureName}Controller from './${featureName}.controller.js';

const router = express.Router();

// Routes
router.get('/all', );
router.get('/details/:id', );
router.post('/add', );
router.put('/update/:id', );
router.delete('/delete/:id', );

export default router;
`,
};

// Create files
const files = ["model", "controller", "services", "router"];

files.forEach((fileType) => {
  const fileName = `${featureName}.${fileType}.js`;
  const filePath = path.join(featurePath, fileName);
  fs.writeFileSync(filePath, templates[fileType]);
  console.log(`Created: ${fileName}`);
});

console.log(`\n🎉 Feature "${featureName}" created successfully!`);
console.log(`📁 Location: ${featurePath}`);
