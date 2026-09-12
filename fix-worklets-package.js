const fs = require('fs');
const path = 'android/app/build/generated/rncli/src/main/java/com/facebook/react/PackageList.java';

if (!fs.existsSync(path)) {
  console.error('PackageList.java not found.');
  process.exit(1);
}

let content = fs.readFileSync(path, 'utf8');

// Elimina la línea de import
content = content.replace(/\s*import com\.shopify\.reactnative\.worklets\.WorkletsPackage;\n/, '');
// Elimina la línea de uso en el array
content = content.replace(/,?\s*new WorkletsPackage\(\)/, '');

fs.writeFileSync(path, content, 'utf8');
console.log('WorkletsPackage references removed from PackageList.java'); 