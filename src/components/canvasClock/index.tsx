/*
 * @Descripttion: canvas 时钟
 * @version: 1.0.0
 * @Author: jiaxiantao
 * @Date: 2021-06-25 11:20:17
 * @LastEditors: jiaxiantao
 * @LastEditTime: 2021-08-31 17:57:50
 */
import React, {ReactNode, useEffect, useRef} from 'react'
import styles from './style/index.less'

export interface CanvasClockProps {
  width?: number
  height?: number
}

const CanvasClock = (props: CanvasClockProps) => {
  const {width = 400, height = 400} = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  /**
   * @desc: 获取当前时间
   * @param {*}
   * @return {*}
   */
  const getCurrentTime = () => {
    // 获取当前时，分，秒，毫秒
    const time = new Date()
    const hour = time.getHours() % 12
    const min = time.getMinutes()
    const sec = time.getSeconds()
    const milliSec = time.getMilliseconds()
    return {
      hour,
      min,
      sec,
      milliSec,
    }
  }

  /**
   * @desc: 创建中心点
   * @param {*}
   * @return {*}
   */
  const createCenterPointer = (ctx: CanvasRenderingContext2D) => {
    // 画中间的小圆
    ctx.beginPath()
    ctx.arc(0, 0, 3, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.closePath()
  }

  /**
   * @desc:  绘制刻度
   * @param {*}
   * @return {*}
   */
  const drawScale = (ctx: CanvasRenderingContext2D) => {
    // 保存上一次的状态
    ctx.save()
    // 绘制刻度，也是跟绘制时分秒针一样，只不过刻度是死的
    ctx.lineWidth = 1
    for (let i = 0; i < 60; i += 1) {
      ctx.rotate((2 * Math.PI) / 60)
      ctx.beginPath()
      ctx.moveTo(94, 0)
      ctx.lineTo(100, 0)
      ctx.stroke()
      ctx.closePath()
    }
    // 恢复成上一次保存的状态
    ctx.restore()
    ctx.save()

    ctx.lineWidth = 1
    for (let i = 0; i < 12; i += 1) {
      ctx.rotate((2 * Math.PI) / 12)
      ctx.beginPath()
      ctx.lineTo(90, 0)
      ctx.lineTo(91, 2)
      ctx.lineTo(100, 2)
      // ctx.lineTo(100, 0);
      // 画圆线使用arc(中心点X,中心点Y,半径,起始角度,结束角度)
      ctx.arc(0, 0, 100, 0, (2 * Math.PI) / 250)
      ctx.lineTo(100, -2)
      ctx.lineTo(91, -2)
      ctx.lineTo(90, 0)
      ctx.stroke()
      ctx.fillStyle = 'black'
      ctx.fill()
      ctx.closePath()
    }
    ctx.restore()
  }

  /**
   * @desc:  绘制数字
   * @param {*}
   * @return {*}
   */
  const drawScaleNumber = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    // 绘制刻度，也是跟绘制时分秒针一样，只不过刻度是死的
    ctx.lineWidth = 1
    const textRadius = 80 // 设置文字半径为80，与边界相差20个像素
    for (let i = 0; i < 12; i += 1) {
      ctx.font = '16px Arial'
      ctx.fillText(
        (i + 1).toString(),
        textRadius * Math.sin((Math.PI * (i + 1)) / 6) - (Math.ceil(i / 8) * 8) / 2,
        -(textRadius * Math.cos((Math.PI * (i + 1)) / 6) - 12 / 2)
      )
    }
    ctx.restore()
  }

  /**
   * @desc: 创建指针
   * @param {*}
   * @return {*}
   */
  const createPointer = (ctx: CanvasRenderingContext2D) => {
    const {hour, min, sec, milliSec} = getCurrentTime()
    // 保存上一次的状态
    ctx.save()
    // 时针
    ctx.rotate(((2 * Math.PI) / 12) * (hour + min / 60) - Math.PI / 2)
    ctx.beginPath()
    // moveTo设置画线起点
    ctx.moveTo(-3, 0)
    // lineTo设置画线经过点
    ctx.lineTo(0, 3)
    ctx.lineTo(45, 3)
    ctx.lineTo(50, 0)
    ctx.lineTo(45, -3)
    ctx.lineTo(0, -3)
    ctx.lineTo(-3, 0)
    // 设置线宽
    ctx.lineWidth = 1
    ctx.strokeStyle = 'black'
    ctx.stroke()

    // 创建黑色阴影，模糊级数是 4
    ctx.shadowBlur = 4
    ctx.shadowColor = 'black'
    // 填充颜色
    ctx.fillStyle = 'black'
    ctx.fill()

    ctx.closePath()
    // 恢复成上一次保存的状态
    ctx.restore()
    ctx.save()

    // 分针
    ctx.rotate(((2 * Math.PI) / 60) * (min + sec / 60) - Math.PI / 2)
    ctx.beginPath()
    // moveTo设置画线起点
    ctx.moveTo(-2, 0)
    // lineTo设置画线经过点
    ctx.lineTo(0, 2)
    ctx.lineTo(52, 2)
    ctx.lineTo(60, 0)
    ctx.lineTo(52, -2)
    ctx.lineTo(0, -2)
    ctx.lineTo(-2, 0)
    ctx.lineWidth = 1
    ctx.strokeStyle = '#1e80ff'
    ctx.stroke()
    // 创建蓝色阴影，模糊级数是 3
    ctx.shadowBlur = 3
    ctx.shadowColor = '#1e80ff'
    // 填充颜色
    ctx.fillStyle = '#1e80ff'
    ctx.fill()
    ctx.closePath()
    ctx.restore()
    ctx.save()

    // 秒针
    ctx.rotate(((2 * Math.PI) / 60) * (sec - 1 + milliSec / 1000) - Math.PI / 2)
    ctx.beginPath()
    // moveTo设置画线起点
    ctx.moveTo(-1, 0)
    ctx.lineTo(0, 1)
    ctx.lineTo(60, 1)
    ctx.lineTo(70, 0)
    ctx.lineTo(60, -1)
    ctx.lineTo(0, -1)
    ctx.lineTo(-1, 0)
    ctx.strokeStyle = '#e9686b'
    ctx.stroke()
    // 创建红色阴影，模糊级数是 2
    ctx.shadowBlur = 2
    ctx.shadowColor = '#e9686b'
    // 填充颜色
    ctx.fillStyle = '#e9686b'
    ctx.fill()
    ctx.closePath()

    ctx.restore()
  }

  /**
   * @desc: 绘制时钟
   * @param {*} ctx
   * @return {*}
   */
  const drawClock = (ctx: CanvasRenderingContext2D) => {
    if (ctx) {
      ctx.save()
      // 保存清除状态
      ctx.clearRect(0, 0, 200, 200)

      // 设置中心点，此时100，100变成了坐标的0，0
      ctx.translate(100, 100)

      // 创建中心点
      createCenterPointer(ctx)

      // 创建渐变内环
      // createRadialGradient(ctx);

      // 绘制刻度
      drawScale(ctx)
      // 绘制数字
      drawScaleNumber(ctx)

      // 创建指针
      createPointer(ctx)

      ctx.restore()
    }
  }

  /**
   * @desc: 创建时钟
   * @param {*}
   * @return {*}
   */
  const createClock = () => {
    if (canvasRef && canvasRef.current) {
      const canvasTarget = canvasRef.current
      if (canvasTarget) {
        const ctx: CanvasRenderingContext2D = canvasTarget.getContext('2d')
        // 放大两倍，容器再缩小两倍，防止放大的时候模糊
        ctx.scale(2, 2)
        if (ctx) {
          // 渲染函数
          const animloop = () => {
            drawClock(ctx)
            // console.log('canvas');
            requestAnimationFrame(animloop)
          }
          animloop()
        }
      }
    }
  }

  useEffect(() => {
    createClock()
  }, [])

  return (
    <div className={styles.canvasClock}>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvasTarget}></canvas>
    </div>
  )
}

export default CanvasClock
