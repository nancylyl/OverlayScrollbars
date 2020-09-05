const PuppeteerEnvironment = require('jest-environment-puppeteer');
const fs = require('fs');
const path = require('path');
const del = require('del');
const rollup = require('rollup');
const rollupPluginHtml = require('@rollup/plugin-html');
const rollupPluginStyles = require('rollup-plugin-styles');
const rollupConfig = require('./rollup.config.js');
const resolve = require('./resolve.config.json');

const rollupInputHtmlFile = 'index.html';
const rollupInputFile = 'index';
const rollupOutputHtmlFile = 'build.html';
const rollupOutputFile = 'build';
const rollupOutputDir = 'build';
const rollupNodeEnv = 'build';

const getRollupInfos = (testPath) => {
  const projectRootPath = path.resolve(__dirname, resolve.projectRoot);
  const testDir = path.dirname(testPath);
  const input = path.resolve(testDir, rollupInputFile);
  const dist = path.resolve(testDir, rollupOutputDir);
  const file = rollupOutputFile;
  const testName = path.basename(testDir);

  return {
    projectRootPath,
    testDir,
    testName,
    input,
    dist,
    file,
  };
};

const makeHtmlAttributes = (attributes) => {
  if (!attributes) {
    return '';
  }

  const keys = Object.keys(attributes);
  // eslint-disable-next-line no-param-reassign
  // eslint-disable-next-line no-return-assign
  return keys.reduce((result, key) => (result += ` ${key}="${attributes[key]}"`), '');
};

const genHtmlTemplateFunc = (content) => ({ attributes, files, meta, publicPath, title }) => {
  const scripts = (files.js || [])
    .map(({ fileName }) => `<script src="${publicPath}${fileName}"${makeHtmlAttributes(attributes.script)}></script>`)
    .join('\n');

  const links = (files.css || [])
    .map(({ fileName }) => `<link href="${publicPath}${fileName}" rel="stylesheet"${makeHtmlAttributes(attributes.link)}>`)
    .join('\n');

  const metas = meta.map((input) => `<meta${makeHtmlAttributes(input)}>`).join('\n');

  return `<!doctype html>
<html${makeHtmlAttributes(attributes.html)}>
  <head>
    ${metas}
    <title>${title}</title>
    ${links}
  </head>
  <body>
    ${content || ''}
    ${scripts}
  </body>
</html>`;
};

const setupRollupTest = async (testPath) => {
  const { projectRootPath, input, dist, file, testName, testDir } = getRollupInfos(testPath);
  const testPathSplit = path.relative(projectRootPath, testPath).split(path.sep);

  if (testPathSplit.length > 0) {
    const [project] = testPathSplit;
    const env = process.env.NODE_ENV;

    try {
      process.env.NODE_ENV = rollupNodeEnv;
      const htmlFilePath = path.resolve(testDir, rollupInputHtmlFile);
      const htmlFileContent = fs.existsSync(htmlFilePath) ? fs.readFileSync(htmlFilePath, 'utf8') : null;
      let rollupConfigObj = rollupConfig(
        { 'config-project': project },
        {
          overwrite: {
            input,
            dist,
            file,
            types: null,
            minVersions: false,
            esmBuild: false,
            sourcemap: false,
            pipeline: [
              rollupPluginStyles(),
              ...rollupConfig.defaults.pipeline,
              rollupPluginHtml({
                title: `Jest-Puppeteer: ${testName}`,
                fileName: rollupOutputHtmlFile,
                template: genHtmlTemplateFunc(htmlFileContent),
                meta: [{ charset: 'utf-8' }, { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }],
              }),
            ],
          },
          silent: true,
          fast: true,
          check: false,
        }
      );

      if (!Array.isArray(rollupConfigObj)) {
        rollupConfigObj = [rollupConfigObj];
      }

      for (let i = 0; i < rollupConfigObj.length; i++) {
        const inputConfig = rollupConfigObj[i];
        let { output } = inputConfig;
        // eslint-disable-next-line no-await-in-loop
        const bundle = await rollup.rollup(inputConfig);

        if (!Array.isArray(output)) {
          output = [output];
        }

        for (let v = 0; v < output.length; v++) {
          const outputConfig = output[i];
          // eslint-disable-next-line no-await-in-loop
          await bundle.write(outputConfig);
        }
      }
    } catch (e) {
      console.warn(e);
    }
    process.env.NODE_ENV = env;
  }
};

const cleanupRollupTest = (testPath) => {
  const { dist } = getRollupInfos(testPath);
  del(dist);
};

class PuppeteerRollupEnvironment extends PuppeteerEnvironment {
  constructor(config, context) {
    super(config, context);

    this.ctx = context;
  }

  async setup() {
    await setupRollupTest(this.ctx.testPath);
    await super.setup();
  }

  async teardown() {
    cleanupRollupTest(this.ctx.testPath);
    await super.teardown();
  }
}

module.exports = PuppeteerRollupEnvironment;
