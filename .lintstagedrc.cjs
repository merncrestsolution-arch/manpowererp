function chunk(items, size) {
  const groups = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

function quote(file) {
  return `"${file.replace(/\\/g, "/")}"`;
}

function isEslintTarget(file) {
  const normalized = file.replace(/\\/g, "/");
  return !normalized.includes("/mobile/");
}

module.exports = {
  "*.{js,jsx,ts,tsx}": (filenames) => {
    const commands = [];
    const eslintFiles = filenames.filter(isEslintTarget);

    for (const files of chunk(eslintFiles, 25)) {
      commands.push(
        `cross-env ESLINT_USE_FLAT_CONFIG=false eslint --fix --max-warnings 0 ${files.map(quote).join(" ")}`,
      );
    }

    for (const files of chunk(filenames, 25)) {
      commands.push(`prettier --write ${files.map(quote).join(" ")}`);
    }

    return commands;
  },
  "*.{json,css,md}": (filenames) =>
    chunk(filenames, 25).map((files) => `prettier --write ${files.map(quote).join(" ")}`),
};
