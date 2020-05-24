/**
 *
 * 把匀速动画变成了匀减速动画
 */

function animate_v1(element,target){
    clearInterval(element.timer);
    element.timer = setInterval(function(){
        var current = element.offsetLeft;
        //计算步长 --
        var step = (target - current) / 10;
        //有时候需要向上取整，有时候需要向下取整
//            if(current <= target){
//                step = Math.ceil(step);
//            }else {
//                step = Math.floor(step);
//            }

        //优化成三元表达式
        step = current <= target? Math.ceil(step) : Math.floor(step);

        //判断方向 -- 已经不需要，因为step已经自带方向
//            if(current <= target){
//                current += step;
//            }else {
//                current -= step;
//            }
        //修改下一步的位置
        current += step;
        //设置属性
        element.style.left = current + "px";
//            if(Math.abs(target - current) <= step){
        if(target == current){
//                element.style.left = target + "px";
            clearInterval(element.timer);
        }
    },20);
}



function getStyle(element,attr){
    if(window.getComputedStyle){
        return window.getComputedStyle(element,null)[attr];
    }else{
        return element.currentStyle[attr];
    }
}

/**
 * 上个版本： 只能修改横向位置
 *
 *  进步：
 *      可以修改任意以px为单位的属性
 *
 */
function animate_v2(element,target,attr){
    clearInterval(element.timer);
    element.timer = setInterval(function(){
        //获取当前值
        var current = parseInt(getStyle(element,attr));
        //计算下一步
        var step = (target - current) / 10;
        step = step >=0 ? Math.ceil(step) : Math.floor(step);
        current += step;
        //修改到元素身上
        element.style[attr] = current + 'px';
        //停下
        if(current == target){
            clearInterval(element.timer);
        }
    },20);
}

/**
 *
 *  上一个版本的缺陷在于：只能修一个属性
 *
 *
 *  这个版本的进步：
 *      可以同时修改多个属性
 *
 *
 *      缺陷：
 *          一旦某个属性先到达了目标值，就把定时器清除了，如果此时其他的属性还没有到达目标值，一样会停留在没有到达目标值的状态
 *
 *          -- 只有一个属性能到达目标值
 *
 *
 */
function animate_v3(element,obj){
    clearInterval(element.timer);
    element.timer = setInterval(function(){
        //第二个要修改的：遍历传入的对象，把对象里的每一个键值对拿出来，按照单个属性的逻辑执行
        for(var attr in obj){
            //遍历得到的每个属性对应的属性值，就是要修改的目标值
            var target = obj[attr];
            //获取当前值
            var current = parseInt(getStyle(element,attr));
            //计算下一步
            var step = (target - current) / 10;
            step = step >=0 ? Math.ceil(step) : Math.floor(step);
            current += step;
            //修改到元素身上
            element.style[attr] = current + 'px';
            //停下
            if(current == target){
                clearInterval(element.timer);
            }
        }

    },20);
}


/**
 *  上一个版本：
 *      所有的属性无法同时到达目标值
 *
 *  进步：
 *      可以让所有的属性到达目标
 */
function animate_v4(element,obj){
    clearInterval(element.timer);
    element.timer = setInterval(function(){
        //立一个flag  假设所有的属性都已经到达了目标值
        var flag = true;
        //在循环里面尝试证明flag不成立
        for(var attr in obj){
            //遍历得到的每个属性对应的属性值，就是要修改的目标值
            var target = obj[attr];
            //获取当前值
            var current = parseInt(getStyle(element,attr));
            //计算下一步
            var step = (target - current) / 10;
            step = step >=0 ? Math.ceil(step) : Math.floor(step);
            current += step;
            //修改到元素身上
            element.style[attr] = current + 'px';
            //停下
            if(current != target){//只要有任意一个属性没有到达目标值，都把flag设置为false
//                    clearInterval(element.timer);
                flag = false;
            }
        }
        //再次判断flag是否依然成立
        if(flag){
            //所有的属性已经到达目标值  ---  计时器应该停下了
            clearInterval(element.timer);
        }

    },20);
}


