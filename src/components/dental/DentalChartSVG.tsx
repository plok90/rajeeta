'use client'

import { useMemo } from 'react'

interface DentalChartSVGProps {
  onToothClick: (toothNumber: string) => void
  selectedTooth?: string
  toothStatuses?: Record<string, string>
  dentitionType?: 'permanent' | 'primary'
}

const STATUS_COLORS: Record<string, string> = {
  healthy: '#dcfce7',
  caries: '#fef9c3',
  fractured: '#ffedd5',
  missing: '#e5e7eb',
  requires_treatment: '#fee2e2',
  treatment_in_progress: '#dbeafe',
  treated: '#d1fae5',
  root_canal_treated: '#ede9fe',
  crown: '#fef3c7',
  implant: '#cffafe',
}

const DEFAULT_COLOR = '#ffffff'
const BORDER_COLOR = '#94a3b8'
const SELECTED_COLOR = '#2563eb'

const PERMANENT_TEETH = {
  upperRight: ['18', '17', '16', '15', '14', '13', '12', '11'],
  upperLeft: ['21', '22', '23', '24', '25', '26', '27', '28'],
  lowerLeft: ['31', '32', '33', '34', '35', '36', '37', '38'],
  lowerRight: ['41', '42', '43', '44', '45', '46', '47', '48'],
}

const PRIMARY_TEETH = {
  upperRight: ['55', '54', '53', '52', '51'],
  upperLeft: ['61', '62', '63', '64', '65'],
  lowerLeft: ['71', '72', '73', '74', '75'],
  lowerRight: ['81', '82', '83', '84', '85'],
}

function getToothDisplayNumber(fdiNum: string, isPrimary: boolean): string {
  if (isPrimary) {
    const n = parseInt(fdiNum[1])
    return String.fromCharCode(64 + n)
  }
  return fdiNum[1]
}

function getToothIndex(fdiNum: string, isPrimary: boolean): number {
  return parseInt(fdiNum[1])
}

function getToothWidth(index: number, isPrimary: boolean): number {
  if (isPrimary) {
    const sizes = [0, 18, 16, 17, 22, 24]
    return sizes[index] || 20
  }
  const sizes = [0, 22, 20, 22, 26, 26, 32, 32, 30]
  return sizes[index] || 24
}

function getToothHeight(index: number, isPrimary: boolean): number {
  if (isPrimary) {
    const sizes = [0, 16, 15, 18, 18, 18]
    return sizes[index] || 16
  }
  const sizes = [0, 18, 17, 20, 22, 22, 26, 26, 24]
  return sizes[index] || 22
}

function getToothShape(index: number, w: number, h: number): string {
  const hw = w / 2
  const hh = h / 2
  const r = Math.min(hw, hh) * 0.4

  if (index <= 2) {
    const topW = hw * 0.85
    return `M ${-topW} ${-hh} L ${topW} ${-hh} Q ${hw} ${-hh} ${hw} ${-hh + r} L ${hw} ${hh - r} Q ${hw} ${hh} ${hw - r} ${hh} L ${-hw + r} ${hh} Q ${-hw} ${hh} ${-hw} ${hh - r} L ${-hw} ${-hh + r} Q ${-hw} ${-hh} ${-topW} ${-hh} Z`
  }

  if (index === 3) {
    return `M ${-hw * 0.6} ${-hh} L ${hw * 0.6} ${-hh} Q ${hw * 0.9} ${-hh} ${hw} ${-hh + r * 1.5} L ${hw * 0.7} ${hh} L ${-hw * 0.7} ${hh} L ${-hw} ${-hh + r * 1.5} Q ${-hw * 0.9} ${-hh} ${-hw * 0.6} ${-hh} Z`
  }

  return `M ${-hw + r} ${-hh} L ${hw - r} ${-hh} Q ${hw} ${-hh} ${hw} ${-hh + r} L ${hw} ${hh - r} Q ${hw} ${hh} ${hw - r} ${hh} L ${-hw + r} ${hh} Q ${-hw} ${hh} ${-hw} ${hh - r} L ${-hw} ${-hh + r} Q ${-hw} ${-hh} ${-hw + r} ${-hh} Z`
}

interface ToothPosition {
  x: number
  y: number
  rotation: number
}

function calculateArchPositions(
  teeth: string[],
  centerX: number,
  baseY: number,
  isUpper: boolean,
  isPrimary: boolean
): ToothPosition[] {
  const positions: ToothPosition[] = []
  const count = teeth.length
  const totalSpread = count * 28
  const curveDepth = isPrimary ? 60 : 80

  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5
    const angle = (t - 0.5) * Math.PI * 0.85

    const x = centerX + Math.sin(angle) * (totalSpread * 0.55)
    const yOffset = Math.cos(angle) * curveDepth
    const y = isUpper ? baseY + yOffset : baseY - yOffset

    const rotation = (angle * 180) / Math.PI * (isUpper ? 1 : -1) * 0.3

    positions.push({ x, y, rotation })
  }

  return positions
}

