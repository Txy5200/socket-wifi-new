
// 压力颜色分类
export const pressColor = [
  'rgb(0,0,0)',
  'rgb(0,0,255)',
  'rgb(0,64,255)',
  'rgb(0,128,255)',
  'rgb(0,255,255)',
  'rgb(0,128,64)',
  'rgb(0,192,0)',
  'rgb(0,224,0)',
  'rgb(0,255,0)',
  'rgb(255,255,0)',
  'rgb(255,192,0)',
  'rgb(255,160,0)',
  'rgb(255,128,0)',
  'rgb(255,0,0)',
  'rgb(192,0,0)',
  'rgb(160,0,0)',
  'rgb(160,0,0)'
]

// 判断身份证号码格式
export const checkIdCard = idCard => {
  let city = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外'
  }
  let tip = ''
  let pass = true
  if (!idCard || !/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(idCard)) {
    tip = '身份证号格式错误'
    pass = false
  } else if (!city[idCard.substr(0, 2)]) {
    tip = '地址编码错误'
    pass = false
  } else {
    // 18位身份证需要验证最后一位校验位
    if (idCard.length === 18) {
      idCard = idCard.split('')
      // ∑(ai×Wi)(mod 11)
      // 加权因子
      let factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
      // 校验位
      let parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
      let sum = 0
      let ai = 0
      let wi = 0
      for (let i = 0; i < 17; i++) {
        ai = idCard[i]
        wi = factor[i]
        sum += ai * wi
      }
      let last = parity[sum % 11] + ''

      if (last.trim() !== idCard[17].trim()) {
        tip = '校验位错误'
        pass = false
      }
    }
  }
  return { pass, tip }
}

// 通过身份证获取年龄
export const getAgeByIdCard = idCard => {
  let nowDate = new Date();
  let month = nowDate.getMonth() + 1;
  let day = nowDate.getDate();
  let age = nowDate.getFullYear() - idCard.substring(6, 10) - 1;
  if (idCard.substring(10, 12) < month || idCard.substring(10, 12) == month && idCard.substring(12, 14) <= day) {
    age++;
  }
  return age;
}

// 通过压力值获取图片背景地址
export const getUrlByPress = (array, type) => {
  const leftFront = [
    'left-front-one.png', 'left-front-two.png', 'left-front-three.png'
  ]
  const leftMiddle = [
    'left-middle-one.png', 'left-middle-two.png', 'left-middle-three.png'
  ]
  const leftBehind = [
    'left-behind-one.png', 'left-behind-two.png', 'left-behind-three.png'
  ]

  const rightFront = [
    'right-front-one.png', 'right-front-two.png', 'right-front-three.png'
  ]
  const rightMiddle = [
    'right-middle-one.png', 'right-middle-two.png', 'right-middle-three.png'
  ]
  const rightBehind = [
    'right-behind-one.png', 'right-behind-two.png', 'right-behind-three.png'
  ]

  let array1 = []
  let picArray = []
  const sort = index => {
    if(!array.length){
      array1 = [2,2,2]
      return
    }
    if (index >= array.length) return
    let item = array[index]
    let num = 2
    for (let i = 0; i < array.length; i++) {
      if (index === i) continue
      if (array[i] > item) num--
    }
    array1[index] = num
    sort(++index)
  }
  sort(0)

  switch (type) {
    case 'left':
      picArray[0] = leftFront[array1[0]]
      picArray[1] = leftMiddle[array1[1]]
      picArray[2] = leftBehind[array1[2]]
      break
    case 'right':
      picArray[0] = rightFront[array1[0]]
      picArray[1] = rightMiddle[array1[1]]
      picArray[2] = rightBehind[array1[2]]
      break
    default:
      return []
  }

  return picArray
}


/**
 * @param x 为椭圆中心x值
 * @param y 为椭圆中心y值
 * @param a 为椭圆长半轴
 * @param b 为椭圆短半轴
 * @param rotate 为旋转角度
 * @returns Array 坐标点
 */
export const createEllipse = ({x,y,a,b,angle}) => {
  //step是等于1除以长轴值a和b中的较大者
  //i每次循环增加1/step，表示度数的增加
  //这样可以使得每次循环所绘制的路径（弧线）接近1像素
  let step = (a > b) ? 1 / a : 1 / b,
  points=[];

  for (let i = 0; i < 2 * Math.PI; i += step){
    //x²/a²+y²/b²=1 (a>b>0)
    //参数方程为x = a * cos(i), y = b * sin(i)，
    //参数为i，表示度数（弧度） 
    let x1 = a * Math.cos(i) * Math.cos(angle) - b * Math.sin(i) * Math.sin(angle) + x;//x+a*Math.cos(i);
    let y1 = a * Math.cos(i) * Math.sin(angle) + b * Math.sin(i) * Math.cos(angle) + y;//y+b*Math.sin(i);
    let point= [x1,y1]

    points.push(point);
  }

  return points;
}


// 格式化毫秒时间
export const formatSliderTime = (msTime) => {
  let totalTimeHou = parseInt(msTime/1000/60/60%60)
  let totalTimeMin = parseInt(msTime/1000/60%60)
  totalTimeMin = totalTimeMin < 10 ? '0' + totalTimeMin : totalTimeMin
  let totalTimeSec = parseInt(msTime/1000%60)
  totalTimeSec = totalTimeSec < 10 ? '0' + totalTimeSec : totalTimeSec

  return `${totalTimeHou}:${totalTimeMin}:${totalTimeSec}`
}