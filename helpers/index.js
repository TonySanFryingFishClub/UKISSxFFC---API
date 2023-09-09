
export const exitLog = (err, evt) => {
  if (err) {
    process.stdout.write(`\n\n[!ERROR][${evt}] => ${err}\n\n`);
  } else {
    process.stdout.write(`\n\n![${evt}] EVENT CAUSE EXIT\n\n`);
  }

  process.exit(err ? 1 : 0);
};