/**
 *
 *  上一个版本：
 *      能够修改以px为单位的多个属性
 *
 *  当前版本：
 *      还可以修改透明度和层级
 *
 *
 */
function animate_v5(element,obj){
    clearInterval(element.timer);
    element.timer = setInterval(function(){
        var flag = true;
        for(var attr in obj){
            //透明度是不以px为单位  -- 必须单独处理
            if(attr == "opacity"){
                var target = obj[attr];
                //透明度是0-1之间的小数，不能直接取整 - 要得到的是浮点数
                var current = parseFloat(getStyle(element,attr));

                //先把current和target放大100倍在向下取整  -- 透明度需要放大取整再来计算逻辑
                target *= 100;
                current *= 100;
                target = Math.floor(target);
                current = Math.floor(current);

                var step = (target - current) / 10;
                step = step >=0 ? Math.ceil(step) : Math.floor(step);
                current += step;
                element.style[attr] = current / 100;

                /**
                 *  计算机中，计算小数是可能存在误差的，这个误差是非常致命
                 *
                 *  用来比较是否相等 是非常致命
                 *  一定要避免直接把两个小数的运算结果进行比较
                 *
                 *  如果遇上非要比较两个小数计算结果的问题
                 *
                 *      先放大再取整再比较
                 *
                 *      放大多少倍？取决于你想要的精度
                 *
                 *      把透明度一般放大一百倍
                 */

                if(current != target){
                    flag = false;
                }
            }else if (attr == "zIndex"){//z-index也是没有单位 -- 必须单独处理
                //zIndex的变化根本看不见，所以没有必要做动画
                //直接设置为目标值即可
                element.style[attr] = obj[attr];
            }else{
                var target = obj[attr];
                var current = parseInt(getStyle(element,attr));
                var step = (target - current) / 10;
                step = step >=0 ? Math.ceil(step) : Math.floor(step);
                current += step;
                element.style[attr] = current + 'px';
                if(current != target){
                    flag = false;
                }
            }
        }
        if(flag){
            clearInterval(element.timer);
        }

    },20);
}


function animate_v6(element,obj,callback){
    clearInterval(element.timer);
    element.timer = setInterval(function(){
        var flag = true;
        for(var attr in obj){
            //透明度是不以px为单位  -- 必须单独处理
            if(attr == "opacity"){
                var target = obj[attr];
                //透明度是0-1之间的小数，不能直接取整 - 要得到的是浮点数
                var current = parseFloat(getStyle(element,attr));

                //先把current和target放大100倍在向下取整  -- 透明度需要放大取整再来计算逻辑
                target *= 100;
                current *= 100;
                target = Math.floor(target);
                current = Math.floor(current);

                var step = (target - current) / 10;
                step = step >=0 ? Math.ceil(step) : Math.floor(step);
                current += step;
                element.style[attr] = current / 100;

                /**
                 *  计算机中，计算小数是可能存在误差的，这个误差是非常致命
                 *
                 *  用来比较是否相等 是非常致命
                 *  一定要避免直接把两个小数的运算结果进行比较
                 *
                 *  如果遇上非要比较两个小数计算结果的问题
                 *
                 *      先放大再取整再比较
                 *
                 *      放大多少倍？取决于你想要的精度
                 *
                 *      把透明度一般放大一百倍
                 */

                if(current != target){
                    flag = false;
                }
            }else if (attr == "zIndex"){//z-index也是没有单位 -- 必须单独处理
                //zIndex的变化根本看不见，所以没有必要做动画
                //直接设置为目标值即可
                element.style[attr] = obj[attr];
            }else{
                var target = obj[attr];
                var current = parseInt(getStyle(element,attr));
                var step = (target - current) / 10;
                step = step >=0 ? Math.ceil(step) : Math.floor(step);
                current += step;
                element.style[attr] = current + 'px';
                if(current != target){
                    flag = false;
                }
            }
        }
        if(flag){
            clearInterval(element.timer);

            //在动画结束的时候调用回调函数
            if(typeof  callback == "function"){
                callback();
            }
        }

    },20);
}


/**
 *
 *   v  --  version   --  版本
 *
 *
 *
 */
