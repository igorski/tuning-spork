const dirSrc = `./src`;

module.exports = {
    //lintOnSave: false,
    publicPath: './',
    productionSourceMap: false,
    pages: {
        // self contained page
        index: {
            entry: `${dirSrc}/main.js`,
            template: 'public/index.html',
        },
        // application assets only (e.g. HTML <body />)
        app: {
            entry: `${dirSrc}/main.js`,
            template: 'public/index-app.html',
        }
    }
};
