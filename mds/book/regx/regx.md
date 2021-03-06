# 正则表达式
[MDN地址](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)

正则表达式是用于匹配字符串中字符组合的模式。在 JavaScript中，正则表达式也是对象。这些模式被用于 RegExp 的 exec 和 test 方法, 以及 String 的 match、replace、search 和 split 方法。

语法

::: warning 注意
当使用构造函数创造正则对象时，需要常规的字符转义规则（在前面加反斜杠 \）
:::
```javascript
var reg=/^(\w+)\1+$/
// 或
var reg = new RegExp("^(\\w+)\\1+$")
```


* 修饰符

修饰符  | 含义
-|-
```i```| 执行对大小写不敏感的匹配。
```g```| 执行全局匹配（查找所有匹配而非在找到第一个匹配后停止）。
```m```| 执行多行匹配。

* 字符

字符  | 含义
-|-
```\``` | 匹配将依照下列规则：<br><br>在非特殊字符之前的反斜杠表示下一个字符是特殊的，不能从字面上解释。例如，前面没有```'\'```的```'b'```通常匹配小写```'b'```，无论它们出现在哪里。如果加了```'\'```,这个字符变成了一个特殊意义的字符，意思是匹配一个字符边界。<br><br>反斜杠也可以将其后的特殊字符，转义为字面量。例如，模式 ```/a*/``` 代表会匹配 0 个或者多个 a。相反，模式 ```/a\*/``` 将 ```'*'``` 的特殊性移除，从而可以匹配像 ```"a*"``` 这样的字符串。<br><br>使用 ```new RegExp("pattern")``` 的时候不要忘记将 \ 进行转义，因为 \ 在字符串里面也是一个转义字符。
```^``` | 匹配输入的开始。
```$``` | 匹配输入的结束。
```*``` | 配前一个表达式0次或多次。等价于 ```{0,}```。<br><br>例如，/bo*/会匹配 "A ghost boooooed" 中的 'booooo' 和 "A bird warbled" 中的 'b'，但是在 "A goat grunted" 中将不会匹配任何东西
```+``` | 匹配前面一个表达式1次或者多次。等价于 ```{1,}```。<br><br>例如，/a+/匹配了在 "candy" 中的 'a'，和在 "caaaaaaandy" 中所有的 'a'。
```?``` | 匹配前面一个表达式0次或者1次。等价于 ```{0,1}```。<br><br>例如，/e?le?/ 匹配 "angel" 中的 'el'，和 "angle" 中的 'le' 以及"oslo' 中的'l'。<br><br>如果紧跟在任何量词``` *、 +、? ```或 ```{}``` 的后面，将会使量词变为非贪婪的（匹配尽量少的字符），和缺省使用的贪婪模式（匹配尽可能多的字符）正好相反。<br></br>
```.```  | （小数点）匹配除换行符之外的任何单个字符。
```(x)``` | 匹配 'x' 并且记住匹配项，就像下面的例子展示的那样。括号被称为 捕获括号。<br><br>模式```/(foo) (bar) \1 \2/```中的 '(foo)' 和 '(bar)' 匹配并记住字符串 "foo bar foo bar" 中前两个单词。模式中的 \1 和 \2 匹配字符串的后两个单词。注意 \1、\2、\n 是用在正则表达式的匹配环节。在正则表达式的替换环节，则要使用像 $1、$2、$n 这样的语法，例如，'bar foo'.replace( /(...) (...)/, '$2 $1' )。
```\d``` | 匹配一个数字。<br><br>等价于[0-9]。
```\D``` | 匹配一个非数字字符。<br><br>等价于[^0-9]。
```\s``` | 匹配一个空白字符，包括空格、制表符、换页符和换行符。<br><br>例如, /\s\w*/ 匹配"foo bar."中的' bar'。
```\S``` |匹配一个非空白字符。<br><br>例如， /\S\w*/ 匹配"foo bar."中的'foo'。
```\w``` | 匹配一个单字字符（字母、数字或者下划线）。<br><br>等价于[A-Za-z0-9_]。<br><br>例如, /\w/ 匹配 "apple," 中的 'a'，"$5.28,"中的 '5' 和 "3D." 中的 '3'。
```\W``` |匹配一个非单字字符。<br><br>等价于[^A-Za-z0-9_]<br><br>例如, /\W/ 或者 /[^A-Za-z0-9_]/ 匹配 "50%." 中的 '%'。
```\n``` |在正则表达式中，它返回最后的第n个子捕获匹配的子字符串(捕获的数目以左括号计数)。<br><br>比如 /apple(,)\sorange\1/ 匹配"apple, orange, cherry, peach."中的'apple, orange,'
```\b```|匹配一个词的边界。
```\B```| 匹配一个非单词边界


* 方括号

表达式  | 含义
-|-
```[xyz]``` |查找方括号之间的任何字符。
```[^xyz]``` |查找任何不在方括号之间的字符。
```[0-9]```|  查找任何从 0 至 9 的数字。
```[a-z]```|  查找任何从小写 a 到小写 z 的字符。
```[A-Z]``` |查找任何从大写 A 到大写 Z 的字符。
```[A-z]```| 查找任何从大写 A 到小写 z 的字符。
```[adgk]```|查找给定集合内的任何字符。
```[^adgk]```|查找给定集合外的任何字符。
```(red|blue|green)```|查找任何指定的选项。
