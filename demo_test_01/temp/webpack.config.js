const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    //入口
    entry: "./src/main.js",
    //输出
    output:{
        //文件输出路径
        path:path.resolve(__dirname, "dist"),
        //文件名
        filename:'static/js/main.js', //js打包输出路径
        clean:true
    },
    //加载器
    module:{
        rules:[
            //loader的配置
            {
                test: /\.css$/, 
                use:[
                        // [style-loader](/loaders/style-loader)
                        { loader: 'style-loader' },
                        // [css-loader](/loaders/css-loader)
                        {
                            loader: 'css-loader',
                            // options: {
                            //     modules: true
                            // }
                        },
                ]
            },{
                test:/\.png|jpe?g|gif|webp$/,
                type:"asset",
                parser: {
                    dataUrlCondition: {
                      maxSize: 4 * 1024 // 4kb 小于4kb转换bash64 可以自定义修改
                    }
                },
                generator: {
                    filename: 'static/images/[hash][ext][query]' //修改输出路径以及命名方式
                }
            },
            // 处理字体
            {
                test:/\.(ttl|woff2?|mp3|mp4|mvi)$/,
                type:"asset/resource", //asset/resource不会压缩  /asset会被压缩, 例如上面的图片处理低于4kb会被压缩成bash64
                 generator: {
                     filename: 'static/media/[hash][ext][query]' //修改输出路径以及命名方式
                 }
            },

        ]
    },
    //插件
    plugins:[
        //plugins的配件
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, "public/index.html"),
        }),
    ],
    // 模式
    mode:"development",

      // 开发服务器
    devServer: {
      host: "localhost", // 启动服务器域名
      port: "3000", // 启动服务器端口号
      open: true, // 是否自动打开浏览器
    },

}