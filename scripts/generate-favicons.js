const { favicons } = require('favicons');
const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../public/cnt-logo.png'); // Source image(s). `string`, `buffer` or array of `string`
const configuration = {
  path: "/", // Path for overriding default icons path. `string`
  appName: "ATS CV Checker", // Your application's name. `string`
  appShortName: "ATS Checker", // Your application's short_name. `string`. Optional. If not set, appName will be used
  appDescription: "AI-powered ATS compatibility checker for resumes and CVs", // Your application's description. `string`
  developerName: "CNT Recruitment", // Your (or your developer's) name. `string`
  developerURL: "https://cnt-recruitment.com", // Your (or your developer's) URL. `string`
  dir: "auto", // Primary text direction for name, short_name, and description
  lang: "en-US", // Primary language for name and short_name
  background: "#ffffff", // Background colour for flattened icons. `string`
  theme_color: "#2972b6", // Theme color user for example in Android's task switcher. `string`
  appleStatusBarStyle: "black-translucent", // Style for Apple status bar: "black-translucent", "default", "black". `string`
  display: "standalone", // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
  orientation: "any", // Default orientation: "any", "natural", "portrait" or "landscape". `string`
  scope: "/", // set of URLs that the browser considers within your app
  start_url: "/", // Start URL when launching the application from a device. `string`
  version: "1.0", // Your application's version string. `string`
  logging: false, // Print logs to console? `boolean`
  pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
  loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
  manifestMaskable: false, // Maskable source image(s) for manifest.json. "true" to use default source. More information at https://web.dev/maskable-icon/. `boolean`, `string`, `buffer` or array of `string`
  icons: {
    // Platform Options:
    // - offset - offset in percentage
    // - background:
    //   * false - use default
    //   * true - force use default, e.g. set background for Android icons
    //   * color - set background for the specified icons
    //
    android: true, // Create Android homescreen icon. `boolean` or `{ offset, background }`
    appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background }`
    appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background }`
    favicons: true, // Create regular favicons. `boolean`
    windows: true, // Create Windows 8 tile icons. `boolean` or `{ offset, background }`
    yandex: true // Create Yandex browser icon. `boolean` or `{ offset, background }`
  }
};

const callback = (error, response) => {
  if (error) {
    console.log(error.message); // Error description e.g. "An unknown error has occurred"
    return;
  }
  
  response.images.forEach(image => {
    fs.writeFileSync(path.resolve(__dirname, '../public/', image.name), image.contents);
  });
  
  response.files.forEach(file => {
    fs.writeFileSync(path.resolve(__dirname, '../public/', file.name), file.contents);
  });
  
  console.log('Favicons generated successfully!');
};

favicons(source, configuration, callback);