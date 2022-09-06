//生产环境配置
const os = require("os");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //html打包处理插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // css打包处理插件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); //css压缩插件
const ESLintWebpackPlugin = require("eslint-webpack-plugin"); //eslint检查插件
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");



const TerserPlugin = require("terser-webpack-plugin");

// cpu核数
const threads = os.cpus().length;
console.log("threads: "+threads);



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
        //文件输出路径
        path:path.resolve(__dirname, "../dist"), //生产环境打包输出路径
        //文件名
        filename:'static/js/main.js', //js打包输出路径
        clean:true
    },
    //加载器
    module:{
        rules:[
            //loader的配置
            {   
                oneOf:[
                    {   //css-loader
                        test: /\.css$/, 
                        use: getStyleLoaders()
                    },{
                        //less-loader
                        test: /\.less$/,
                        use: getStyleLoaders("less-loader")
                      },
                      {
                        //sass-loader
                        test: /\.s[ac]ss$/,
                        use: getStyleLoaders("sass-loader")
                      },
                      { 
                        //styl-loader
                        test: /\.styl$/,
                        use: getStyleLoaders("stylus-loader")
                      },
                    
                    {   //asset
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
                          },
                          {
                            loader: "babel-loader",
                            options: {
                                cacheDirectory: true, // 开启babel编译缓存
                                cacheCompression: false, // 缓存文件不要压缩
                                plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                            },
                          }
                        ],
                    },
                ]
            }
        ]
    },
    //插件
    plugins:[
        //plugins的配件
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
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, "../public/index.html"), //生产环境检测html路劲
        }),
        //输出css为一个文件main.css
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/main.css",
        }),
        //压缩css
        // new CssMinimizerPlugin(), //也可以在下面配置

    ],

    // 模式
    mode:"production",
    devtool: "source-map",

    optimization: {
      minimize: true,
      minimizer: [
        // css压缩也可以写到optimization.minimizer里面，效果一样的
        new CssMinimizerPlugin(),
        // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
        new TerserPlugin({
          parallel: threads // 开启多进程
        }),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: [
                ["gifsicle", { interlaced: true }],
                ["jpegtran", { progressive: true }],
                ["optipng", { optimizationLevel: 5 }],
                [
                  "svgo",
                    {
                      plugins: [
                        "preset-default",
                        "prefixIds",
                          {
                            name: "sortAttrs",
                            params: {
                              xmlnsOrder: "alphabetical",
                            },
                          },
                      ],
                    },
                ],
              ],
            },
          },
        }),
      ],
    },
}