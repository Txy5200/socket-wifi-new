import fs from 'fs'
const { BrowserWindow } = require('electron')
import { variables } from '../global_variables'

// 导出PDF
export const exportToPDF = ({ pdfPath }, cb, event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  // 使用默认打印选项
  win.webContents.printToPDF({ landscape: true, printBackground: true, pageSize: 'A4' }, function(error, data) {
    if (error) {
      cb(null, error, -1)
    } else {
      fs.writeFile(pdfPath, data, function(error) {
        if (error) {
          cb(null, error, -1)
        } else {
          cb()
        }
      })
    }
  })
}

export const computeCopEllipse = () => {
  const cop_position = variables.cop_position
  if (!cop_position.length) return
  let sum_x = 0
  let sum_y = 0
  cop_position.forEach(value => {
    sum_x += value[0]
    sum_y += value[1]
  })

  const x_avg = sum_x / cop_position.length
  const y_avg = sum_y / cop_position.length

  let sum_1 = 0
  let sum_2 = 0
  let sum_3 = 0
  cop_position.forEach(value => {
    let x_i = value[0] - x_avg
    let y_i = value[1] - y_avg
    sum_1 += Math.pow(x_i, 2)
    sum_2 += Math.pow(y_i, 2)
    sum_3 += x_i * y_i
  })

  const x_avg_f = sum_1 / cop_position.length
  const y_avg_f = sum_2 / cop_position.length
  const xy_avg_f = sum_3 / cop_position.length

  const p1 = (x_avg_f + y_avg_f + Math.sqrt(Math.pow(x_avg_f + y_avg_f, 2) - 4 * (x_avg_f * y_avg_f - Math.pow(xy_avg_f, 2)))) / 2
  const p2 = (x_avg_f + y_avg_f - Math.sqrt(Math.pow(x_avg_f + y_avg_f, 2) - 4 * (x_avg_f * y_avg_f - Math.pow(xy_avg_f, 2)))) / 2
  const p1_abs = Math.abs(p1)
  const p2_abs = Math.abs(p2)
  const p_max = getMaxAbsValue(p1, p2)
  let angle = Math.atan((-1 * xy_avg_f) / (y_avg_f - p_max))
  if (angle < 0) angle = angle + 2 * Math.PI
  let a, b

  if (p1_abs >= p2_abs) {
    a = Math.sqrt(5.991 * p1_abs)
    b = Math.sqrt(5.991 * p2_abs)
  } else {
    a = Math.sqrt(5.991 * p2_abs)
    b = Math.sqrt(5.991 * p1_abs)
  }
  variables.copEllipse = { x: x_avg, y: y_avg, angle, a, b }
}

const getMaxAbsValue = (num1, num2) => {
  let abs1 = Math.abs(num1)
  let abs2 = Math.abs(num2)
  return abs1 >= abs2 ? abs1 : abs1
}
