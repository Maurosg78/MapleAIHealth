import ResponseClassifier from './responseMode.mjs';

async function main() {
  try {
    const result = await ResponseClassifier.processNextIssue();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 