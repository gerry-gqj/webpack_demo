//开发环境配置
const os = require("os");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // css打包处理插件

const TerserPlugin = require("terser-webpack-plugin");

// cpu核数
const threads = os.cpus().length;


const getStyleLoaders = (preProcessor) => {
    return [
      MiniCssExtractPlugin.loader,
      "css-loader",
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            plugins: [
              "postcss-preset-env", // 能解决大多数样式兼容性问题
            ],
          },
        },
      },
      preProcessor,
    ].filter(Boolean);
};


module.exports = {
    //入口
    entry: "./src/main.js",
    //输出
    output:{
        //文件输出路径, 开发环境不需要打包输出
        // path:path.resolve(__dirname, "dist"),
        path:undefined,
        //文件名
        filename:'static/js/main.js', //js打包输出路径
        //每次打包清空原来的打包文件, 开发环境不需要打包, 该字段不需要设置
        //clean:true 
    },
    //加载器
    module:{
        rules:[
            {
                oneOf:[
                    //loader配置
                    {
                        test: /\.css$/, 
                        use:getStyleLoaders()
                    },{
                        test: /\.less$/,
                        use: getStyleLoaders("less-loader")
                        // use: ["style-loader", "css-loader", "less-loader"],
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoaders("sass-loader")
                        // use: ["style-loader", "css-loader", "sass-loader"],
                    },{
                        test: /\.styl$/,
                        use: getStyleLoaders("stylus-loader")
                        // use: ["style-loader", "css-loader", "stylus-loader"],
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
                    //babel配置
                    {
                        test: /\.js$/,
                        exclude: /node_modules/, // 排除node_modules代码不编译
                        //include: path.resolve(__dirname, "../src"), // 也可以用包含
                        use:[
                            {
                                loader: "thread-loader", // 开启多进程
                                options: {
                                    workers: threads, // 数量
                                },
                            },{
                              loader: "babel-loader",
                              options: {
                                  cacheDirectory: true, // 开启babel编译缓存
                                  cacheCompression: false, // 缓存文件不要压缩
                                  //plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                              },
                            }
                        ],
                    },
                ]   
            },
        ]
    },
    //插件
    plugins:[
        //plugins的配件
        //eslint配置
        new ESLintWebpackPlugin({
            // 指定检查文件的根目录
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules", // 默认值
            cache: true, // 开启缓存
            // 缓存目录
            cacheLocation: path.resolve(
              __dirname,
              "../node_modules/.cache/.eslintcache"
            ),
            threads, //多线程打包
          }),
        // html打包配置
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            // template: path.resolve(__dirname, "public/index.html"),
            template: path.resolve(__dirname, "../public/index.html"),//开发环境配置文件发生改变, 要改变路径层级, 回退一个层级从config路径回退到项目根,然后进入public路径
        }),
        //输出css为一个文件main.css
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/main.css",
        }),
    ],
    // 模式
    mode:"development",
    devtool: "cheap-module-source-map",


    optimization: {
        minimize: true,
        minimizer: [
          // css压缩也可以写到optimization.minimizer里面，效果一样的 生产幻境下
          // new CssMinimizerPlugin(),
          // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
          new TerserPlugin({
            parallel: threads // 开启多进程
          })
        ],
      },


      // 开发服务器
    devServer: {
      host: "localhost", // 启动服务器域名
      port: "3000", // 启动服务器端口号
      open: true, // 是否自动打开浏览器
      hot:true
    },

}