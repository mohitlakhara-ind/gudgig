const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update file content
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Update imports
    if (content.includes("from '../models/Job.js'")) {
      content = content.replace(/from '\.\.\/models\/Job\.js'/g, "from '../models/Gig.js'");
      updated = true;
    }
    
    if (content.includes('from "../models/Job.js"')) {
      content = content.replace(/from "\.\.\/models\/Job\.js"/g, 'from "../models/Gig.js"');
      updated = true;
    }
    
    // Update Job references to Gig
    if (content.includes('Job.')) {
      content = content.replace(/Job\./g, 'Gig.');
      updated = true;
    }
    
    if (content.includes('Job(')) {
      content = content.replace(/Job\(/g, 'Gig(');
      updated = true;
    }
    
    if (content.includes('Job ')) {
      content = content.replace(/Job /g, 'Gig ');
      updated = true;
    }
    
    if (content.includes('jobId')) {
      content = content.replace(/jobId/g, 'gigId');
      updated = true;
    }
    
    if (content.includes('job.')) {
      content = content.replace(/job\./g, 'gig.');
      updated = true;
    }
    
    if (content.includes('job ')) {
      content = content.replace(/job /g, 'gig ');
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const jsFiles = findJsFiles(srcDir);

console.log(`Found ${jsFiles.length} JavaScript files`);
console.log('Updating files...');

jsFiles.forEach(updateFile);

console.log('Update complete!');