export default function DentalChartSVG({
  onToothClick,
  selectedTooth,
  toothStatuses = {},
  dentitionType = 'permanent',
}: DentalChartSVGProps) {
  const isPrimary = dentitionType === 'primary'
  const quadrants = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH

  const viewBoxWidth = 600
  const viewBoxHeight = 440
  const centerX = viewBoxWidth / 2
  const upperBaseY = 60
  const lowerBaseY = viewBoxHeight - 60

  const allTeethPositions = useMemo(() => {
    const result: { num: string; pos: ToothPosition }[] = []

    const urPositions = calculateArchPositions(
      quadrants.upperRight, centerX, upperBaseY, true, isPrimary
    )
    quadrants.upperRight.forEach((num, i) => {
      result.push({ num, pos: urPositions[i] })
    })

    const ulPositions = calculateArchPositions(
      quadrants.upperLeft, centerX, upperBaseY, true, isPrimary
    )
    quadrants.upperLeft.forEach((num, i) => {
      result.push({ num, pos: ulPositions[i] })
    })

    const lrPositions = calculateArchPositions(
      quadrants.lowerRight, centerX, lowerBaseY, false, isPrimary
    )
    quadrants.lowerRight.forEach((num, i) => {
      result.push({ num, pos: lrPositions[i] })
    })

    const llPositions = calculateArchPositions(
      quadrants.lowerLeft, centerX, lowerBaseY, false, isPrimary
    )
    quadrants.lowerLeft.forEach((num, i) => {
      result.push({ num, pos: llPositions[i] })
    })

    return result
  }, [quadrants, isPrimary, centerX, upperBaseY, lowerBaseY])

  const upperArchPath = useMemo(() => {
    const points = quadrants.upperRight
      .concat(quadrants.upperLeft)
      .map(num => {
        const entry = allTeethPositions.find(e => e.num === num)
        if (!entry) return ''
        return `${entry.pos.x},${entry.pos.y + 20}`
      })
      .filter(Boolean)

    if (points.length < 2) return ''

    const first = points[0]
    const last = points[points.length - 1]
    return `M ${first} Q ${centerX},${upperBaseY + 100} ${last}`
  }, [allTeethPositions, quadrants, centerX, upperBaseY])

  const lowerArchPath = useMemo(() => {
    const points = quadrants.lowerRight
      .concat(quadrants.lowerLeft)
      .map(num => {
        const entry = allTeethPositions.find(e => e.num === num)
        if (!entry) return ''
        return `${entry.pos.x},${entry.pos.y - 20}`
      })
      .filter(Boolean)

    if (points.length < 2) return ''

    const first = points[0]
    const last = points[points.length - 1]
    return `M ${first} Q ${centerX},${lowerBaseY - 100} ${last}`
  }, [allTeethPositions, quadrants, centerX, lowerBaseY])

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', margin: '0 auto' }}
      >
        <text
          x={centerX}
          y={upperBaseY - 30}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#475569"
          fontFamily="system-ui, sans-serif"
        >
          UPPER
        </text>

        <text
          x={centerX}
          y={lowerBaseY + 40}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#475569"
          fontFamily="system-ui, sans-serif"
        >
          LOWER
        </text>

        {upperArchPath && (
          <path
            d={upperArchPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}

        {lowerArchPath && (
          <path
            d={lowerArchPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}

        {allTeethPositions.map(({ num, pos }) => {
          const isSelected = selectedTooth === num
          const status = toothStatuses[num]
          const fillColor = status ? (STATUS_COLORS[status] || DEFAULT_COLOR) : DEFAULT_COLOR
          const index = getToothIndex(num, isPrimary)
          const w = getToothWidth(index, isPrimary)
          const h = getToothHeight(index, isPrimary)
          const displayNum = getToothDisplayNumber(num, isPrimary)
          const shapePath = getToothShape(index, w, h)
          const isUpper = parseInt(num[0]) <= 2

          return (
            <g
              key={num}
              transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}
              onClick={() => onToothClick(num)}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={shapePath}
                fill={fillColor}
                stroke={isSelected ? SELECTED_COLOR : BORDER_COLOR}
                strokeWidth={isSelected ? 2.5 : 1.2}
              />

              <text
                x={0}
                y={isUpper ? 3 : 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={index >= 6 ? 11 : index >= 4 ? 10 : 9}
                fontWeight={isSelected ? '700' : '500'}
                fill={isSelected ? SELECTED_COLOR : '#334155'}
                fontFamily="system-ui, sans-serif"
              >
                {displayNum}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
