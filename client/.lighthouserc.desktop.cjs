module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: ["/"],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox --disable-gpu",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci_reports/desktop",
    },
  },
};
