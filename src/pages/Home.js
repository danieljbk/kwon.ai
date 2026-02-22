import React, { useRef, useEffect } from 'react'

import './Home.css'
import './HomeCanvas.css'

const SENSITIVITY = 1
const SIBLINGS_LIMIT = 1
const DENSITY = 80
const ANCHOR_LENGTH = 20
const MOUSE_RADIUS = 500
const MAX_BRIGHTNESS = 0.7

function Home() {
  const canvasRef = useRef(null)

  useEffect(() => {
    document.title = 'Joonbeom Kwon'

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const circ = 2 * Math.PI
    let nodes = []
    let nodesQty = 0
    let animId
    const mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }

    function Node(x, y) {
      this.anchorX = x
      this.anchorY = y
      this.x = Math.random() * (x - (x - ANCHOR_LENGTH)) + (x - ANCHOR_LENGTH)
      this.y = Math.random() * (y - (y - ANCHOR_LENGTH)) + (y - ANCHOR_LENGTH)
      this.vx = Math.random() * 2 - 1
      this.vy = Math.random() * 2 - 1
      this.energy = Math.random() * 100
      this.radius = Math.random()
      this.siblings = []
      this.brightness = 0
    }

    Node.prototype.drawNode = function () {
      const color = 'rgba(255, 255, 255, ' + this.brightness + ')'
      ctx.beginPath()
      ctx.arc(
        this.x,
        this.y,
        2 * this.radius + (2 * this.siblings.length) / SIBLINGS_LIMIT,
        0,
        circ,
      )
      ctx.fillStyle = color
      ctx.fill()
    }

    Node.prototype.drawConnections = function () {
      for (let i = 0; i < this.siblings.length; i++) {
        const color = 'rgba(255, 255, 255, ' + this.brightness + ')'
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.siblings[i].x, this.siblings[i].y)
        ctx.lineWidth = 1 - calcDistance(this, this.siblings[i]) / SENSITIVITY
        ctx.strokeStyle = color
        ctx.stroke()
      }
    }

    Node.prototype.moveNode = function () {
      this.energy -= 2
      if (this.energy < 1) {
        this.energy = Math.random() * 100
        if (this.x - this.anchorX < -ANCHOR_LENGTH) {
          this.vx = Math.random() * 2
        } else if (this.x - this.anchorX > ANCHOR_LENGTH) {
          this.vx = Math.random() * -2
        } else {
          this.vx = Math.random() * 4 - 2
        }
        if (this.y - this.anchorY < -ANCHOR_LENGTH) {
          this.vy = Math.random() * 2
        } else if (this.y - this.anchorY > ANCHOR_LENGTH) {
          this.vy = Math.random() * -2
        } else {
          this.vy = Math.random() * 4 - 2
        }
      }
      this.x += (this.vx * this.energy) / 100
      this.y += (this.vy * this.energy) / 100
    }

    function calcDistance(node1, node2) {
      return Math.sqrt(
        Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2),
      )
    }

    function initNodes() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes = []
      nodesQty = 0
      for (let i = DENSITY; i < canvas.width; i += DENSITY) {
        for (let j = DENSITY; j < canvas.height; j += DENSITY) {
          nodes.push(new Node(i, j))
          nodesQty++
        }
      }
    }

    function findSiblings() {
      for (let i = 0; i < nodesQty; i++) {
        const node1 = nodes[i]
        node1.siblings = []
        for (let j = 0; j < nodesQty; j++) {
          const node2 = nodes[j]
          if (node1 !== node2) {
            const distance = calcDistance(node1, node2)
            if (distance < SENSITIVITY) {
              if (node1.siblings.length < SIBLINGS_LIMIT) {
                node1.siblings.push(node2)
              } else {
                let maxDist = 0
                let s
                for (let k = 0; k < SIBLINGS_LIMIT; k++) {
                  const d = calcDistance(node1, node1.siblings[k])
                  if (d > maxDist) {
                    maxDist = d
                    s = k
                  }
                }
                if (distance < maxDist) {
                  node1.siblings.splice(s, 1)
                  node1.siblings.push(node2)
                }
              }
            }
          }
        }
      }
    }

    function redrawScene() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      findSiblings()
      for (let i = 0; i < nodesQty; i++) {
        const node = nodes[i]
        const distance = calcDistance({ x: mouse.x, y: mouse.y }, node)
        if (distance < MOUSE_RADIUS) {
          node.brightness = (1 - distance / MOUSE_RADIUS) * MAX_BRIGHTNESS
        } else {
          node.brightness = 0
        }
      }
      for (let i = 0; i < nodesQty; i++) {
        const node = nodes[i]
        if (node.brightness) {
          node.drawNode()
          node.drawConnections()
        }
        node.moveNode()
      }
      animId = requestAnimationFrame(redrawScene)
    }

    function onMouseMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function onResize() {
      initNodes()
    }

    window.addEventListener('resize', onResize)
    canvas.addEventListener('mousemove', onMouseMove)

    initNodes()
    redrawScene()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <div className='App'>
      <div className='main'>
        <canvas ref={canvasRef} />
        <div className='over'>
          <div className='untouchable'>
            <h1>Joonbeom Kwon</h1>
          </div>
          <div className='socials'>
            <a
              href='https://x.com/djbkwon'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='X'
            >
              <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </a>
            <a
              href='https://www.linkedin.com/in/djkwon/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='LinkedIn'
            >
              <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
              </svg>
            </a>
            <a
              href='https://github.com/danieljbk'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
            >
              <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
